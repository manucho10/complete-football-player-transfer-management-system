// src/pages/dashboards/PlayerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Star, FileText, DollarSign, BarChart3, Video, User,
    Building2, Clock, CheckCircle2, MessageSquare, ArrowUpRight,
    Loader2, TrendingUp, Sparkles
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchPlayerDashboardData } from '../../lib/dbService';
import UploadHighlightModal from '../../components/dashboard/UploadHighlightModal';

const PlayerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/analytics' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'discover', label: 'Discover Clubs', icon: <Building2 className="w-5 h-5" />, path: '/browse-clubs' },
        { id: 'offers', label: 'My Offers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
        { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    ];

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={roleConfig.player} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Profile Views', value: data?.stats.views || 0, change: '+12%', icon: <Eye className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        { label: 'Club Interests', value: data?.stats.interests || 0, change: '+5', icon: <Star className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Active Offers', value: data?.stats.offers || 0, change: '+1', icon: <FileText className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
        { label: 'Market Value', value: data?.stats.marketValue || '€0', change: 'Current', icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
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
        { label: 'Upload Highlight', icon: <Video className="w-5 h-5" />, onClick: () => setIsUploadModalOpen(true) },
        { label: 'Update Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
        { label: 'View Offers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
        { label: 'Browse Clubs', icon: <Building2 className="w-5 h-5" />, path: '/browse-clubs' },
    ];

    return (
        <DashboardLayout roleConfig={roleConfig.player} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Current Club: <span className="font-semibold text-gray-900">{data?.currentClub || 'Free Agent'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Profile Active
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${s.color}`}>
                                    {s.icon}
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                            </div>
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
                                onClick={() => {
                                    if (a.onClick) a.onClick();
                                    else if (a.path) navigate(a.path);
                                }}
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

                    {/* Performance */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" /> Season Performance
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {performance.map((p, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-2xl font-bold text-gray-900">{p.value}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-1">{p.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
                            </h3>
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">No recent activity.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'offer' ? 'bg-green-50 text-green-600' :
                                            a.type === 'message' ? 'bg-purple-50 text-purple-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                            {a.type === 'offer' ? <FileText className="w-4 h-4" /> : a.type === 'message' ? <MessageSquare className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {/* Video Upload Modal */}
            {data?.playerStats?.id && (
                <UploadHighlightModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    playerId={data.playerStats.id}
                    onSuccess={() => console.log("Video uploaded")}
                />
            )}
        </DashboardLayout>
    );
};

export default PlayerDashboard;