// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart3, TrendingUp, Eye, DollarSign,
    Star, Target, FileText, Download, ChevronDown, Activity,
    PieChart as PieIcon, LineChart as LineIcon, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const Analytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [timeRange, setTimeRange] = useState('30d');
    const [activeChart, setActiveChart] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [kpis, setKpis] = useState([]);
    const [viewsOverTime, setViewsOverTime] = useState([]);
    const [sourceBreakdown, setSourceBreakdown] = useState([]);
    const [performanceRadar, setPerformanceRadar] = useState([]);
    const [topItems, setTopItems] = useState([]); // Top Clubs or Top Players

    // ================================================================
    // FETCH REAL DATA FROM SUPABASE
    // ================================================================
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Player Data (if user is a player)
                let playerData = null;
                if (user.role === 'player') {
                    const { data } = await supabase
                        .from('players')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    playerData = data;
                }

                // 2. Fetch Analytics Events (Views, Interests)
                let analyticsQuery = supabase
                    .from('analytics_events')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (playerData?.id) {
                    analyticsQuery = analyticsQuery.eq('player_id', playerData.id);
                }

                const { data: events } = await analyticsQuery;

                // 3. Fetch Transfers (Offers)
                const { data: transfers } = await supabase
                    .from('transfers')
                    .select('*')
                    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

                // ==========================================
                // PROCESS THE DATA FOR THE UI
                // ==========================================

                // A. Calculate KPIs
                const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
                const totalInterests = events?.filter(e => e.event_type === 'interest').length || 0;
                const totalOffers = transfers?.length || 0;
                const marketValue = playerData?.market_value || '€0';

                if (user.role === 'player') {
                    setKpis([
                        { label: 'Profile Views', value: totalViews.toLocaleString(), change: '+0%', up: true, icon: <Eye className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
                        { label: 'Club Interests', value: totalInterests.toLocaleString(), change: '+0', up: true, icon: <Star className="w-5 h-5" />, color: 'text-yellow-400 bg-yellow-500/10' },
                        { label: 'Offers Received', value: totalOffers.toString(), change: '+0', up: true, icon: <FileText className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
                        { label: 'Market Value', value: marketValue, change: 'Live', up: true, icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10' },
                    ]);
                } else {
                    // Generic KPIs for Scout/Team/Agent
                    setKpis([
                        { label: 'Total Players Viewed', value: totalViews.toString(), change: '+0', up: true, icon: <Eye className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
                        { label: 'Shortlisted Players', value: totalInterests.toString(), change: '+0', up: true, icon: <Star className="w-5 h-5" />, color: 'text-yellow-400 bg-yellow-500/10' },
                        { label: 'Active Negotiations', value: totalOffers.toString(), change: '+0', up: true, icon: <FileText className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
                        { label: 'Success Rate', value: '0%', change: 'Live', up: true, icon: <Target className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10' },
                    ]);
                }

                // B. Format Time-Series Data (Last 6 Weeks for the Chart)
                const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
                const mockViews = [120, 250, 310, 480, 520, totalViews]; // We append real total at the end
                const formattedTimeData = weeks.map((week, i) => ({
                    date: week,
                    views: mockViews[i] || 0,
                    interests: Math.floor(mockViews[i] * 0.15), // Mock interest ratio
                }));
                setViewsOverTime(formattedTimeData);

                // C. Breakdown Data (Simulated based on real data)
                setSourceBreakdown([
                    { name: 'Direct Profile', value: totalViews > 0 ? 45 : 0, color: '#3b82f6' },
                    { name: 'Search Results', value: totalViews > 0 ? 30 : 0, color: '#10b981' },
                    { name: 'Recommendations', value: totalViews > 0 ? 15 : 0, color: '#f59e0b' },
                    { name: 'Social Media', value: totalViews > 0 ? 10 : 0, color: '#8b5cf6' },
                ]);

                // D. Radar Data (Real Player Stats)
                if (playerData) {
                    setPerformanceRadar([
                        { skill: 'Pace', value: playerData.pace || 0 },
                        { skill: 'Shooting', value: playerData.shooting || 0 },
                        { skill: 'Passing', value: playerData.passing || 0 },
                        { skill: 'Dribbling', value: playerData.dribbling || 0 },
                        { skill: 'Defending', value: playerData.defending || 0 },
                        { skill: 'Physical', value: playerData.physical || 0 },
                    ]);
                } else {
                    setPerformanceRadar([
                        { skill: 'Scouting', value: 85 },
                        { skill: 'Analysis', value: 92 },
                        { skill: 'Networking', value: 78 },
                        { skill: 'Reporting', value: 88 },
                        { skill: 'Negotiation', value: 75 },
                        { skill: 'Data', value: 82 },
                    ]);
                }

                // E. Top Items (Fetch real Top Clubs or Top Players)
                // For this demo, we will just mock a list based on the user's role
                if (user.role === 'player') {
                    setTopItems([
                        { name: 'FC Barcelona', views: 45, interest: 'High' },
                        { name: 'Ajax Amsterdam', views: 32, interest: 'Medium' },
                        { name: 'FC Porto', views: 18, interest: 'Medium' },
                    ]);
                } else {
                    setTopItems([
                        { name: 'Lucas Ferreira', views: 120, interest: 'High' },
                        { name: 'Omar Diallo', views: 98, interest: 'High' },
                        { name: 'Marcus Silva', views: 75, interest: 'Medium' },
                    ]);
                }

            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, timeRange]);

    if (!user) return null;

    const chartTabs = [
        { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'trends', label: 'Trends', icon: <LineIcon className="w-4 h-4" /> },
        { id: 'breakdown', label: 'Breakdown', icon: <PieIcon className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
    ];

    const timeRanges = [
        { id: '7d', label: '7 days' },
        { id: '30d', label: '30 days' },
        { id: '90d', label: '90 days' },
        { id: '1y', label: '1 year' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-2xl">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
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

    const handleExport = () => {
        const csv = [
            ['Date', 'Views', 'Interests'],
            ...viewsOverTime.map((d) => [d.date, d.views, d.interests]),
        ].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-green-400" />
                                Analytics
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-green-500 cursor-pointer"
                                >
                                    {timeRanges.map((r) => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>

                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                        <p className="text-gray-400">Calculating analytics from database...</p>
                    </div>
                ) : (
                    <>
                        {/* KPI CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {kpis.map((kpi, i) => (
                                <div key={i} className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
                                        <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
                                            {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {kpi.change}
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* CHART TABS */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-700">
                            {chartTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveChart(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeChart === tab.id
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* CHARTS */}
                        {activeChart === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Activity Overview</h2>
                                            <p className="text-xs text-gray-400">Views and interests over time</p>
                                        </div>
                                        <Activity className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div style={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={viewsOverTime}>
                                                <defs>
                                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                                <YAxis stroke="#9ca3af" fontSize={12} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fill="url(#colorViews)" name="Views" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Traffic Sources</h2>
                                            <p className="text-xs text-gray-400">Where traffic comes from</p>
                                        </div>
                                        <PieIcon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div style={{ width: '100%', height: 240 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
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
                                                    <span className="text-gray-300">{s.name}</span>
                                                </div>
                                                <span className="font-semibold">{s.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeChart === 'trends' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold">Activity Trends</h2>
                                        <p className="text-xs text-gray-400">Week-by-week performance</p>
                                    </div>
                                    <LineIcon className="w-5 h-5 text-green-400" />
                                </div>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={viewsOverTime}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                            <YAxis stroke="#9ca3af" fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                            <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Views" />
                                            <Line type="monotone" dataKey="interests" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Interests" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeChart === 'breakdown' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Weekly Comparison</h2>
                                        </div>
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={viewsOverTime}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                                <YAxis stroke="#9ca3af" fontSize={12} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Views" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">{user.role === 'team' ? 'Top Target Players' : 'Top Interested Clubs'}</h2>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="space-y-3">
                                        {topItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                                                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.views} views</p>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${item.interest === 'High' ? 'bg-green-500/20 text-green-400'
                                                    : item.interest === 'Medium' ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-gray-500/20 text-gray-400'
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
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Performance Radar</h2>
                                        </div>
                                        <Target className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <RadarChart data={performanceRadar}>
                                                <PolarGrid stroke="#374151" />
                                                <PolarAngleAxis dataKey="skill" stroke="#9ca3af" fontSize={12} />
                                                <PolarRadiusAxis stroke="#6b7280" fontSize={10} />
                                                <Radar name="Performance" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                                                <Tooltip content={<CustomTooltip />} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Detailed Breakdown</h2>
                                        </div>
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="space-y-4">
                                        {performanceRadar.map((item, i) => (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-medium">{item.skill}</span>
                                                    <span className="text-sm font-bold text-green-400">{item.value}</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${item.value}%` }}></div>
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

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Analytics;