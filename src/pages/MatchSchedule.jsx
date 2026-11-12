// src/pages/MatchSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Loader2, Shield } from 'lucide-react';
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
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                <p className="text-gray-400">Loading match schedule...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-400" /> Match Schedule
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">
                        {teamName ? `${teamName} Fixtures` : 'Upcoming Scouting Events'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {teamName
                            ? "Keep track of your team's upcoming matches."
                            : "Attend these matches to discover new talent for your portfolio."}
                    </p>
                </div>

                <div className="space-y-4">
                    {fixtures.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No upcoming matches scheduled.</p>
                        </div>
                    ) : (
                        fixtures.map((fixture) => (
                            <div key={fixture.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-green-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center shrink-0">
                                        <Shield className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{fixture.is_home ? `vs ${fixture.opponent}` : `@ ${fixture.opponent}`}</h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                            <span className="bg-gray-700/50 px-2 py-0.5 rounded text-xs">{fixture.competition}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end text-sm text-gray-300">
                                    <p className="font-semibold text-green-400 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(fixture.match_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
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