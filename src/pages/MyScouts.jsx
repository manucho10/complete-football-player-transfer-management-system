// src/pages/MyScouts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Loader2, Mail, MessageSquare, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchHiredScouts } from '../lib/dbService';
import { supabase } from '../lib/SupabaseClient';

const MyScouts = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scouts, setScouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadScouts = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await fetchHiredScouts(user.id);
            setScouts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadScouts();
    }, [loadScouts]);

    const handleFire = async (scoutId) => {
        if (!window.confirm('Are you sure you want to release this scout from your team?')) return;

        try {
            // ⭐ Clear team_id AND scout_club
            await supabase
                .from('profiles')
                .update({ team_id: null, scout_club: null })
                .eq('id', scoutId);

            setScouts((prev) => prev.filter((s) => s.id !== scoutId));
        } catch (error) {
            alert('Failed to release scout.');
        }
    };

    const filteredScouts = scouts.filter(s =>
        s.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-400" /> My Scouting Network
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {filteredScouts.length} scouts
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your scouts..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/find-scouts')}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
                    >
                        Hire New Scout
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-red-400 mb-4" />
                        <p className="text-gray-400">Loading your scouts...</p>
                    </div>
                ) : filteredScouts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No scouts hired yet</h3>
                        <p className="text-sm text-gray-400 mb-4">Build your scouting network to find the best talent.</p>
                        <button
                            onClick={() => navigate('/find-scouts')}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2 rounded-lg"
                        >
                            Hire a Scout
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredScouts.map((scout) => (
                            <div key={scout.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
                                <div className="p-6 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                        {scout.full_name?.charAt(0) || 'S'}
                                    </div>
                                    <h3 className="font-bold text-lg truncate">{scout.full_name}</h3>
                                    <p className="text-xs text-gray-400 mb-4">{scout.country || 'Global Scout'}</p>

                                    <div className="flex flex-col gap-2 text-xs text-gray-400 bg-gray-700/30 rounded-lg p-3 mb-4">
                                        <span className="flex items-center gap-2 justify-center"><Mail className="w-3 h-3" /> {scout.email}</span>
                                    </div>
                                </div>

                                <div className="p-3 border-t border-gray-700 flex gap-2">
                                    <button
                                        onClick={() => navigate('/messages')}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Message
                                    </button>
                                    <button
                                        onClick={() => handleFire(scout.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        <UserMinus className="w-3.5 h-3.5" /> Release
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyScouts;