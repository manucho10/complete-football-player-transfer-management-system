// src/pages/dashboards/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, DollarSign, Award, BarChart3, Plus,
    Clock, CheckCircle2, MessageSquare, ArrowUpRight, Loader2, Star, Search, Sparkles, TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { fetchAgentDashboardData } from '../../lib/dbService';

const AgentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await fetchAgentDashboardData(user.id);
            setData(result);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        window.addEventListener('focus', loadData);

        return () => window.removeEventListener('focus', loadData);
    }, [user]);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/analytics' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'clients', label: 'My Roster', icon: <Users className="w-5 h-5" />, path: '/my-roster' },
        { id: 'negotiations', label: 'Negotiations', icon: <Briefcase className="w-5 h-5" />, path: '/transfers' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.agent;

    if (isLoading && !data) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                    <p className="text-gray-500">Loading your agency dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Active Clients', value: data?.stats?.activeClients || 0, change: 'Live', up: true, icon: <Users className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
        { label: 'Open Negotiations', value: data?.stats?.openNegotiations || 0, change: 'Live', up: true, icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        {
            label: 'Commission MTD',
            value: `€${data?.stats?.commission || 0}`,
            change: 'Live', up: true,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-600 bg-green-50'
        },
        { label: 'Deals Closed', value: data?.stats?.closedDeals || 0, change: 'Live', up: true, icon: <Award className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50' },
    ];

    const recentActivity = data?.recentActivity?.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'Add Client', icon: <Plus className="w-5 h-5" />, path: '/players' },
        { label: 'Negotiations', icon: <Briefcase className="w-5 h-5" />, path: '/transfers' },
        { label: 'Search Players', icon: <Search className="w-5 h-5" />, path: '/players' },
        { label: 'AI Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                        <p className="text-gray-600 font-medium">
                            {data?.stats?.openNegotiations > 0
                                ? `You have ${data.stats.openNegotiations} open negotiations. Keep closing those deals!`
                                : 'Your roster is looking good. Browse the market to find new talent.'}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
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
                                onClick={() => (a.path ? navigate(a.path) : null)}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group"
                            >
                                <div className="text-gray-400 group-hover:text-purple-600 transition-colors">{a.icon}</div>
                                <span className="text-sm font-medium text-gray-700 text-center">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two Columns */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Top Clients */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" /> Top Clients
                            </h3>
                            <button onClick={() => navigate('/my-roster')} className="text-sm font-medium text-purple-600 hover:text-purple-700">
                                View All
                            </button>
                        </div>

                        {!data?.clients || data.clients.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-4">You don't represent any players yet.</p>
                                <button onClick={() => navigate('/players')} className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                    Find Players
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.clients.slice(0, 5).map((client, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/players/${client.id}`)}
                                        className="w-full text-left flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                                                <p className="text-xs text-gray-500">{client.position} • {client.club}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-600">{client.market_value || 'N/A'}</p>
                                            <div className="flex items-center justify-end gap-1 text-yellow-600 text-xs">
                                                <Star className="w-3 h-3 fill-current" /> {client.rating}
                                            </div>
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
                                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
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

export default AgentDashboard;