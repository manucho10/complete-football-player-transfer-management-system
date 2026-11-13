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
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPlayerById(id);

                if (data) {
                    if (data.team_id) {
                        const { data: teamData } = await supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('id', data.team_id)
                            .single();

                        if (teamData && teamData.full_name) {
                            data.club = teamData.full_name;
                        }
                    } else {
                        data.club = 'Free Agent';
                    }

                    setPlayer(data);

                    const videoData = await fetchPlayerVideos(data.id);
                    setVideos(videoData);

                    if (user && user.id !== data.user_id) {
                        await supabase.from('analytics_events').insert({
                            player_id: data.id,
                            event_type: 'view',
                            viewer_id: user.id,
                            viewer_role: user.role,
                        });
                    }

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">Loading player profile...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Player Not Found</h1>
                <button onClick={() => navigate('/players')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold mt-4 transition-colors">
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        {['scout', 'team'].includes(user?.role) && (
                            <button onClick={handleWatchlist} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${isWatchlisted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}>
                                <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                                <span className="hidden sm:inline">{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                            </button>
                        )}
                        <button onClick={handleContact} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                            <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Contact</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {/* HERO BANNER */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0"></div>

                    <div className="relative flex-shrink-0 z-10">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#0a2e1f] text-green-400 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg">
                            {player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        {player.jersey_number && (
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-sm">
                                {player.jersey_number}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left z-10">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
                            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-lg text-sm font-bold">
                                <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                            </span>
                        </div>
                        <p className="text-lg text-gray-600 mb-4 font-medium">{player.position} • {player.club || 'Free Agent'}</p>

                        <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm font-medium text-gray-600">
                            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                <MapPin className="w-4 h-4 text-gray-400" /> {player.nationality || 'Unknown'}
                            </span>
                            {player.age && (
                                <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-400" /> {player.age} years old
                                </span>
                            )}
                            {player.foot && (
                                <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                    <Globe className="w-4 h-4 text-gray-400" /> {player.foot} foot
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                        { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
                        { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${activeTab === tab.id
                                    ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                    : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-600" /> About
                                    </h2>
                                    <p className="text-sm text-gray-600 leading-relaxed">{player.bio || 'No bio available.'}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Detailed Statistics</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {Object.entries(stats).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                            <span className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="text-sm font-bold text-gray-900">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Video className="w-5 h-5 text-green-600" /> Highlight Reels
                                </h2>
                                {videos.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                                        <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No highlight videos uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {videos.map((video) => (
                                            <button
                                                key={video.id}
                                                onClick={() => setActiveVideo(video)}
                                                className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-video border border-gray-200 hover:border-green-400 transition-all text-left"
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <div className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:scale-110 transition-all">
                                                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                                                    </div>
                                                </div>
                                                <video src={video.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" preload="metadata" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4 z-10">
                                                    <p className="text-sm font-bold text-white mb-1 line-clamp-1">{video.title}</p>
                                                    <p className="text-[10px] font-medium text-gray-300 flex items-center gap-1">
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
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-green-600" /> Current Club
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#0a2e1f] text-green-400 rounded-xl flex items-center justify-center font-bold text-lg">
                                    {(player.club || 'FA').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{player.club || 'Free Agent'}</p>
                                    <p className="text-xs text-gray-500">{player.league || 'No League'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VIDEO PLAYER MODAL */}
            {activeVideo && (
                <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 animate-fadeIn" onClick={() => setActiveVideo(null)}>
                    <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50 text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800" onClick={(e) => e.stopPropagation()}>
                        <video src={activeVideo.video_url} controls autoPlay className="w-full aspect-video bg-black" />
                        <div className="p-4 sm:p-6 flex items-center justify-between bg-white border-t border-gray-200">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{activeVideo.title}</h3>
                                <p className="text-xs text-gray-500 font-medium">Uploaded on {new Date(activeVideo.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-700 text-sm font-bold bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                                <Star className="w-4 h-4 fill-current" /> {player.name}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTACT MODAL */}
            {showContactModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center border border-green-200">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Contact {player.name}</h2>
                                    <p className="text-xs text-gray-500">Send a message about this player</p>
                                </div>
                            </div>
                            <button onClick={() => setShowContactModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea
                                    rows={5}
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    placeholder={`Hi, we're interested in discussing a potential move for ${player.name}...`}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowContactModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!contactMessage.trim() || isSending}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}} />
        </div>
    );
};

export default PlayerProfile;