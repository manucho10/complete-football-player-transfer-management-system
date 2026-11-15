import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Plus, BarChart3, TrendingUp, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/Dashboardlayout';
import { roleConfig } from '../../config/roleConfig';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/SupabaseClient';

const AcademyDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'roster', label: 'My Academy Roster', icon: <Users className="w-5 h-5" />, path: '/my-academy' },
        { id: 'ai', label: 'AI Talent Finder', icon: <Sparkles className="w-5 h-5" />, path: '/ai-scout' },
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    ];

    const role = roleConfig.academy;

    useEffect(() => {
        const loadPlayers = async () => {
            const { data } = await supabase.from('players').select('*').eq('academy_id', user.id);
            setPlayers(data || []);
            setIsLoading(false);
        };
        if (user) loadPlayers();
    }, [user]);

    if (isLoading) {
        return (
            <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                    <p className="text-gray-500">Loading academy dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Registered Players', value: players.length, icon: <Users className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50' },
        { label: 'Scouts Interested', value: '12', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
        { label: 'Pending Offers', value: '3', icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        { label: 'Active Trials', value: '5', icon: <GraduationCap className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
    ];

    return (
        <DashboardLayout roleConfig={role} navItems={navItems} recentActivity={[]}>
            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                        <p className="text-gray-600 font-medium">
                            You are managing <span className="font-bold text-orange-600">{players.length} players</span> at your academy. Keep developing the next generation of talent!
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className={`inline-flex p-2.5 rounded-xl ${s.color} mb-4`}>{s.icon}</div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => navigate('/add-player')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><Plus className="w-6 h-6" /></div>
                            <span className="text-sm font-medium text-gray-700">Add New Player</span>
                        </button>
                        <button onClick={() => navigate('/my-academy')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><Users className="w-6 h-6" /></div>
                            <span className="text-sm font-medium text-gray-700">Manage Roster</span>
                        </button>
                        <button onClick={() => navigate('/messages')} className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group">
                            <div className="text-gray-400 group-hover:text-orange-600"><MessageSquare className="w-6 h-6" /></div>
                            <span className="text-sm font-medium text-gray-700">Scout Messages</span>
                        </button>
                    </div>
                </div>

                {/* Recent Roster */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600" /> Your Academy Players
                    </h3>
                    {players.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">No players added yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {players.slice(0, 6).map((p) => (
                                <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.position} • Age {p.age}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AcademyDashboard;