// src/pages/dashboards/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, DollarSign, Award, BarChart3, Plus,
    Clock, CheckCircle2, MessageSquare, ArrowUpRight, Loader2
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

    // Fetch Real Data
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const result = await fetchAgentDashboardData(user.id);
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
        { id: 'clients', label: 'My Clients', icon: <Users className="w-5 h-5" />, path: '/players' },
        { id: 'negotiations', label: 'Negotiations', icon: <Briefcase className="w-5 h-5" />, path: '/transfers' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
        { id: 'commission', label: 'Commission', icon: <DollarSign className="w-5 h-5" /> },
    ];

    const role = roleConfig.agent;

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
                    <p className="text-gray-400">Loading your agency dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        {
            label: 'Active Clients',
            value: data?.stats.activeClients || 0,
            change: 'Live', up: true,
            icon: <Users className="w-5 h-5" />,
            color: 'text-purple-400 bg-purple-500/10'
        },
        {
            label: 'Open Negotiations',
            value: data?.stats.openNegotiations || 0,
            change: 'Live', up: true,
            icon: <Briefcase className="w-5 h-5" />,
            color: 'text-blue-400 bg-blue-500/10'
        },
        {
            label: 'Commission MTD',
            value: `€${(data?.stats.commission / 1000).toFixed(0) || 0}K`,
            change: 'Est.', up: true,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-400 bg-green-500/10'
        },
        {
            label: 'Deals Closed',
            value: data?.stats.closedDeals || 0,
            change: 'Live', up: true,
            icon: <Award className="w-5 h-5" />,
            color: 'text-yellow-400 bg-yellow-500/10'
        },
    ];

    const recentActivity = data?.recentActivity.map((a) => ({
        text: a.title,
        time: new Date(a.created_at).toLocaleDateString(),
    })) || [];

    const quickActions = [
        { label: 'Add Client', icon: <Plus className="w-5 h-5" /> },
        { label: 'New Negotiation', icon: <Briefcase className="w-5 h-5" />, path: '/transfers' },
        { label: 'View Roster', icon: <Users className="w-5 h-5" />, path: '/players' },
        { label: 'Commission Report', icon: <BarChart3 className="w-5 h-5" /> },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={recentActivity}>
            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className={`bg-gradient-to-r ${role.color} rounded-2xl p-6 sm:p-8`}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/80">
                        {data?.stats.openNegotiations > 0
                            ? `You have ${data.stats.openNegotiations} open negotiations. Keep closing those deals!`
                            : "Your roster is looking good. Browse the market to find new talent."}
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

                    {/* Client Roster */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" /> Top Clients
                        </h3>

                        {data?.clients.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No clients assigned yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data?.clients.map((client, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/players/${client.id}`)}
                                        className="w-full text-left flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">{client.name}</p>
                                            <p className="text-xs text-gray-400">{client.position}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-purple-400">{client.market_value || '€0'}</p>
                                            <p className="text-xs text-gray-400">{client.availability}</p>
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
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
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

export default AgentDashboard;