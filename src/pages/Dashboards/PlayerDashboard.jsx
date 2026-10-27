// src/pages/dashboards/PlayerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Star, FileText, DollarSign, BarChart3, Video, User,
    Building2, Clock, CheckCircle2, MessageSquare, ArrowUpRight, Loader2, Zap
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchPlayerDashboardData } from '../../lib/dbService';

const PlayerDashboard = () => {
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
                const result = await fetchPlayerDashboardData(user.id);
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
        { id: 'discover', label: 'Discover Clubs', icon: <Building2 className="w-5 h-5" /> },
        { id: 'offers', label: 'My Offers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
        { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    ];

    const role = roleConfig.player;

    // Loading State
    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Profile Views', value: data?.stats.views || 0, change: 'Live', up: true, icon: <Eye className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Club Interests', value: data?.stats.interests || 0, change: 'Live', up: true, icon: <Star className="w-5 h-5" />, color: 'text-yellow-400 bg-yellow-500/10' },
        { label: 'Active Offers', value: data?.stats.offers || 0, change: 'Live', up: true, icon: <FileText className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
        { label: 'Market Value', value: data?.stats.marketValue || '€0', change: 'Current', up: true, icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10' },
    ];

    const performance = [
        { label: 'Matches Played', value: data?.playerStats?.matches || 0 },
        { label: 'Goals', value: data?.playerStats?.goals || 0 },
        { label: 'Assists', value: data?.playerStats?.assists || 0 },
        { label: 'Yellow Cards', value: data?.playerStats?.yellow_cards || 0 },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
        type: a.type === 'offer' ? 'offer' : a.type === 'message' ? 'message' : 'view'
    })) || [];

    const quickActions = [
        { label: 'Upload Highlight', icon: <Video className="w-5 h-5" /> },
        { label: 'Update Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
        { label: 'View Offers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
        { label: 'Browse Clubs', icon: <Building2 className="w-5 h-5" /> },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className={`bg-gradient-to-r ${role.color} rounded-2xl p-6 sm:p-8`}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/80">
                        {data?.stats.offers > 0
                            ? `You have ${data.stats.offers} active offers. Keep an eye on your messages!`
                            : "Your profile is live. Make sure your stats are up to date to attract more scouts."}
                    </p>
                </div>

                {/* Stats */}
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
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" /> Season Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {performance.map((p, i) => (
                                <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                                    <p className="text-2xl font-bold text-blue-400">{p.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">{p.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

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
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                                            {a.type === 'offer' ? <FileText className="w-4 h-4" /> : a.type === 'message' ? <MessageSquare className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

export default PlayerDashboard;