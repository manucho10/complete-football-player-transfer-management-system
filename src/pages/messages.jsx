// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
    Check, CheckCheck, Image as ImageIcon, FileText, X, MessageSquare, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';
import { getConversations, getMessages, sendMessage } from '../lib/messageService';

const Messages = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedId, setSelectedId] = useState(searchParams.get('with') || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showMobileThread, setShowMobileThread] = useState(false);

    // Data State
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // ================================================================
    // 1. FETCH CONVERSATIONS
    // ================================================================
    useEffect(() => {
        if (!user) return;

        const fetchConvs = async () => {
            setIsLoadingConversations(true);
            const data = await getConversations(user.id);
            setConversations(data);
            setIsLoadingConversations(false);
        };

        fetchConvs();

        const globalChannel = supabase
            .channel('public:conversations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConvs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(globalChannel);
        };
    }, [user]);

    // ================================================================
    // 2. FETCH MESSAGES & SETUP REAL-TIME
    // ================================================================
    useEffect(() => {
        if (!selectedId) return;

        let channel;

        const loadMessages = async () => {
            setIsLoadingMessages(true);
            const data = await getMessages(selectedId);
            setMessages(data);
            setIsLoadingMessages(false);
            scrollToBottom();
        };

        loadMessages();

        channel = supabase
            .channel(`chat_${selectedId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedId}`,
                },
                (payload) => {
                    const newMsg = payload.new;

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: newMsg.id,
                            sender_id: newMsg.sender_id,
                            text: newMsg.text,
                            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            read: newMsg.read,
                        },
                    ]);

                    scrollToBottom();

                    setConversations((prev) =>
                        prev.map((c) =>
                            c.id === selectedId
                                ? { ...c, lastMessage: newMsg.text, lastTime: 'Just now' }
                                : c
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [selectedId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // ================================================================
    // HANDLERS
    // ================================================================
    const handleSelectConversation = (id) => {
        setSelectedId(id);
        setSearchParams({ with: id });
        setShowMobileThread(true);
    };

    const handleSend = async () => {
        if (!messageInput.trim() || !selectedId || !user) return;

        const text = messageInput.trim();
        setMessageInput('');

        try {
            await sendMessage(selectedId, user.id, text);
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null;

    const selectedConversation = conversations.find((c) => c.id === selectedId);
    const filteredConversations = conversations.filter((c) =>
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roleBadge = {
        player: 'bg-blue-50 text-blue-700 border-blue-200',
        agent: 'bg-purple-50 text-purple-700 border-purple-200',
        scout: 'bg-green-50 text-green-700 border-green-200',
        team: 'bg-red-50 text-red-700 border-red-200',
    };

    const getInitials = (name) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <MessageSquare className="w-5 h-5 text-green-600" /> Messages
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-180px)] flex">

                    {/* CONVERSATION LIST */}
                    <div className={`w-full sm:w-80 border-r border-gray-200 flex-col bg-white ${showMobileThread ? 'hidden sm:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoadingConversations ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-sm text-gray-500">No conversations found</div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedId === conv.id ? 'bg-green-50/50' : ''}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                                {getInitials(conv.participant.name)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-sm font-bold text-gray-900 truncate">{conv.participant.name}</p>
                                                <span className="text-xs text-gray-500 flex-shrink-0">{conv.lastTime}</span>
                                            </div>
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide mb-1 ${roleBadge[conv.participant.role]}`}>
                                                {conv.participant.role}
                                            </span>
                                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CHAT THREAD */}
                    <div className={`flex-1 flex-col bg-white ${!showMobileThread ? 'hidden sm:flex' : 'flex'}`}>
                        {!selectedId || !selectedConversation ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
                                <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <MessageSquare className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Select a conversation</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Choose a conversation from the list to start chatting</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button onClick={() => setShowMobileThread(false)} className="sm:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                                {getInitials(selectedConversation.participant.name)}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{selectedConversation.participant.name}</p>
                                            <p className="text-xs text-green-600 font-medium">Online</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"><Phone className="w-4 h-4" /></button>
                                        <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"><Video className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                    {isLoadingMessages ? (
                                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-gray-500 text-sm mt-10">No messages yet. Say hello!</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'}`}>
                                                        <p className="text-sm break-words">{msg.text}</p>
                                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                                            {msg.time}
                                                            {isMe && <span>{msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                                    <div className="flex items-end gap-2">
                                        <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"><Paperclip className="w-5 h-5" /></button>
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none max-h-32"
                                                style={{ minHeight: '44px' }}
                                            />
                                        </div>
                                        <button onClick={handleSend} disabled={!messageInput.trim()} className="p-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-all shadow-sm"><Send className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;