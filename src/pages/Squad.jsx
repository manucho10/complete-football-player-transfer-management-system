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

        fetchSquad();
    };

    const filteredSquad = squad.filter(p =>
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
                        <Users className="w-5 h-5 text-red-600" /> My Squad
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredSquad.length} players
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
                            placeholder="Search your squad..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/players')}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                    >
                        Sign New Player
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                        <p className="text-gray-500">Loading squad...</p>
                    </div>
                ) : filteredSquad.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Your squad is empty</h3>
                        <p className="text-sm text-gray-500 mb-6">Browse the transfer market to sign your first player.</p>
                        <button
                            onClick={() => navigate('/players')}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            Search Players
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSquad.map((player) => (
                            <div key={player.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">

                                <div className="relative p-6 text-center bg-gray-50 border-b border-gray-100">
                                    <div className="w-20 h-20 bg-[#0a2e1f] text-green-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                                        {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{player.name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-3">{player.position}</p>
                                    <div className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-lg text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating}
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 text-sm flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-gray-400" /> Condition</span>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${player.condition === 'Fit' ? 'bg-green-50 text-green-700 border-green-200' :
                                                player.condition === 'Injured' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    player.condition === 'Suspended' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {player.condition || 'Fit'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Contract Ends</span>
                                        <span className="font-bold text-gray-900">
                                            {player.contract_end_date ? new Date(player.contract_end_date).getFullYear() : 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Market Value</span>
                                        <span className="font-bold text-green-600">{player.market_value || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-3 flex gap-2 border-t border-gray-100 bg-gray-50/50">
                                    <button onClick={() => navigate(`/players/${player.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button onClick={() => handleRelease(player.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
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

export default Squad;