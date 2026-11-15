// src/pages/dashboards/AcademyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Plus, BarChart3, TrendingUp, Sparkles, MessageSquare, Loader2, Eye, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/SupabaseClient';

const AcademyDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({
        totalPlayers: 0,
        totalViews: 0,
        topRatedPlayer: 'N/A',
        scoutsInterested: 0 // We will calculate this from watchlists
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trialRequests, setTrialRequests] = useState([]);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'roster', label: 'My Academy Roster', icon: <Users className="w-5 h-5" />, path: '/my-academy' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.academy;

    useEffect(() => {
        const loadAcademyData = async () => {
            if (!user) return;
            setIsLoading(true);

            try {
                // 1. Fetch all players managed by this academy
                const { data: playersData, error: playersError } = await supabase
                    .from('players')
                    .select('*')
                    .eq('academy_id', user.id)
                    .order('created_at', { ascending: false });

                if (playersError) throw playersError;
                setPlayers(playersData || []);

                // 2. Fetch Analytics Events for these players to calculate views
                const playerIds = playersData.map(p => p.id);
                let viewsCount = 0;

                if (playerIds.length > 0) {
                    const { data: events } = await supabase
                        .from('analytics_events')
                        .select('*')
                        .in('player_id', playerIds)
                        .eq('event_type', 'view');
                    viewsCount = events?.length || 0;
                }

                // 3. Fetch Watchlists to see how many scouts are interested
                let scoutsInterested = 0;
                if (playerIds.length > 0) {
                    const { data: watchlists } = await supabase
                        .from('watchlists')
                        .select('*')
                        .in('player_id', playerIds);
                    // Count unique scouts
                    const uniqueScouts = new Set(watchlists?.map(w => w.user_id));
                    scoutsInterested = uniqueScouts.size;
                }

                // 4. Calculate Top Rated Player
                const topPlayer = playersData.length > 0
                    ? playersData.reduce((prev, current) => (prev.rating > current.rating) ? prev : current)
                    : null;

                setStats({
                    totalPlayers: playersData.length,
                    totalViews: viewsCount,
                    topRatedPlayer: topPlayer ? `${topPlayer.name} (${topPlayer.rating})` : 'N/A',
                    scoutsInterested: scoutsInterested
                });
                // Fetch Trial Requests for this academy's players
                const { data: trials } = await supabase
                    .from('trial_requests')
                    .select(`
        *,
        player:players(name)
    `)
                    .in('player_id', playersData.map(p => p.id))
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                setTrialRequests(trials || []);

                // 5. Fetch Recent Activity (Notifications)
                const { data: activity } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(4);

                setRecentActivity(activity || []);

            } catch (error) {
                console.error("Error loading academy data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAcademyData();
    }, [user]);
    const handleTrialAction = async (id, status) => {
        await supabase.from('trial_requests').update({ status }).eq('id', id);
        setTrialRequests(prev => prev.filter(r => r.id !== id));
    };

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                    <p className="text-gray-500">Loading academy dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Stat Cards configuration
    const statCards = [
        { label: 'Registered Players', value: stats.totalPlayers, icon: <Users className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50' },
        { label: 'Profile Views', value: stats.totalViews, icon: <Eye className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        { label: 'Scouts Interested', value: stats.scoutsInterested, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
        { label: 'Top Rated Talent', value: stats.topRatedPlayer, icon: <Star className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
    ];

    // Map notifications for the layout
    const formattedActivity = recentActivity.map(a => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    }));

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={formattedActivity}>
            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                        <p className="text-gray-600 font-medium">
                            You are managing <span className="font-bold text-orange-600">{stats.totalPlayers} players</span> at {user?.academyName || 'your academy'}. Keep developing the next generation of talent!
                        </p>
                    </div>
                </div>

                {/* Real-Time Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className={`inline-flex p-2.5 rounded-xl ${s.color} mb-4`}>{s.icon}</div>
                            <p className="text-3xl font-bold text-gray-900 truncate">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => navigate('/add-player')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><Plus className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-gray-700">Add New Player</span>
                        </button>
                        <button onClick={() => navigate('/my-academy')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><Users className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-gray-700">Manage Roster</span>
                        </button>
                        <button onClick={() => navigate('/messages')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><MessageSquare className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-gray-700">Scout Messages</span>
                        </button>
                    </div>
                </div>
                {trialRequests.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-600" /> Pending Trial Requests
                        </h3>
                        <div className="space-y-4">
                            {trialRequests.map(req => (
                                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{req.scout_name} wants to watch {req.player?.name}</p>
                                        <p className="text-xs text-gray-600 mt-1">📍 {req.location} • 📅 {new Date(req.proposed_date).toLocaleDateString()}</p>
                                        {req.message && <p className="text-xs text-gray-500 mt-2 italic">"{req.message}"</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleTrialAction(req.id, 'rejected')} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">Reject</button>
                                        <button onClick={() => handleTrialAction(req.id, 'accepted')} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">Accept</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Roster (Real Data) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-600" /> Your Academy Players
                        </h3>
                        <button onClick={() => navigate('/my-academy')} className="text-sm font-bold text-orange-600 hover:text-orange-700">
                            View All
                        </button>
                    </div>

                    {players.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No players added yet. Start by adding your first youth player.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {players.slice(0, 6).map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/players/${p.id}`)}
                                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.position} • Age {p.age}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-600 text-xs font-bold bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                                        <Star className="w-3 h-3 fill-current" /> {p.rating || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AcademyDashboard;