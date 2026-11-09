// src/pages/BrowseClubs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Shield, Loader2, DollarSign, Award, Eye, X } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';

const BrowseClubs = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchClubs = async () => {
            setIsLoading(true);
            // Fetch all profiles where the role is 'team'
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'team')
                .order('full_name', { ascending: true });

            if (!error && data) {
                setClubs(data);
            }
            setIsLoading(false);
        };

        fetchClubs();
    }, []);

    const filteredClubs = clubs.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.league?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" /> Browse Clubs
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {filteredClubs.length} clubs
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by club name or league..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
                        <p className="text-gray-400">Loading clubs...</p>
                    </div>
                ) : filteredClubs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-1">No clubs found</h3>
                        <p className="text-sm text-gray-400">Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClubs.map((club) => (
                            <div key={club.id} className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all group">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        {/* Club Logo / Initials */}
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                                            {club.team_name ? club.team_name.substring(0, 2).toUpperCase() : club.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">{club.team_name || club.full_name}</h3>
                                            <p className="text-sm text-blue-400 flex items-center gap-1 mt-1">
                                                <Award className="w-3.5 h-3.5" /> {club.league || 'Unknown League'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-300 bg-gray-700/30 p-3 rounded-lg mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Transfer Budget</span>
                                            <span className="font-semibold text-green-400 flex items-center">
                                                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                                {club.transfer_budget ? (club.transfer_budget / 1000000).toFixed(1) + 'M' : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Country</span>
                                            <span className="font-semibold">{club.country || 'Global'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/clubs/${club.id}`)}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <Eye className="w-4 h-4" /> View Club Profile
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

export default BrowseClubs;