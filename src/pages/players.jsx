// src/pages/Players.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Filter, X, Star, Calendar, Eye, Target, Globe,
    Building2, SlidersHorizontal, ChevronDown, Check, Users, BarChart3,
    Plus, Heart, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPlayers } from '../lib/dbService';
import CompareModal from '../components/players/CompareModal';
import { supabase } from '../lib/SupabaseClient';

const Players = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('rating');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        position: '', nationality: '', minAge: '', maxAge: '', minRating: '', club: '', availability: '',
    });

    useEffect(() => {
        const loadPlayers = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPlayers();
                setPlayers(data);
            } catch (error) {
                console.error('Failed to load players:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPlayers();
    }, []);

    useEffect(() => {
        const loadWatchlist = async () => {
            if (!user) return;
            const { data } = await supabase.from('watchlists').select('player_id').eq('user_id', user.id);
            if (data) setWatchlist(data.map(item => item.player_id));
        };
        loadWatchlist();
    }, [user]);

    const filteredPlayers = useMemo(() => {
        let result = players.filter((p) => {
            const matchesSearch = !searchQuery ||
                (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.nationality && p.nationality.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPosition = !filters.position || p.position === filters.position;
            const matchesNationality = !filters.nationality || (p.nationality && p.nationality.toLowerCase().includes(filters.nationality.toLowerCase()));
            const matchesClub = !filters.club || (p.club && p.club.toLowerCase().includes(filters.club.toLowerCase()));
            const matchesAvailability = !filters.availability || p.availability === filters.availability;
            const matchesMinAge = !filters.minAge || p.age >= Number(filters.minAge);
            const matchesMaxAge = !filters.maxAge || p.age <= Number(filters.maxAge);
            const matchesMinRating = !filters.minRating || p.rating >= Number(filters.minRating);

            return matchesSearch && matchesPosition && matchesNationality && matchesClub && matchesAvailability && matchesMinAge && matchesMaxAge && matchesMinRating;
        });

        result.sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'age-asc') return a.age - b.age;
            if (sortBy === 'age-desc') return b.age - a.age;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        return result;
    }, [players, searchQuery, filters, sortBy]);

    const playersToCompare = useMemo(() => players.filter((p) => compareList.includes(p.id)), [players, compareList]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ position: '', nationality: '', minAge: '', maxAge: '', minRating: '', club: '', availability: '' });
        setSearchQuery('');
    };

    const toggleWatchlist = async (playerId) => {
        if (!user) return;
        try {
            if (watchlist.includes(playerId)) {
                await supabase.from('watchlists').delete().eq('user_id', user.id).eq('player_id', playerId);
                setWatchlist((prev) => prev.filter((id) => id !== playerId));
            } else {
                await supabase.from('watchlists').insert({ user_id: user.id, player_id: playerId });
                setWatchlist((prev) => [...prev, playerId]);
            }
        } catch (error) {
            console.error('Failed to update watchlist:', error);
            alert('Failed to update watchlist');
        }
    };

    const toggleCompare = (id) => {
        setCompareList((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const handleCompareClick = () => {
        if (playersToCompare.length >= 2) setShowCompareModal(true);
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    if (!user) return null;
    const canAccess = ['scout', 'team', 'agent'].includes(user.role);

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
                <div className="text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                    <p className="text-gray-500 mb-6">Only scouts, teams, and agents can browse players.</p>
                    <button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Search className="w-5 h-5 text-green-600" /> Player Search
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredPlayers.length} players
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Search + Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, club, or nationality..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all border shadow-sm ${showFilters || activeFilterCount > 0
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer shadow-sm"
                        >
                            <option value="rating">Top Rated</option>
                            <option value="age-asc">Youngest</option>
                            <option value="age-desc">Oldest</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 animate-fadeIn shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-green-600" /> Advanced Filters
                            </h3>
                            <button onClick={clearFilters} className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors">
                                Clear all
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Position</label>
                                <select name="position" value={filters.position} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">All positions</option>
                                    <option value="Goalkeeper">Goalkeeper</option>
                                    <option value="Defender">Defender</option>
                                    <option value="Midfielder">Midfielder</option>
                                    <option value="Forward">Forward</option>
                                    <option value="Winger">Winger</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nationality</label>
                                <input type="text" name="nationality" value={filters.nationality} onChange={handleFilterChange} placeholder="e.g., Brazil" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Current Club</label>
                                <input type="text" name="club" value={filters.club} onChange={handleFilterChange} placeholder="e.g., Ajax" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Availability</label>
                                <select name="availability" value={filters.availability} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">Any</option>
                                    <option value="Available">Available</option>
                                    <option value="Under Contract">Under Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Min Age</label>
                                <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange} placeholder="16" min="16" max="45" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Max Age</label>
                                <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} placeholder="35" min="16" max="45" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Min Rating</label>
                                <input type="number" name="minRating" value={filters.minRating} onChange={handleFilterChange} placeholder="8.0" min="0" max="10" step="0.1" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Compare Bar */}
                {compareList.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 animate-slideDown shadow-sm">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                                <span className="font-bold text-green-700">{compareList.length}</span> player{compareList.length > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setCompareList([])} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                                Clear
                            </button>
                            <button onClick={handleCompareClick} disabled={compareList.length < 2} className="px-4 py-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all shadow-sm">
                                Compare Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Players Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading players from database...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No players found</h3>
                        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search.</p>
                        <button onClick={clearFilters} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors shadow-sm">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map((player) => (
                            <div key={player.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col">

                                <div className="relative p-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${player.availability === 'Available'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {player.availability}
                                        </span>
                                        <button onClick={() => toggleWatchlist(player.id)} className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Add to watchlist">
                                            <Heart className={`w-4 h-4 ${watchlist.includes(player.id) ? 'fill-red-500 text-red-500 border-red-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>

                                    <div className="w-16 h-16 bg-[#0a2e1f] text-green-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-sm">
                                        {player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-center truncate">{player.name}</h3>
                                    <p className="text-xs font-medium text-gray-500 text-center mb-2">{player.position}</p>

                                    <div className="flex items-center justify-center gap-1 text-yellow-600 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        {player.rating || 'N/A'}
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{player.club || 'Free Agent'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <span>{player.nationality || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>Age {player.age || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-gray-500 font-medium">Market Value</span>
                                            <span className="text-sm font-bold text-green-600">
                                                {player.market_value || 'N/A'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                                                <p className="text-sm font-bold text-gray-900">{player.goals || 0}</p>
                                                <p className="text-[10px] font-medium text-gray-500 uppercase">Goals</p>
                                            </div>
                                            <div className="text-center bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                                                <p className="text-sm font-bold text-gray-900">{player.assists || 0}</p>
                                                <p className="text-[10px] font-medium text-gray-500 uppercase">Assists</p>
                                            </div>
                                            <div className="text-center bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                                                <p className="text-sm font-bold text-gray-900">{player.matches || 0}</p>
                                                <p className="text-[10px] font-medium text-gray-500 uppercase">Matches</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                                    <button onClick={() => navigate(`/players/${player.id}`)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 rounded-xl transition-colors shadow-sm">
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                        onClick={() => toggleCompare(player.id)}
                                        disabled={compareList.length >= 3 && !compareList.includes(player.id)}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-colors border shadow-sm ${compareList.includes(player.id)
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {compareList.includes(player.id) ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Compare</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PLAYER DETAIL MODAL */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedPlayer(null)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>

                        <div className="relative bg-gray-50 border-b border-gray-200 p-6">
                            <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-[#0a2e1f] text-green-400 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-sm">
                                    {selectedPlayer.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-bold text-gray-900 truncate">{selectedPlayer.name}</h2>
                                    <p className="text-gray-500 font-medium">{selectedPlayer.position}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded font-bold">
                                            <Star className="w-4 h-4 fill-current" /> {selectedPlayer.rating}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-bold text-gray-900">{selectedPlayer.market_value}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                    <Building2 className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Club</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{selectedPlayer.club || 'Free Agent'}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                    <Globe className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nationality</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedPlayer.nationality || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Age</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedPlayer.age || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-600" /> About
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedPlayer.bio || 'No bio available.'}</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-green-600" /> Performance Stats
                                </h3>
                                <div className="space-y-3">
                                    {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((key) => {
                                        const value = selectedPlayer[key] || 0;
                                        return (
                                            <div key={key} className="flex items-center gap-4">
                                                <span className="text-xs font-bold text-gray-500 capitalize w-20">{key}</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${value}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 w-8 text-right">{value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => toggleWatchlist(selectedPlayer.id)}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border shadow-sm ${watchlist.includes(selectedPlayer.id)
                                            ? 'bg-red-50 text-red-600 border-red-200'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Heart className={`w-4 h-4 ${watchlist.includes(selectedPlayer.id) ? 'fill-current' : ''}`} />
                                    {watchlist.includes(selectedPlayer.id) ? 'In Watchlist' : 'Watchlist'}
                                </button>
                                <button
                                    onClick={() => navigate(`/players/${selectedPlayer.id}`)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm"
                                >
                                    <Eye className="w-4 h-4" /> View Full Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPARE MODAL */}
            {showCompareModal && (
                <CompareModal players={playersToCompare} onClose={() => setShowCompareModal(false)} />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}} />
        </div>
    );
};

export default Players;