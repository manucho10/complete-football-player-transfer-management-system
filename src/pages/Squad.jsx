// src/pages/Squad.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Loader2, Star, Eye, UserMinus, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const Squad = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [squad, setSquad] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchSquad = async () => {
        setIsLoading(true);
        // Fetch players where team_id matches the logged-in Team's ID
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('team_id', user.id)
            .order('position', { ascending: true });

        if (!error) setSquad(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        if (user) fetchSquad();
    }, [user]);

    const handleRelease = async (playerId) => {
        if (!window.confirm('Are you sure you want to release this player to free agency?')) return;

        await supabase
            .from('players')
            .update({ team_id: null, club: 'Free Agent', availability: 'Available' })
            .eq('id', playerId);

        fetchSquad(); // Refresh list
    };

    const filteredSquad = squad.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-400" /> My Squad
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {filteredSquad.length} players
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
                            placeholder="Search your squad..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/players')}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
                    >
                        Sign New Player
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-red-400 mb-4" />
                        <p className="text-gray-400">Loading squad...</p>
                    </div>
                ) : filteredSquad.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Your squad is empty</h3>
                        <p className="text-sm text-gray-400 mb-4">Browse the transfer market to sign your first player.</p>
                        <button
                            onClick={() => navigate('/players')}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2 rounded-lg"
                        >
                            Search Players
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredSquad.map((player) => (
                            <div key={player.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden group">
                                <div className="relative bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                        {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <h3 className="font-bold truncate">{player.name}</h3>
                                    <p className="text-xs text-gray-400">{player.position}</p>
                                    <div className="flex items-center justify-center gap-1 text-green-400 text-sm font-semibold mt-2">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating}
                                    </div>
                                </div>

                                {/* Body: Updated with Condition and Contract */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" /> Condition</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${player.condition === 'Fit' ? 'bg-green-500/20 text-green-400' :
                                            player.condition === 'Injured' ? 'bg-red-500/20 text-red-400' :
                                                player.condition === 'Suspended' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {player.condition || 'Fit'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Contract Ends</span>
                                        <span className="text-white">
                                            {player.contract_end_date ? new Date(player.contract_end_date).getFullYear() : 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-2">
                                        <span className="text-gray-400">Market Value</span>
                                        <span className="font-semibold text-green-400">{player.market_value || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-3 flex gap-2 border-t border-gray-700">
                                    <button onClick={() => navigate(`/players/${player.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-700 text-xs font-semibold py-2 rounded-lg">
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button onClick={() => handleRelease(player.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2 rounded-lg">
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

export default Squad;