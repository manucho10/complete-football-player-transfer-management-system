// src/pages/Watchlist.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Loader2, Eye, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyWatchlist, removeFromWatchlist } from '../lib/dbService';

const Watchlist = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadWatchlist = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await fetchMyWatchlist(user.id);
            setPlayers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWatchlist();
    }, [user]);

    const handleRemove = async (playerId) => {
        try {
            await removeFromWatchlist(user.id, playerId);
            setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        } catch (error) {
            alert('Failed to remove from watchlist.');
        }
    };

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
                        <Star className="w-5 h-5 text-yellow-400" /> My Watchlist
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {players.length} players
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mb-4" />
                        <p className="text-gray-400">Loading your watchlist...</p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Your watchlist is empty</h3>
                        <p className="text-sm text-gray-400 mb-4">Start scouting and save players you want to track.</p>
                        <button
                            onClick={() => navigate('/players')}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-sm font-semibold px-6 py-2 rounded-lg"
                        >
                            Discover Players
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {players.map((player) => (
                            <div key={player.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden group">
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${player.availability === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {player.availability || 'Unknown'}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(player.id)}
                                            className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                        {player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                    </div>

                                    <h3 className="font-bold text-center truncate">{player.name}</h3>
                                    <p className="text-xs text-gray-400 text-center mb-2">{player.position}</p>

                                    <div className="flex items-center justify-center gap-1 text-green-400 text-sm font-semibold">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                        <span className="text-xs text-gray-400">Market Value</span>
                                        <span className="text-sm font-semibold text-green-400">{player.market_value || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-3 border-t border-gray-700">
                                    <button
                                        onClick={() => navigate(`/players/${player.id}`)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View Full Profile
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

export default Watchlist;