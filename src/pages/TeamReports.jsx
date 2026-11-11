// src/pages/TeamReports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Star, Search, Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTeamScoutReports } from '../lib/dbService';

const TeamReports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadReports = async () => {
            if (!user) return;
            setIsLoading(true);
            const data = await fetchTeamScoutReports(user.id);
            setReports(data);
            setIsLoading(false);
        };
        loadReports();
    }, [user]);

    const filteredReports = reports.filter(report =>
        report.player_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.scout_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-400" /> Scout Reports
                    </h1>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                        {filteredReports.length} reports
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6">

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by player or scout name..."
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-red-400 mb-4" />
                        <p className="text-gray-400">Loading scout reports...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-1">No reports found</h3>
                        <p className="text-sm text-gray-400">Your scouts haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row gap-6">

                                {/* Left: Player Info */}
                                <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Player</span>
                                        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold">
                                            <Star className="w-3 h-3 fill-current" /> {report.rating}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{report.player_name}</h3>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 bg-gray-700/30 p-2 rounded-lg">
                                        <User className="w-3 h-3" />
                                        <span>Scouted by: <span className="font-semibold text-gray-300">{report.scout_name}</span></span>
                                    </div>
                                </div>

                                {/* Right: Report Details */}
                                <div className="md:w-2/3 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Strengths</p>
                                        <p className="text-sm text-gray-300">{report.strengths}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Weaknesses</p>
                                        <p className="text-sm text-gray-300">{report.weaknesses}</p>
                                    </div>
                                    {report.overall_summary && (
                                        <div>
                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Summary</p>
                                            <p className="text-sm text-gray-300">{report.overall_summary}</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamReports;