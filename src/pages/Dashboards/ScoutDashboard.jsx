// src/pages/dashboards/ScoutDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Star, FileText, Target, Search, BarChart3, Calendar,
    Clock, CheckCircle2, MessageSquare, ArrowUpRight, Loader2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchScoutDashboardData } from '../../lib/dbService';

const ScoutDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Real Data
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const result = await fetchScoutDashboardData(user.id);
                setData(result);
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
        { id: 'discover', label: 'Discover Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { id: 'watchlist', label: 'My Watchlist', icon: <Star className="w-5 h-5" />, path: '/players' }, // Can point to a dedicated watchlist page later
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.scout;

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                    <p className="text-gray-400">Loading your scouting dashboard...</p>
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
            color: 'text-green-400 bg-green-500/10'
        },
        {
            label: 'Watchlist',
            value: data?.stats.watchlist || 0,
            change: 'Live', up: true,
            icon: <Star className="w-5 h-5" />,
            color: 'text-yellow-400 bg-yellow-500/10'
        },
        {
            label: 'Reports Filed',
            value: data?.stats.reports || 0,
            change: 'Est.', up: true,
            icon: <FileText className="w-5 h-5" />,
            color: 'text-blue-400 bg-blue-500/10'
        },
        {
            label: 'Shortlisted',
            value: data?.stats.watchlist || 0,
            change: 'Live', up: true,
            icon: <Target className="w-5 h-5" />,
            color: 'text-purple-400 bg-purple-500/10'
        },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'Search Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { label: 'New Report', icon: <FileText className="w-5 h-5" /> },
        { label: 'View Watchlist', icon: <Star className="w-5 h-5" />, path: '/players' },
        { label: 'Match Schedule', icon: <Calendar className="w-5 h-5" /> },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className={`bg-gradient-to-r ${role.color} rounded-2xl p-6 sm:p-8`}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/80">
                        {data?.stats.watchlist > 0
                            ? `You have ${data.stats.watchlist} players on your watchlist. Time to check their latest stats!`
                            : "Start browsing the player database to build your watchlist."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
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
                    {/* Top Targets */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-400" /> Top Targets
                        </h3>

                        {data?.topTargets.length === 0 ? (
                            <div className="text-center py-8">
                                <Star className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 mb-4">Your watchlist is empty.</p>
                                <button
                                    onClick={() => navigate('/players')}
                                    className="text-xs text-green-400 font-semibold hover:underline"
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
                                        className="w-full text-left flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">{target.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {target.position} • Age {target.age} • {target.nationality}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-semibold">{target.rating || 'N/A'}</span>
                                        </div>
                                    </button>
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
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
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
            </div>
        </DashboardLayout>
    );
};

export default ScoutDashboard;