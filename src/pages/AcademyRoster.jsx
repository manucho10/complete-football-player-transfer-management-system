// src/pages/AcademyRoster.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Loader2, Star, Eye, UserMinus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const AcademyRoster = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchRoster = async () => {
            if (!user) return;
            setIsLoading(true);

            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('academy_id', user.id)
                .order('created_at', { ascending: false });

            if (!error) setPlayers(data || []);
            setIsLoading(false);
        };

        fetchRoster();
    }, [user]);

    const handleRemove = async (playerId) => {
        if (!window.confirm('Are you sure you want to remove this player from your academy?')) return;

        await supabase
            .from('players')
            .update({ academy_id: null })
            .eq('id', playerId);

        setPlayers((prev) => prev.filter(p => p.id !== playerId));
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
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
                        <Users className="w-5 h-5 text-orange-600" /> Academy Roster
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredPlayers.length} players
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
                            placeholder="Search your academy players..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/add-player')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Player
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                        <p className="text-gray-500">Loading your academy roster...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No players registered yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Start building your academy by adding your first grassroots player.</p>
                        <button
                            onClick={() => navigate('/add-player')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            Add Your First Player
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map((player) => (
                            <div key={player.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">

                                <div className="relative p-6 text-center bg-gray-50 border-b border-gray-100">
                                    <div className="absolute top-4 right-4">
                                        {player.is_grassroots && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
                                                🌱 Grassroots
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm border border-orange-200">
                                        {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{player.name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-3">{player.position}</p>
                                    <div className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-lg text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 text-sm flex-1">
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Age</span>
                                        <span className="font-bold text-gray-900">{player.age}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Nationality</span>
                                        <span className="font-bold text-gray-900 truncate max-w-[100px]">{player.nationality || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Value</span>
                                        <span className="font-bold text-green-600">{player.market_value || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-3 flex gap-2 border-t border-gray-100 bg-gray-50/50">
                                    <button onClick={() => navigate(`/players/${player.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button onClick={() => handleRemove(player.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                                        <UserMinus className="w-4 h-4" /> Remove
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

export default AcademyRoster;