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
            // Clear team_id AND scout_club
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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Users className="w-5 h-5 text-red-600" /> My Scouting Network
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredScouts.length} scouts
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your scouts..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/find-scouts')}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                    >
                        Hire New Scout
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                        <p className="text-gray-500">Loading your scouts...</p>
                    </div>
                ) : filteredScouts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No scouts hired yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Build your scouting network to find the best talent.</p>
                        <button
                            onClick={() => navigate('/find-scouts')}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            Hire a Scout
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredScouts.map((scout) => (
                            <div key={scout.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">

                                <div className="p-6 text-center flex-1">
                                    <div className="w-20 h-20 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                                        {scout.full_name?.charAt(0) || 'S'}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{scout.full_name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-5">{scout.country || 'Global Scout'}</p>

                                    <div className="flex flex-col gap-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <span className="flex items-center gap-2 justify-center"><Mail className="w-4 h-4 text-gray-400" /> {scout.email}</span>
                                    </div>
                                </div>

                                <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                                    <button
                                        onClick={() => navigate('/messages')}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                    <button
                                        onClick={() => handleFire(scout.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        <UserMinus className="w-4 h-4" /> Release
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