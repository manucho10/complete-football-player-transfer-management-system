// src/pages/MatchSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Loader2, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const MatchSchedule = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [fixtures, setFixtures] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;
            setIsLoading(true);

            try {
                // 1. If the Scout is hired by a team, fetch that team's fixtures
                if (user.team_id) {
                    // Get Team Name
                    const { data: teamData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.team_id)
                        .single();

                    if (teamData) setTeamName(teamData.full_name);

                    // Get Fixtures
                    const { data: fixturesData } = await supabase
                        .from('fixtures')
                        .select('*')
                        .eq('team_id', user.team_id)
                        .order('match_date', { ascending: true });

                    setFixtures(fixturesData || []);
                }
                // 2. If Free Agent, show a generic mock schedule for scouting
                else {
                    setFixtures([
                        { id: 1, opponent: 'Youth League U19', competition: 'Regional Cup', match_date: new Date().toISOString(), is_home: true },
                        { id: 2, opponent: 'FC Academy', competition: 'Friendly', match_date: new Date(Date.now() + 86400000).toISOString(), is_home: false },
                        { id: 3, opponent: 'City Rovers', competition: 'Scouting Event', match_date: new Date(Date.now() + 172800000).toISOString(), is_home: true },
                    ]);
                }
            } catch (error) {
                console.error("Error loading schedule:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">Loading match schedule...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Calendar className="w-5 h-5 text-green-600" /> Match Schedule
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {teamName ? `${teamName} Fixtures` : 'Upcoming Scouting Events'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {teamName
                            ? "Keep track of your team's upcoming matches."
                            : "Attend these matches to discover new talent for your portfolio."}
                    </p>
                </div>

                <div className="space-y-4">
                    {fixtures.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No upcoming matches scheduled.</p>
                        </div>
                    ) : (
                        fixtures.map((fixture) => (
                            <div key={fixture.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                                        <Shield className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
                                            {fixture.is_home ? `vs ${fixture.opponent}` : `@ ${fixture.opponent}`}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {fixture.competition}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500">
                                                {fixture.is_home ? 'Home' : 'Away'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                        {new Date(fixture.match_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(fixture.match_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchSchedule;