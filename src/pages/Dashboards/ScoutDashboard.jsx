// src/pages/dashboards/ScoutDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Star, FileText, Target, Search, BarChart3, Calendar,
    Clock, CheckCircle2, MessageSquare, ArrowUpRight, Loader2, Sparkles, TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout'; // Ensure correct capitalization
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchScoutDashboardData } from '../../lib/dbService';
import { supabase } from '../../lib/SupabaseClient'; // ⭐ Imported Supabase

const ScoutDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teamName, setTeamName] = useState(''); // ⭐ State for Team Name

    // Fetch Real Data
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Dashboard Stats
                const result = await fetchScoutDashboardData(user.id);
                setData(result);

                // 2. Set the Team Name from the user object
                if (user.team_id && user.scoutClub) {
                    setTeamName(user.scoutClub);
                } else if (user.team_id) {
                    // Fallback: If team_id exists but scoutClub didn't save, fetch it
                    const { data: teamData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.team_id)
                        .single();

                    if (teamData) setTeamName(teamData.full_name);
                }
            } catch (error) {
                console.error("Failed to load dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/analytics' },
        { id: 'discover', label: 'Discover Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'watchlist', label: 'My Watchlist', icon: <Star className="w-5 h-5" />, path: '/watchlist' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.scout;

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                    <p className="text-gray-500">Loading your scouting dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        {
            label: 'Players Scouted',
            value: data?.stats.scouted || 0,
            change: 'Live', up: true,
            icon: <Eye className="w-5 h-5" />,
            color: 'text-blue-600 bg-blue-50'
        },
        {
            label: 'Watchlist',
            value: data?.stats.watchlist || 0,
            change: 'Live', up: true,
            icon: <Star className="w-5 h-5" />,
            color: 'text-yellow-600 bg-yellow-50'
        },
        {
            label: 'Reports Filed',
            value: data?.stats.reports || 0,
            change: 'Est.', up: true,
            icon: <FileText className="w-5 h-5" />,
            color: 'text-purple-600 bg-purple-50'
        },
        {
            label: 'Shortlisted',
            value: data?.stats.watchlist || 0,
            change: 'Live', up: true,
            icon: <Target className="w-5 h-5" />,
            color: 'text-green-600 bg-green-50'
        },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'Search Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { label: 'New Report', icon: <FileText className="w-5 h-5" />, path: '/new-report' },
        { label: 'View Watchlist', icon: <Star className="w-5 h-5" />, path: '/watchlist' },
        { label: 'Match Schedule', icon: <Calendar className="w-5 h-5" />, path: '/match-schedule' },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                        <p className="text-gray-600 font-medium">
                            {/* ⭐ Show Team Name if Hired ⭐ */}
                            {teamName
                                ? `You are currently scouting for ${teamName}.`
                                : "You are a free agent scout. Apply to a team to get started."}
                        </p>
                        {data?.stats.watchlist > 0 && (
                            <p className="text-gray-500 text-sm mt-2">
                                You have {data.stats.watchlist} players on your watchlist. Time to check their latest stats!
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                    <ArrowUpRight className="w-3 h-3" />{s.change}
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {quickActions.map((a, i) => (
                            <button
                                key={i}
                                onClick={() => a.path ? navigate(a.path) : null}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group"
                            >
                                <div className="text-gray-400 group-hover:text-green-600 transition-colors">{a.icon}</div>
                                <span className="text-sm font-medium text-gray-700 text-center">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two Columns */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Targets */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" /> Top Targets
                        </h3>

                        {data?.topTargets.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-4">Your watchlist is empty.</p>
                                <button
                                    onClick={() => navigate('/players')}
                                    className="text-sm text-green-600 font-semibold hover:text-green-700 hover:underline"
                                >
                                    Discover Players →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data?.topTargets.map((target, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/players/${target.id}`)}
                                        className="w-full text-left flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{target.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {target.position} • Age {target.age} • {target.nationality}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-xs font-bold">{target.rating || 'N/A'}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
                        </h3>

                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">No recent activity.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <p className="text-sm font-medium text-gray-900">{a.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ScoutDashboard;