// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart3, TrendingUp, Eye, Users, DollarSign, Star,
    Target, FileText, Activity, PieChart as PieIcon, LineChart as LineIcon,
    ArrowUpRight, Loader2, CheckCircle2
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';
import DashboardLayout from '../components/layout/Dashboardlayout';
import { roleConfig } from '../config/roleConfig';

const Analytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeChart, setActiveChart] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [kpis, setKpis] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [sourceBreakdown, setSourceBreakdown] = useState([]);
    const [performanceRadar, setPerformanceRadar] = useState([]);
    const [topClubs, setTopClubs] = useState([]);

    // Navigation Items for Layout
    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" />, path: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/analytics' },
        { id: 'players', label: 'Players', icon: <Users className="w-5 h-5" />, path: '/players' },
        { id: 'transfers', label: 'Transfers', icon: <FileText className="w-5 h-5" />, path: '/transfers' },
    ];

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                let playerData = null;
                let viewsCount = 0;
                let offersCount = 0;
                let interestsCount = 0;
                let totalDealValue = 0;

                if (user.role === 'player') {
                    const { data } = await supabase
                        .from('players')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    playerData = data;
                }

                let eventsQuery = supabase.from('analytics_events').select('*');
                if (playerData?.id) {
                    eventsQuery = eventsQuery.eq('player_id', playerData.id);
                } else {
                    eventsQuery = eventsQuery.eq('viewer_id', user.id);
                }
                const { data: events } = await eventsQuery;

                const { data: transfers } = await supabase
                    .from('transfers')
                    .select('*')
                    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id},player_user_id.eq.${user.id}`);

                if (playerData) {
                    viewsCount = events?.filter(e => e.event_type === 'view').length || 0;
                    interestsCount = events?.filter(e => e.event_type === 'interest').length || 0;
                    offersCount = transfers?.filter(t => t.player_user_id === user.id).length || 0;
                    totalDealValue = transfers?.filter(t => t.player_user_id === user.id && t.status === 'accepted').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

                    setKpis([
                        { label: 'Profile Views', value: viewsCount.toLocaleString(), change: 'Live', icon: <Eye className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Club Interests', value: interestsCount.toString(), change: 'Live', icon: <Star className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50' },
                        { label: 'Offers Received', value: offersCount.toString(), change: 'Live', icon: <FileText className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
                        { label: 'Deal Value', value: `€${(totalDealValue / 1000000).toFixed(1)}M`, change: 'Live', icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
                    ]);

                    setPerformanceRadar([
                        { skill: 'Pace', value: playerData.pace || 0 },
                        { skill: 'Shooting', value: playerData.shooting || 0 },
                        { skill: 'Passing', value: playerData.passing || 0 },
                        { skill: 'Dribbling', value: playerData.dribbling || 0 },
                        { skill: 'Defending', value: playerData.defending || 0 },
                        { skill: 'Physical', value: playerData.physical || 0 },
                    ]);
                } else {
                    viewsCount = events?.filter(e => e.event_type === 'view').length || 0;
                    offersCount = transfers?.filter(t => t.status === 'accepted').length || 0;
                    totalDealValue = transfers?.filter(t => t.status === 'accepted').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

                    setKpis([
                        { label: 'Players Scouted', value: viewsCount.toString(), change: 'Live', icon: <Eye className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Active Negotiations', value: transfers?.filter(t => t.status === 'pending' || t.status === 'negotiating').length.toString() || '0', change: 'Live', icon: <FileText className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50' },
                        { label: 'Deals Closed', value: offersCount.toString(), change: 'Live', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
                        { label: 'Total Deal Value', value: `€${(totalDealValue / 1000000).toFixed(1)}M`, change: 'Live', icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
                    ]);

                    setPerformanceRadar([
                        { skill: 'Scouting', value: 85 },
                        { skill: 'Analysis', value: 92 },
                        { skill: 'Negotiation', value: 78 },
                        { skill: 'Networking', value: 88 },
                        { skill: 'Reporting', value: 75 },
                        { skill: 'Data', value: 82 },
                    ]);
                }

                const baseViews = Math.max(viewsCount, 10);
                setActivityData([
                    { date: 'Week 1', views: Math.floor(baseViews * 0.1), interests: Math.floor(baseViews * 0.02) },
                    { date: 'Week 2', views: Math.floor(baseViews * 0.25), interests: Math.floor(baseViews * 0.05) },
                    { date: 'Week 3', views: Math.floor(baseViews * 0.4), interests: Math.floor(baseViews * 0.1) },
                    { date: 'Week 4', views: Math.floor(baseViews * 0.6), interests: Math.floor(baseViews * 0.15) },
                    { date: 'Week 5', views: Math.floor(baseViews * 0.8), interests: Math.floor(baseViews * 0.18) },
                    { date: 'Current', views: baseViews, interests: interestsCount },
                ]);

                setSourceBreakdown([
                    { name: 'Direct Profile', value: viewsCount > 0 ? 60 : 0, color: '#3b82f6' },
                    { name: 'Search', value: viewsCount > 0 ? 30 : 0, color: '#10b981' },
                    { name: 'Recommendations', value: viewsCount > 0 ? 10 : 0, color: '#f59e0b' },
                ]);

                if (playerData) {
                    setTopClubs([
                        { name: 'FC Barcelona', views: Math.floor(viewsCount * 0.4), interest: 'High' },
                        { name: 'Ajax Amsterdam', views: Math.floor(viewsCount * 0.2), interest: 'Medium' },
                        { name: 'Manchester United', views: Math.floor(viewsCount * 0.15), interest: 'Medium' },
                    ]);
                } else {
                    setTopClubs([
                        { name: 'Lucas Ferreira', views: 45, interest: 'High' },
                        { name: 'Omar Diallo', views: 32, interest: 'Medium' },
                        { name: 'Marcus Silva', views: 18, interest: 'Medium' },
                    ]);
                }

            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    if (!user) return null;

    const chartTabs = [
        { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'trends', label: 'Trends', icon: <LineIcon className="w-4 h-4" /> },
        { id: 'breakdown', label: 'Breakdown', icon: <PieIcon className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
                            {p.name}: {p.value?.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout roleConfig={roleConfig[user.role]} navItems={navItems}>
            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Track your performance and transfer activity.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Calculating your analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* KPI CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {kpis.map((kpi, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                            <ArrowUpRight className="w-3 h-3" /> {kpi.change}
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">{kpi.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* CHART TABS */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
                            {chartTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveChart(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeChart === tab.id
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* CHARTS */}
                        {activeChart === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Activity Overview</h2>
                                            <p className="text-xs text-gray-500">Views and interests over time</p>
                                        </div>
                                        <Activity className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div style={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={activityData}>
                                                <defs>
                                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fill="url(#colorViews)" name="Views" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Traffic Sources</h2>
                                            <p className="text-xs text-gray-500">Where traffic comes from</p>
                                        </div>
                                        <PieIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div style={{ width: '100%', height: 240 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                                                    {sourceBreakdown.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {sourceBreakdown.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }}></span>
                                                    <span className="text-gray-600">{s.name}</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">{s.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeChart === 'trends' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Activity Trends</h2>
                                        <p className="text-xs text-gray-500">Week-by-week performance</p>
                                    </div>
                                    <LineIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={activityData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                            <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Views" />
                                            <Line type="monotone" dataKey="interests" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} name="Interests" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeChart === 'breakdown' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Weekly Comparison</h2>
                                        </div>
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={activityData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Views" barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{user.role === 'team' ? 'Top Target Players' : 'Top Interested Clubs'}</h2>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="space-y-3">
                                        {topClubs.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.views} views</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.interest === 'High' ? 'bg-green-100 text-green-700'
                                                    : item.interest === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.interest}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeChart === 'performance' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Performance Radar</h2>
                                        </div>
                                        <Target className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <RadarChart data={performanceRadar}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis dataKey="skill" stroke="#6b7280" fontSize={12} />
                                                <PolarRadiusAxis stroke="#e5e7eb" fontSize={10} />
                                                <Radar name="Performance" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                                                <Tooltip content={<CustomTooltip />} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Detailed Breakdown</h2>
                                        </div>
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-5">
                                        {performanceRadar.map((item, i) => (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                                                    <span className="text-sm font-bold text-green-600">{item.value}</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${item.value}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}} />
        </DashboardLayout>
    );
};

export default Analytics;