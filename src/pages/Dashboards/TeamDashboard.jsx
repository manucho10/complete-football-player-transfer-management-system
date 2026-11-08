// src/pages/dashboards/TeamDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Target, DollarSign, FileText, Search, BarChart3,
    Plus, Calendar, AlertCircle, Clock, CheckCircle2,
    MessageSquare, ArrowUpRight, Loader2, Star, X, TrendingUp, UserPlus, Activity
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchTeamDashboardData, fetchTeamScoutActivity, fetchClubOverview } from '../../lib/dbService';
import { supabase } from '../../lib/SupabaseClient';

const TeamDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scoutActivity, setScoutActivity] = useState([]);
    const [hiredScouts, setHiredScouts] = useState([]);
    const [clubOverview, setClubOverview] = useState(null);

    // Contact Modal State
    const [contactPlayer, setContactPlayer] = useState(null);
    const [contactMessage, setContactMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch main dashboard data
                const result = await fetchTeamDashboardData(user.id);
                setData(result);

                // 2. Fetch Scout Activity
                const activity = await fetchTeamScoutActivity(user.id);
                setScoutActivity(activity);

                // 3. Fetch Hired Scouts
                const { data: scouts } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'scout')
                    .eq('team_id', user.id);
                if (scouts) setHiredScouts(scouts);

                // 4. Fetch Club Overview
                const overview = await fetchClubOverview(user.id);
                setClubOverview(overview);

            } catch (error) {
                console.error("Failed to load dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Handle Sending the Message
    const handleSendMessage = async () => {
        if (!contactMessage.trim() || !contactPlayer) return;
        setIsSending(true);

        try {
            const playerUserId = contactPlayer.user_id;
            if (!playerUserId) throw new Error("This player hasn't linked their account yet.");

            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${playerUserId}),and(user1_id.eq.${playerUserId},user2_id.eq.${user.id})`)
                .maybeSingle();

            let conversationId = existingConv?.id;

            if (!conversationId) {
                const { data: newConv, error: convError } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: playerUserId })
                    .select()
                    .single();
                if (convError) throw convError;
                conversationId = newConv.id;
            }

            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                text: contactMessage,
            });

            await supabase.from('conversations').update({
                last_message: contactMessage,
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);

            setSuccessMessage('Message sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setContactPlayer(null);
            setContactMessage('');
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/analytics' },
        { id: 'squad', label: 'Squad', icon: <Users className="w-5 h-5" />, path: '/squad' },
        { id: 'scouts', label: 'My Scouts', icon: <UserPlus className="w-5 h-5" />, path: '/my-scouts' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'targets', label: 'Transfer Targets', icon: <Target className="w-5 h-5" />, path: '/players' },
        { id: 'offers', label: 'Offers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.team;

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-red-400 mb-4" />
                    <p className="text-gray-400">Loading club dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Squad Size', value: data?.stats.squadSize || 0, change: 'Live', up: true, icon: <Users className="w-5 h-5" />, color: 'text-red-400 bg-red-500/10' },
        { label: 'Transfer Targets', value: data?.stats.totalAvailable || 0, change: 'Live', up: true, icon: <Target className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Budget Spent', value: `€${(data?.stats.budgetSpent / 1000000).toFixed(1) || 0}M`, change: 'Live', up: false, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
        { label: 'Active Offers', value: data?.stats.activeOffers || 0, change: 'Live', up: true, icon: <FileText className="w-5 h-5" />, color: 'text-yellow-400 bg-yellow-500/10' },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'New Offer', icon: <Plus className="w-5 h-5" />, path: '/transfers' },
        { label: 'Search Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { label: 'View Squad', icon: <Users className="w-5 h-5" />, path: '/squad' },
        { label: 'Hire Scouts', icon: <UserPlus className="w-5 h-5" />, path: '/find-scouts' },
    ];

    const squadStatus = [
        { position: 'Goalkeepers', count: 3, needed: 3 },
        { position: 'Defenders', count: 8, needed: 9 },
        { position: 'Midfielders', count: 9, needed: 10 },
        { position: 'Forwards', count: 8, needed: 8 },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6">
                {successMessage && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {/* Welcome Banner */}
                <div className={`bg-gradient-to-r ${role.color} rounded-2xl p-6 sm:p-8`}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/80">
                        {data?.stats.activeOffers > 0
                            ? `You have ${data.stats.activeOffers} pending offers to review.`
                            : "The transfer window is open. Start scouting for new talent!"}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                                <div className={`flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                                    <ArrowUpRight className="w-3 h-3" />{s.change}
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map((a, i) => (
                            <button
                                key={i}
                                onClick={() => a.path ? navigate(a.path) : null}
                                className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 hover:bg-gray-700/60 rounded-xl transition-all"
                            >
                                <div className={role.text}>{a.icon}</div>
                                <span className="text-xs font-medium text-center">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two Columns */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Transfer Targets */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-red-400" /> Top Transfer Targets
                        </h3>
                        {data?.topTargets.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No available players found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data?.topTargets.map((target, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <button onClick={() => navigate(`/players/${target.id}`)} className="text-left flex-1">
                                            <p className="text-sm font-semibold hover:text-green-400 transition-colors">{target.name}</p>
                                            <p className="text-xs text-gray-400">{target.position} • {target.club}</p>
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-green-400 block">{target.market_value || 'N/A'}</span>
                                                <div className="flex items-center justify-end gap-1 text-yellow-400 text-xs">
                                                    <Star className="w-3 h-3 fill-current" /> {target.rating || 'N/A'}
                                                </div>
                                            </div>
                                            <button onClick={() => setContactPlayer(target)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
                        </h3>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm">{a.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* My Scouting Network */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-red-400" /> My Scouting Network
                    </h3>
                    {hiredScouts.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-400 mb-3">You haven't hired any scouts yet.</p>
                            <button onClick={() => navigate('/find-scouts')} className="text-xs bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold">
                                Hire Scouts
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {hiredScouts.map(scout => (
                                <div key={scout.id} className="bg-gray-700/30 rounded-lg p-3 min-w-[150px] flex-shrink-0 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        {scout.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold truncate">{scout.full_name}</p>
                                        <p className="text-[10px] text-green-400">Active</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Live Scout Activity */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-400" /> Live Scout Activity
                    </h3>
                    {scoutActivity.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No recent scouting activity. Hire scouts to start tracking players.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {scoutActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold text-white">{activity.scoutName}</span>
                                            {' '}{activity.action}{' '}
                                            <span className="font-semibold text-green-400">{activity.playerName}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {activity.playerPosition} • {activity.playerClub} • {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Squad Depth */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-400" /> Squad Depth
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {squadStatus.map((pos, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span>{pos.position}</span>
                                    <span className={pos.count >= pos.needed ? 'text-green-400' : 'text-yellow-400'}>
                                        {pos.count}/{pos.needed}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${pos.count >= pos.needed ? 'bg-green-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${Math.min((pos.count / pos.needed) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {contactPlayer && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setContactPlayer(null)}>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Contact {contactPlayer.name}</h2>
                                    <p className="text-xs text-gray-400">Send a message about this player</p>
                                </div>
                            </div>
                            <button onClick={() => setContactPlayer(null)} className="p-2 hover:bg-gray-700/50 rounded-lg">
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
                                    placeholder={`Hi, we're interested in discussing a potential move for ${contactPlayer.name}...`}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setContactPlayer(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg text-sm font-semibold transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!contactMessage.trim() || isSending}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ==================== CLUB OVERVIEW ==================== */}
            <div className="grid lg:grid-cols-2 gap-6 mt-6">

                {/* Fixtures */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-red-400" /> Upcoming Fixtures
                    </h3>
                    <div className="space-y-3">
                        {clubOverview?.fixtures.map(fix => (
                            <div key={fix.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div>
                                    <p className="text-sm font-semibold">{fix.home ? 'vs' : '@'} {fix.opponent}</p>
                                    <p className="text-xs text-gray-400">{fix.competition}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-red-400">{fix.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* League Table */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" /> League Position
                    </h3>
                    <div className="space-y-2">
                        {clubOverview?.leagueTable.map(row => (
                            <div key={row.pos} className={`flex items-center justify-between p-2 rounded-lg ${row.team === 'My Team' ? 'bg-red-500/20 border border-red-500/30' : 'bg-gray-700/30'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-4">{row.pos}</span>
                                    <span className={`text-sm font-semibold ${row.team === 'My Team' ? 'text-red-400' : ''}`}>{row.team}</span>
                                </div>
                                <span className="text-sm font-bold">{row.pts} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Signings */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-400" /> New Signings
                    </h3>
                    {clubOverview?.newSignings.length === 0 ? (
                        <p className="text-sm text-gray-500">No recent signings.</p>
                    ) : (
                        <div className="space-y-3">
                            {clubOverview?.newSignings.map(player => (
                                <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{player.name}</p>
                                        <p className="text-xs text-gray-400">{player.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expiring Contracts */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" /> Expiring Contracts
                    </h3>
                    {clubOverview?.expiringContracts.length === 0 ? (
                        <p className="text-sm text-gray-500">No expiring contracts found.</p>
                    ) : (
                        <div className="space-y-3">
                            {clubOverview?.expiringContracts.map(player => (
                                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                    <div>
                                        <p className="text-sm font-semibold">{player.name}</p>
                                        <p className="text-xs text-gray-400">{player.position}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-yellow-400">
                                        {new Date(player.contract_end_date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}} />
        </DashboardLayout>
    );
};

export default TeamDashboard;