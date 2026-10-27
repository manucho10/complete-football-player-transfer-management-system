// src/pages/PlayerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Star,
    MapPin,
    Calendar,
    Globe,
    Building2,
    TrendingUp,
    Eye,
    Target,
    Award,
    BarChart3,
    Video,
    Heart,
    MessageSquare,
    Share2,
    X,
    AlertCircle,
    CheckCircle2,
    Trophy,
    Zap,
    Shield,
    Activity,
    FileText,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPlayerById } from '../lib/dbService';
import { supabase } from '../lib/SupabaseClient';

const PlayerProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('overview');
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Supabase Data State
    const [player, setPlayer] = useState(null);

    // ================================================================
    // FETCH PLAYER & TRACK VIEW
    // ================================================================
    useEffect(() => {
        const loadPlayer = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPlayerById(id);
                setPlayer(data);

                if (!data) return;

                // ⭐ 1. TRACK PROFILE VIEW ⭐
                // Only track if user is logged in and is NOT the owner of the profile
                if (user && user.id !== data.user_id) {
                    await supabase.from('analytics_events').insert({
                        player_id: data.id,
                        event_type: 'view',
                        viewer_id: user.id,
                        viewer_role: user.role,
                    });
                }

                // ⭐ 2. CHECK IF ALREADY WATCHLISTED ⭐
                if (user && ['scout', 'team'].includes(user.role)) {
                    const { data: watchData } = await supabase
                        .from('watchlists')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('player_id', data.id)
                        .maybeSingle();

                    if (watchData) setIsWatchlisted(true);
                }

            } catch (error) {
                console.error('Failed to fetch player:', error);
                setPlayer(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadPlayer();
        }
    }, [id, user]);

    // ================================================================
    // HANDLERS
    // ================================================================
    const handleWatchlist = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (isWatchlisted) {
                // Remove from watchlist
                await supabase
                    .from('watchlists')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('player_id', player.id);

                setIsWatchlisted(false);
                setSuccessMessage('Removed from watchlist');
            } else {
                // Add to watchlist
                await supabase.from('watchlists').insert({
                    user_id: user.id,
                    player_id: player.id,
                });

                // ⭐ TRACK THE INTEREST EVENT ⭐
                await supabase.from('analytics_events').insert({
                    player_id: player.id,
                    event_type: 'interest',
                    viewer_id: user.id,
                    viewer_role: user.role,
                });

                setIsWatchlisted(true);
                setSuccessMessage('Added to watchlist!');
            }
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (error) {
            console.error('Watchlist error:', error);
            alert('Failed to update watchlist.');
        }
    };

    const handleContact = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowContactModal(true);
    };

    const handleSendMessage = async () => {
        if (!contactMessage.trim() || !user) return;

        setIsSending(true);
        try {
            const playerUserId = player.user_id;

            if (!playerUserId) {
                throw new Error("This player hasn't linked their account yet. Try messaging another player.");
            }

            if (playerUserId === user.id) {
                throw new Error("You cannot message yourself.");
            }

            // 1. Check if a conversation exists
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${playerUserId}),and(user1_id.eq.${playerUserId},user2_id.eq.${user.id})`)
                .maybeSingle();

            let conversationId = existingConv?.id;

            // 2. Create conversation if it doesn't exist
            if (!conversationId) {
                const { data: newConv, error: convError } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: playerUserId })
                    .select()
                    .single();

                if (convError) throw convError;
                conversationId = newConv.id;
            }

            // 3. Insert the message
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                text: contactMessage,
            });

            // Update conversation's last_message
            await supabase
                .from('conversations')
                .update({
                    last_message: contactMessage,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversationId);

            setShowContactModal(false);
            setContactMessage('');
            setSuccessMessage('Message sent successfully!');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert(error.message || 'Failed to send message.');
        } finally {
            setIsSending(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${player?.name} - TransferHub`,
                text: `Check out ${player?.name}'s profile on TransferHub`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setSuccessMessage('Link copied to clipboard!');
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    // ================================================================
    // LOADING & NOT FOUND STATES
    // ================================================================
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                <p className="text-gray-400">Loading player profile...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Player Not Found</h1>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                    The player you are looking for does not exist or has been removed.
                </p>
                <button
                    onClick={() => navigate('/players')}
                    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                    Back to Player Search
                </button>
            </div>
        );
    }

    // Map the database snake_case fields to our UI
    const stats = {
        matches: player.matches || 0,
        goals: player.goals || 0,
        assists: player.assists || 0,
        minutes: player.minutes || 0,
        yellowCards: player.yellow_cards || 0,
        redCards: player.red_cards || 0,
        pace: player.pace || 0,
        shooting: player.shooting || 0,
        passing: player.passing || 0,
        dribbling: player.dribbling || 0,
        defending: player.defending || 0,
        physical: player.physical || 0,
    };

    const statBars = [
        { key: 'pace', label: 'Pace', icon: <Zap className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
        { key: 'shooting', label: 'Shooting', icon: <Target className="w-4 h-4" />, color: 'from-red-500 to-orange-500' },
        { key: 'passing', label: 'Passing', icon: <Activity className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
        { key: 'dribbling', label: 'Dribbling', icon: <TrendingUp className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
        { key: 'defending', label: 'Defending', icon: <Shield className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
        { key: 'physical', label: 'Physical', icon: <BarChart3 className="w-4 h-4" />, color: 'from-gray-500 to-gray-400' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Share"
                        >
                            <Share2 className="w-5 h-5 text-gray-400" />
                        </button>
                        {['scout', 'team'].includes(user?.role) && (
                            <button
                                onClick={handleWatchlist}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isWatchlisted
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                                <span className="hidden sm:inline">
                                    {isWatchlisted ? 'Watchlisted' : 'Watchlist'}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={handleContact}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                {/* ==================== HERO BANNER ==================== */}
                <div className="relative bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl p-6 sm:p-8 mb-6 border border-gray-700 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-gray-700">
                                {player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            {player.jersey_number && (
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm border-4 border-gray-800">
                                    {player.jersey_number}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                                <h1 className="text-3xl sm:text-4xl font-bold">{player.name}</h1>
                                <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-semibold">
                                    <Star className="w-4 h-4 fill-current" />
                                    {player.rating || 'N/A'}
                                </span>
                            </div>

                            <p className="text-lg text-gray-300 mb-3">
                                {player.position} • {player.club || 'Free Agent'}
                            </p>

                            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" /> {player.nationality || 'Unknown'}
                                </span>
                                {player.age && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> {player.age} years old
                                    </span>
                                )}
                                {player.foot && (
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4" /> {player.foot} foot
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 flex-wrap">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${player.availability === 'Available'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                                    {player.availability || 'Unknown'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                    <TrendingUp className="w-3 h-3" />
                                    Market Value: {player.market_value || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== TABS ==================== */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-700">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                        { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
                        { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
                        { id: 'career', label: 'Career', icon: <Award className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ==================== TAB CONTENT ==================== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-400" /> About
                                    </h2>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {player.bio || 'No bio available for this player yet.'}
                                    </p>
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-green-400" /> Season Stats
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Matches', value: stats.matches, color: 'text-blue-400' },
                                            { label: 'Goals', value: stats.goals, color: 'text-green-400' },
                                            { label: 'Assists', value: stats.assists, color: 'text-yellow-400' },
                                            { label: 'Minutes', value: stats.minutes, color: 'text-purple-400' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-gray-700/30 rounded-lg p-4 text-center">
                                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-green-400" /> Attributes
                                    </h2>
                                    <div className="space-y-4">
                                        {statBars.map((bar) => (
                                            <div key={bar.key}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-400">{bar.icon}</span>
                                                        <span className="font-medium">{bar.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold">{stats[bar.key]}</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${stats[bar.key]}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-4">Detailed Statistics</h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {Object.entries(stats).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                                <span className="text-sm text-gray-400 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-sm font-bold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Video className="w-5 h-5 text-green-400" /> Highlights
                                </h2>
                                <div className="text-center py-10">
                                    <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">Video uploads coming soon.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'career' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-green-400" /> Career History
                                </h2>
                                <div className="text-center py-10">
                                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">Career history records coming soon.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ==================== SIDEBAR ==================== */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-5">
                            <h3 className="font-semibold mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleContact}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-2.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" /> Contact Player
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                    <Share2 className="w-4 h-4" /> Share Profile
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-5">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-green-400" /> Current Club
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                                    {(player.club || 'FA').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{player.club || 'Free Agent'}</p>
                                    <p className="text-xs text-gray-400">{player.league || 'No League'}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-700 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Market Value</span>
                                    <span className="font-semibold text-green-400">{player.market_value || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== CONTACT MODAL ==================== */}
            {showContactModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowContactModal(false)}
                >
                    <div
                        className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Contact {player.name}</h2>
                                    <p className="text-xs text-gray-400">Send a message about this player</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                <textarea
                                    rows={5}
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    placeholder={`Hi, we're interested in discussing a potential move for ${player.name}...`}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg text-sm font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!contactMessage.trim() || isSending}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerProfile;