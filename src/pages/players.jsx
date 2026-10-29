// src/pages/Players.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    X,
    Star,
    Calendar,
    Eye,
    Target,
    Globe,
    Building2,
    SlidersHorizontal,
    ChevronDown,
    Check,
    Users,
    BarChart3,
    Plus,
    Heart,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPlayers } from '../lib/dbService';
import CompareModal from '../components/players/CompareModal'; // ⭐ Imported Modal

const Players = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // ================================================================
    // STATE
    // ================================================================
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('rating');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false); // ⭐ New State

    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        position: '',
        nationality: '',
        minAge: '',
        maxAge: '',
        minRating: '',
        club: '',
        availability: '',
    });

    // ================================================================
    // FETCH FROM SUPABASE
    // ================================================================
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

    // ================================================================
    // FILTER + SORT
    // ================================================================
    const filteredPlayers = useMemo(() => {
        let result = players.filter((p) => {
            const matchesSearch =
                !searchQuery ||
                (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.nationality && p.nationality.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPosition = !filters.position || p.position === filters.position;
            const matchesNationality =
                !filters.nationality ||
                (p.nationality && p.nationality.toLowerCase().includes(filters.nationality.toLowerCase()));
            const matchesClub =
                !filters.club || (p.club && p.club.toLowerCase().includes(filters.club.toLowerCase()));
            const matchesAvailability = !filters.availability || p.availability === filters.availability;
            const matchesMinAge = !filters.minAge || p.age >= Number(filters.minAge);
            const matchesMaxAge = !filters.maxAge || p.age <= Number(filters.maxAge);
            const matchesMinRating = !filters.minRating || p.rating >= Number(filters.minRating);

            return (
                matchesSearch &&
                matchesPosition &&
                matchesNationality &&
                matchesClub &&
                matchesAvailability &&
                matchesMinAge &&
                matchesMaxAge &&
                matchesMinRating
            );
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

    // ================================================================
    // HANDLERS
    // ================================================================
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            position: '',
            nationality: '',
            minAge: '',
            maxAge: '',
            minRating: '',
            club: '',
            availability: '',
        });
        setSearchQuery('');
    };

    const toggleWatchlist = (id) => {
        setWatchlist((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleCompare = (id) => {
        setCompareList((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    if (!user) return null;

    const canAccess = ['scout', 'team', 'agent'].includes(user.role);

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                    <p className="text-gray-400 mb-4">Only scouts, teams, and agents can browse players.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Search className="w-5 h-5 text-green-400" />
                        Player Search
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {filteredPlayers.length} players
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Search + Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, club, or nationality..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${showFilters || activeFilterCount > 0
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-gray-800/50 border border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-green-500 cursor-pointer"
                        >
                            <option value="rating">Top Rated</option>
                            <option value="age-asc">Youngest</option>
                            <option value="age-desc">Oldest</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-5 mb-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Filter className="w-4 h-4 text-green-400" />
                                Advanced Filters
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Position</label>
                                <select
                                    name="position"
                                    value={filters.position}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="">All positions</option>
                                    <option value="Goalkeeper">Goalkeeper</option>
                                    <option value="Defender">Defender</option>
                                    <option value="Midfielder">Midfielder</option>
                                    <option value="Forward">Forward</option>
                                    <option value="Winger">Winger</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={filters.nationality}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., Brazil"
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Club</label>
                                <input
                                    type="text"
                                    name="club"
                                    value={filters.club}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., Ajax"
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Availability</label>
                                <select
                                    name="availability"
                                    value={filters.availability}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="">Any</option>
                                    <option value="Available">Available</option>
                                    <option value="Under Contract">Under Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Age</label>
                                <input
                                    type="number"
                                    name="minAge"
                                    value={filters.minAge}
                                    onChange={handleFilterChange}
                                    placeholder="16"
                                    min="16"
                                    max="45"
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Max Age</label>
                                <input
                                    type="number"
                                    name="maxAge"
                                    value={filters.maxAge}
                                    onChange={handleFilterChange}
                                    placeholder="35"
                                    min="16"
                                    max="45"
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Rating</label>
                                <input
                                    type="number"
                                    name="minRating"
                                    value={filters.minRating}
                                    onChange={handleFilterChange}
                                    placeholder="8.0"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Compare Bar */}
                {compareList.length > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 animate-slideDown">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-green-400" />
                            <span className="text-sm">
                                <span className="font-semibold text-green-400">{compareList.length}</span> player
                                {compareList.length > 1 ? 's' : ''} selected for comparison
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCompareList([])}
                                className="px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Clear
                            </button>

                            {/* ⭐ Wired up Compare Now Button ⭐ */}
                            <button
                                onClick={() => setShowCompareModal(true)}
                                disabled={compareList.length < 2}
                                className="px-4 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
                            >
                                Compare Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Players Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                        <p className="text-gray-400">Loading players from database...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No players found</h3>
                        <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or search</p>
                        <button
                            onClick={clearFilters}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPlayers.map((player) => (
                            <div
                                key={player.id}
                                className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 hover:border-green-500/50 transition-all overflow-hidden group"
                            >
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${player.availability === 'Available'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {player.availability}
                                        </span>
                                        <button
                                            onClick={() => toggleWatchlist(player.id)}
                                            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                                            aria-label="Add to watchlist"
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${watchlist.includes(player.id)
                                                        ? 'fill-red-500 text-red-500'
                                                        : 'text-gray-400'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                        {player.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')}
                                    </div>

                                    <h3 className="font-bold text-center truncate">{player.name}</h3>
                                    <p className="text-xs text-gray-400 text-center mb-2">{player.position}</p>

                                    <div className="flex items-center justify-center gap-1 text-green-400 text-sm font-semibold">
                                        <Star className="w-4 h-4 fill-current" />
                                        {player.rating || 'N/A'}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span className="truncate">{player.club || 'Free Agent'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>{player.nationality || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Age {player.age || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                        <span className="text-xs text-gray-400">Market Value</span>
                                        <span className="text-sm font-semibold text-green-400">
                                            {player.market_value || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 pt-2">
                                        <div className="text-center bg-gray-700/30 rounded p-1.5">
                                            <p className="text-sm font-bold">{player.goals || 0}</p>
                                            <p className="text-[10px] text-gray-500">Goals</p>
                                        </div>
                                        <div className="text-center bg-gray-700/30 rounded p-1.5">
                                            <p className="text-sm font-bold">{player.assists || 0}</p>
                                            <p className="text-[10px] text-gray-500">Assists</p>
                                        </div>
                                        <div className="text-center bg-gray-700/30 rounded p-1.5">
                                            <p className="text-sm font-bold">{player.matches || 0}</p>
                                            <p className="text-[10px] text-gray-500">Matches</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-3 border-t border-gray-700 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/players/${player.id}`)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                        onClick={() => toggleCompare(player.id)}
                                        disabled={compareList.length >= 3 && !compareList.includes(player.id)}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${compareList.includes(player.id)
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-700/50 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {compareList.includes(player.id) ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" /> Added
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" /> Compare
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==================== PLAYER DETAIL MODAL ==================== */}
            {selectedPlayer && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedPlayer(null)}
                >
                    <div
                        className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6">
                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                                    {selectedPlayer.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-bold truncate">{selectedPlayer.name}</h2>
                                    <p className="text-gray-400 text-sm">{selectedPlayer.position}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="flex items-center gap-1 text-green-400 font-semibold">
                                            <Star className="w-4 h-4 fill-current" /> {selectedPlayer.rating}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-400">{selectedPlayer.market_value}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                    <Building2 className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Club</p>
                                    <p className="text-sm font-semibold truncate">{selectedPlayer.club || 'Free Agent'}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                    <Globe className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Nationality</p>
                                    <p className="text-sm font-semibold">{selectedPlayer.nationality || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                    <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Age</p>
                                    <p className="text-sm font-semibold">{selectedPlayer.age || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-400" /> About
                                </h3>
                                <p className="text-sm text-gray-300">{selectedPlayer.bio || 'No bio available.'}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-green-400" /> Performance Stats
                                </h3>
                                <div className="space-y-2">
                                    {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((key) => {
                                        const value = selectedPlayer[key] || 0;
                                        return (
                                            <div key={key} className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400 capitalize w-20">
                                                    {key}
                                                </span>
                                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                                                        style={{ width: `${value}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-semibold w-8 text-right">{value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => toggleWatchlist(selectedPlayer.id)}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${watchlist.includes(selectedPlayer.id)
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-gray-700/50 hover:bg-gray-700'
                                        }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${watchlist.includes(selectedPlayer.id) ? 'fill-current' : ''
                                            }`}
                                    />
                                    {watchlist.includes(selectedPlayer.id) ? 'In Watchlist' : 'Add to Watchlist'}
                                </button>
                                <button
                                    onClick={() => navigate(`/players/${selectedPlayer.id}`)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-3 rounded-xl font-semibold transition-all"
                                >
                                    <Eye className="w-4 h-4" /> View Full Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ⭐ COMPARE MODAL ⭐ */}
            {showCompareModal && (
                <CompareModal
                    players={players.filter(p => compareList.includes(p.id))}
                    onClose={() => setShowCompareModal(false)}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}} />
        </div>
    );
};

export default Players;