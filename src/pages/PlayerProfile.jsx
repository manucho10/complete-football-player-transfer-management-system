// src/pages/PlayerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Star, MapPin, Calendar, Globe, Building2, TrendingUp,
    Eye, Target, Award, BarChart3, Video, Play, Heart, MessageSquare,
    Share2, X, AlertCircle, CheckCircle2, Trophy, Zap, Shield, Activity,
    FileText, Loader2, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPlayerById, fetchPlayerVideos } from '../lib/dbService';
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

    // Data State
    const [player, setPlayer] = useState(null);
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null); // For the video player modal

    // ================================================================
    // FETCH PLAYER & VIDEOS
    // ================================================================
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPlayerById(id);
                setPlayer(data);

                if (data) {
                    // Fetch videos
                    const videoData = await fetchPlayerVideos(data.id);
                    setVideos(videoData);

                    // Track view (only if not the owner)
                    if (user && user.id !== data.user_id) {
                        await supabase.from('analytics_events').insert({
                            player_id: data.id,
                            event_type: 'view',
                            viewer_id: user.id,
                            viewer_role: user.role,
                        });
                    }

                    // Check watchlist status
                    if (user && ['scout', 'team'].includes(user.role)) {
                        const { data: watchData } = await supabase
                            .from('watchlists')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('player_id', data.id)
                            .maybeSingle();

                        if (watchData) setIsWatchlisted(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setPlayer(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadData();
    }, [id, user]);

    // ================================================================
    // HANDLERS
    // ================================================================
    const handleWatchlist = async () => {
        if (!isAuthenticated) return navigate('/login');
        try {
            if (isWatchlisted) {
                await supabase.from('watchlists').delete().eq('user_id', user.id).eq('player_id', player.id);
                setIsWatchlisted(false);
                setSuccessMessage('Removed from watchlist');
            } else {
                await supabase.from('watchlists').insert({ user_id: user.id, player_id: player.id });
                await supabase.from('analytics_events').insert({ player_id: player.id, event_type: 'interest', viewer_id: user.id, viewer_role: user.role });
                setIsWatchlisted(true);
                setSuccessMessage('Added to watchlist!');
            }
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (error) {
            console.error(error);
        }
    };

    const handleContact = () => {
        if (!isAuthenticated) return navigate('/login');
        setShowContactModal(true);
    };

    const handleSendMessage = async () => {
        if (!contactMessage.trim() || !user) return;
        setIsSending(true);
        try {
            const playerUserId = player.user_id;
            if (!playerUserId) throw new Error("This player hasn't linked their account.");
            if (playerUserId === user.id) throw new Error("You cannot message yourself.");

            const { data: existingConv } = await supabase.from('conversations').select('id').or(`and(user1_id.eq.${user.id},user2_id.eq.${playerUserId}),and(user1_id.eq.${playerUserId},user2_id.eq.${user.id})`).maybeSingle();
            let conversationId = existingConv?.id;

            if (!conversationId) {
                const { data: newConv, error } = await supabase.from('conversations').insert({ user1_id: user.id, user2_id: playerUserId }).select().single();
                if (error) throw error;
                conversationId = newConv.id;
            }

            await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, text: contactMessage });
            await supabase.from('conversations').update({ last_message: contactMessage, last_message_at: new Date().toISOString() }).eq('id', conversationId);

            setShowContactModal(false);
            setContactMessage('');
            setSuccessMessage('Message sent successfully!');
        } catch (error) {
            alert(error.message || 'Failed to send message.');
        } finally {
            setIsSending(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `${player?.name} - TransferHub`, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setSuccessMessage('Link copied!');
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    // ================================================================
    // STATES
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
                <button onClick={() => navigate('/players')} className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold mt-4">
                    Back to Player Search
                </button>
            </div>
        );
    }

    const stats = {
        matches: player.matches || 0, goals: player.goals || 0, assists: player.assists || 0,
        minutes: player.minutes || 0, yellowCards: player.yellow_cards || 0, redCards: player.red_cards || 0,
        pace: player.pace || 0, shooting: player.shooting || 0, passing: player.passing || 0,
        dribbling: player.dribbling || 0, defending: player.defending || 0, physical: player.physical || 0,
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
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5 text-gray-400" />
                        </button>
                        {['scout', 'team'].includes(user?.role) && (
                            <button onClick={handleWatchlist} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isWatchlisted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                                <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                                <span className="hidden sm:inline">{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                            </button>
                        )}
                        <button onClick={handleContact} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                            <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Contact</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {/* HERO BANNER */}
                <div className="relative bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl p-6 sm:p-8 mb-6 border border-gray-700 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
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
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                                <h1 className="text-3xl sm:text-4xl font-bold">{player.name}</h1>
                                <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-semibold">
                                    <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                                </span>
                            </div>
                            <p className="text-lg text-gray-300 mb-3">{player.position} • {player.club || 'Free Agent'}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-sm text-gray-400">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {player.nationality || 'Unknown'}</span>
                                {player.age && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {player.age} years old</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-700">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                        { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
                        { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-green-400" /> About</h2>
                                    <p className="text-sm text-gray-300 leading-relaxed">{player.bio || 'No bio available.'}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-400" /> Season Stats</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[{ label: 'Matches', value: stats.matches, color: 'text-blue-400' }, { label: 'Goals', value: stats.goals, color: 'text-green-400' }, { label: 'Assists', value: stats.assists, color: 'text-yellow-400' }, { label: 'Minutes', value: stats.minutes, color: 'text-purple-400' }].map((stat, i) => (
                                            <div key={i} className="bg-gray-700/30 rounded-lg p-4 text-center">
                                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold mb-4">Detailed Statistics</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {Object.entries(stats).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="text-sm font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ⭐ NEW: VIDEO GALLERY ⭐ */}
                        {activeTab === 'videos' && (
                            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Video className="w-5 h-5 text-green-400" /> Highlight Reels
                                </h2>

                                {videos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400">No highlight videos uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {videos.map((video) => (
                                            <button
                                                key={video.id}
                                                onClick={() => setActiveVideo(video)}
                                                className="group relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-gray-700 hover:border-green-500 transition-all text-left"
                                            >
                                                {/* Play Icon Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all">
                                                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                                                    </div>
                                                </div>

                                                {/* Video Preview (Using the video tag to generate a thumbnail) */}
                                                <video
                                                    src={video.video_url}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                                    preload="metadata"
                                                />

                                                {/* Title Overlay */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-10">
                                                    <p className="text-sm font-bold text-white mb-1 line-clamp-1">{video.title}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(video.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐ VIDEO PLAYER MODAL ⭐ */}
            {activeVideo && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
                    onClick={() => setActiveVideo(null)}
                >
                    <button
                        onClick={() => setActiveVideo(null)}
                        className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50 text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={activeVideo.video_url}
                            controls
                            autoPlay
                            className="w-full aspect-video bg-black"
                        />
                        <div className="p-4 sm:p-6 flex items-center justify-between bg-gray-800">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{activeVideo.title}</h3>
                                <p className="text-xs text-gray-400">
                                    Uploaded on {new Date(activeVideo.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold bg-green-500/10 px-3 py-1.5 rounded-lg">
                                <Star className="w-4 h-4 fill-current" /> {player.name}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PlayerProfile;