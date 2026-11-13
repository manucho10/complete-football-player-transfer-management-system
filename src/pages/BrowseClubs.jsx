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
        <div className="min-h-screen bg-gray-50 text-gray-900">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Shield className="w-5 h-5 text-blue-600" /> Browse Clubs
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredClubs.length} clubs
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by club name or league..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500">Loading clubs...</p>
                    </div>
                ) : filteredClubs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No clubs found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClubs.map((club) => (
                            <div key={club.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        {/* Club Logo / Initials */}
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center text-2xl font-bold">
                                            {club.team_name ? club.team_name.substring(0, 2).toUpperCase() : club.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{club.team_name || club.full_name}</h3>
                                            <p className="text-sm text-blue-600 font-medium flex items-center gap-1.5 mt-1">
                                                <Award className="w-4 h-4" /> {club.league || 'Unknown League'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Transfer Budget</span>
                                            <span className="font-bold text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                                {club.transfer_budget ? (club.transfer_budget / 1000000).toFixed(1) + 'M' : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Country</span>
                                            <span className="font-semibold text-gray-900">{club.country || 'Global'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                    <button
                                        onClick={() => navigate(`/clubs/${club.id}`)}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
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