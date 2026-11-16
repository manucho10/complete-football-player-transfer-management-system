import React, { useState } from 'react';
import { Search, Send, User } from 'lucide-react';

const AcademyMessages = () => {
    const [activeChat, setActiveChat] = useState(0);

    // Mock data for the chat list
    const chats = [
        { id: 0, name: "Manchester City Scout", player: "Samuel Osei", lastMessage: "I will be at the game Saturday.", time: "10:42 AM", unread: true },
        { id: 1, name: "FC Barcelona Academy", player: "John Doe", lastMessage: "We've sent over the trial documents.", time: "Yesterday", unread: false },
        { id: 2, name: "Agent: Mark Smith", player: "David Musa", lastMessage: "Let me know when you review the offer.", time: "Tuesday", unread: false },
    ];

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Left Sidebar: Chat List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Search scouts or clubs..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition-all outline-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat, idx) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(idx)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeChat === idx ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{chat.name}</h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap">{chat.time}</span>
                            </div>
                            <p className="text-xs text-green-700 font-medium mb-1">Re: {chat.player}</p>
                            <p className={`text-sm truncate ${chat.unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Active Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="font-bold text-gray-900">{chats[activeChat].name}</h2>
                        <p className="text-xs text-gray-500">Discussing: <span className="font-semibold text-green-600">{chats[activeChat].player}</span></p>
                    </div>
                    <button className="text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">View Player Profile</button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">

                    {/* Incoming Message */}
                    <div className="flex items-end gap-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-gray-600" /></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                            <p className="text-sm text-gray-800">Hello, I'm scouting for Man City. I wanted to ask about Samuel's availability for a trial next month.</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">10:40 AM</span>
                        </div>
                    </div>

                    {/* Outgoing Message */}
                    <div className="flex items-end gap-2 max-w-[80%] self-end flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AC</div>
                        <div className="bg-green-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm">
                            <p className="text-sm">Hi! Yes, Samuel has been excellent. We would be open to a trial. Can you send over the formal request through the Transfer Requests tab?</p>
                            <span className="text-[10px] text-green-200 mt-1 block text-right">10:42 AM</span>
                        </div>
                    </div>

                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                        <input type="text" placeholder="Type your message..." className="flex-1 px-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition-colors">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default AcademyMessages;