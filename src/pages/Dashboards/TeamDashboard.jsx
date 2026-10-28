// src/pages/dashboards/TeamDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Target, DollarSign, FileText, Search, BarChart3,
    Plus, Clock, CheckCircle2,
    MessageSquare, ArrowUpRight, Loader2, Star
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchTeamDashboardData } from '../../lib/dbService';

const TeamDashboard = () => {
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
                const result = await fetchTeamDashboardData(user.id);
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
        { id: 'squad', label: 'Squad', icon: <Users className="w-5 h-5" />, path: '/players' },
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
        {
            label: 'Squad Size',
            value: data?.stats.squadSize || 0,
            change: 'Live', up: true,
            icon: <Users className="w-5 h-5" />,
            color: 'text-red-400 bg-red-500/10'
        },
        {
            label: 'Transfer Targets',
            value: data?.stats.totalAvailable || 0,
            change: 'Live', up: true,
            icon: <Target className="w-5 h-5" />,
            color: 'text-blue-400 bg-blue-500/10'
        },
        {
            label: 'Budget Spent',
            value: `€${(data?.stats.budgetSpent / 1000000).toFixed(1) || 0}M`,
            change: 'Live', up: false,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-400 bg-green-500/10'
        },
        {
            label: 'Active Offers',
            value: data?.stats.activeOffers || 0,
            change: 'Live', up: true,
            icon: <FileText className="w-5 h-5" />,
            color: 'text-yellow-400 bg-yellow-500/10'
        },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'New Offer', icon: <Plus className="w-5 h-5" />, path: '/transfers' },
        { label: 'Search Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { label: 'Squad Overview', icon: <Users className="w-5 h-5" /> },
        { label: 'Budget Report', icon: <BarChart3 className="w-5 h-5" /> },
    ];

    // Mock Squad Status Data (You can connect this to real DB logic later)
    const squadStatus = [
        { position: 'Goalkeepers', count: 3, needed: 3 },
        { position: 'Defenders', count: 8, needed: 9 },
        { position: 'Midfielders', count: 9, needed: 10 },
        { position: 'Forwards', count: 8, needed: 8 },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6">
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
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/players/${target.id}`)}
                                        className="w-full text-left flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">{target.name}</p>
                                            <p className="text-xs text-gray-400">{target.position} • {target.club}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-400">{target.market_value || 'N/A'}</span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-xs font-semibold">{target.rating || 'N/A'}</span>
                                            </div>
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

                {/* Squad Status (Progress Bars) */}
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
        </DashboardLayout>
    );
};

export default TeamDashboard;
