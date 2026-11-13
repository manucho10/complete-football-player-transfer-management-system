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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <FileText className="w-5 h-5 text-red-600" /> Scout Reports
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredReports.length} reports
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by player or scout name..."
                        className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                        <p className="text-gray-500">Loading scout reports...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No reports found</h3>
                        <p className="text-sm text-gray-500">Your scouts haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                                {/* Left: Player Info */}
                                <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">Player</span>
                                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-xs font-bold">
                                            <Star className="w-3.5 h-3.5 fill-current" /> {report.rating}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{report.player_name}</h3>

                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>Scouted by: <span className="font-bold text-gray-900">{report.scout_name}</span></span>
                                    </div>
                                </div>

                                {/* Right: Report Details */}
                                <div className="md:w-2/3 space-y-5">
                                    <div>
                                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Strengths
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed bg-green-50/50 p-3 rounded-lg border border-green-100/50">{report.strengths}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Weaknesses
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100/50">{report.weaknesses}</p>
                                    </div>
                                    {report.overall_summary && (
                                        <div>
                                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Summary
                                            </p>
                                            <p className="text-sm text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">{report.overall_summary}</p>
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