// src/pages/GrassrootsHub.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, MapPin, GraduationCap, Star, Eye, Filter,
    SlidersHorizontal, Loader2, Users, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const GrassrootsHub = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadGrassrootsPlayers = async () => {
            setIsLoading(true);

            // 1. Fetch ONLY grassroots players (Simpler query, no joins)
            const { data: playersData, error } = await supabase
                .from('players')
                .select('*')
                .eq('is_grassroots', true)
                .eq('profile_public', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching grassroots players:", error);
                setIsLoading(false);
                return;
            }

            // 2. Fetch academy profiles for these players
            const academyIds = [...new Set(playersData.map(p => p.academy_id).filter(Boolean))];
            let profilesData = [];

            if (academyIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, academy_name, academy_location')
                    .in('id', academyIds);
                profilesData = profiles || [];
            }

            // 3. Combine the data
            const combinedData = playersData.map(player => ({
                ...player,
                academy: profilesData.find(prof => prof.id === player.academy_id) || null
            }));

            setPlayers(combinedData);
            setIsLoading(false);
        };

        loadGrassrootsPlayers();
    }, []);
    const filteredPlayers = players.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = !locationFilter ||
            (p.academy?.academy_location && p.academy.academy_location.toLowerCase().includes(locationFilter.toLowerCase())) ||
            (p.nationality && p.nationality.toLowerCase().includes(locationFilter.toLowerCase()));
        return matchesSearch && matchesLocation;
    });

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
                        <GraduationCap className="w-5 h-5 text-orange-600" /> Grassroots Hub
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredPlayers.length} undiscovered players
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Hero Header */}
                <div className="bg-[#0a2e1f] rounded-2xl p-8 mb-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
                            Discover Tomorrow's Stars Today <Sparkles className="w-6 h-6 text-yellow-400" />
                        </h2>
                        <p className="text-gray-300">
                            Search through raw talent registered by local academies, schools, and community coaches. Find the next generational talent before anyone else does.
                        </p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by player name..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="Filter by region..."
                            className="w-full sm:w-64 bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Players Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                        <p className="text-gray-500">Loading grassroots talent...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No grassroots players found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search or region filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map((player) => (
                            <div key={player.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative group">

                                {/* Grassroots Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
                                        🌱 Grassroots
                                    </span>
                                </div>

                                <div className="p-6 text-center bg-gray-50 border-b border-gray-100">
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 mt-2 shadow-sm border border-orange-200">
                                        {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{player.name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-2">{player.position} • Age {player.age}</p>

                                    {/* Academy Info */}
                                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        {player.academy?.academy_name || player.club || 'Local Academy'}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{player.academy?.academy_location || player.nationality || 'Unknown Region'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/players/${player.id}`)}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-orange-600 hover:border-orange-300 text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm"
                                    >
                                        <Eye className="w-4 h-4" /> View Profile
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

export default GrassrootsHub;