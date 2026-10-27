// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
    Check, CheckCheck, Image as ImageIcon, FileText, X, MessageSquare, Circle, Loader2
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

    // Supabase State
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1. Load Conversations on mount
    useEffect(() => {
        if (!user) return;

        const fetchConvs = async () => {
            setIsLoadingConversations(true);
            const data = await getConversations(user.id);
            setConversations(data);
            setIsLoadingConversations(false);
        };

        fetchConvs();
    }, [user]);

    // 2. Load Messages when a conversation is selected + Setup Realtime
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

        // Setup Realtime Subscription for new messages in this conversation
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
                    // Append new message
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

                    // Update conversation last message in sidebar
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

    // Auto scroll
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Handlers
    const handleSelectConversation = (id) => {
        setSelectedId(id);
        setSearchParams({ with: id });
        setShowMobileThread(true);
    };

    const handleSend = async () => {
        if (!messageInput.trim() || !selectedId || !user) return;

        const text = messageInput.trim();
        setMessageInput(''); // Clear immediately for UX

        try {
            await sendMessage(selectedId, user.id, text);
            // Realtime subscription will handle adding it to the UI
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
        player: 'bg-blue-500/20 text-blue-400',
        agent: 'bg-purple-500/20 text-purple-400',
        scout: 'bg-green-500/20 text-green-400',
        team: 'bg-red-500/20 text-red-400',
    };

    const getInitials = (name) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-400" /> Messages
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden h-[calc(100vh-180px)] flex">

                    {/* CONVERSATION LIST */}
                    <div className={`w-full sm:w-80 border-r border-gray-700 flex-col ${showMobileThread ? 'hidden sm:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoadingConversations ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-sm text-gray-500">No conversations found</div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className={`w-full p-4 text-left border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors flex items-start gap-3 ${selectedId === conv.id ? 'bg-gray-700/50' : ''}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {getInitials(conv.participant.name)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-sm font-semibold truncate">{conv.participant.name}</p>
                                                <span className="text-xs text-gray-500 flex-shrink-0">{conv.lastTime}</span>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${roleBadge[conv.participant.role]}`}>
                                                {conv.participant.role}
                                            </span>
                                            <p className="text-xs text-gray-400 truncate mt-1">{conv.lastMessage}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CHAT THREAD */}
                    <div className={`flex-1 flex-col ${!showMobileThread ? 'hidden sm:flex' : 'flex'}`}>
                        {!selectedId || !selectedConversation ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Select a conversation</h3>
                                <p className="text-sm text-gray-400 max-w-xs">Choose a conversation from the list to start chatting</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/30">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button onClick={() => setShowMobileThread(false)} className="sm:hidden p-1 hover:bg-gray-700 rounded-lg">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {getInitials(selectedConversation.participant.name)}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{selectedConversation.participant.name}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">Online</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><Phone className="w-4 h-4 text-gray-400" /></button>
                                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><Video className="w-4 h-4 text-gray-400" /></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/20">
                                    {isLoadingMessages ? (
                                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-gray-500 text-sm mt-10">No messages yet. Say hello!</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-sm' : 'bg-gray-700/70 text-gray-100 rounded-bl-sm'}`}>
                                                        <p className="text-sm break-words">{msg.text}</p>
                                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
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

                                <div className="p-4 border-t border-gray-700 bg-gray-800/30">
                                    <div className="flex items-end gap-2">
                                        <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2.5 rounded-lg hover:bg-gray-700 text-gray-400"><Paperclip className="w-5 h-5" /></button>
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none max-h-32"
                                                style={{ minHeight: '44px' }}
                                            />
                                        </div>
                                        <button onClick={handleSend} disabled={!messageInput.trim()} className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 disabled:opacity-40 rounded-lg transition-all"><Send className="w-5 h-5" /></button>
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