// src/pages/NewScoutReport.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Star, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyWatchlist, createScoutReport } from '../lib/dbService';

const NewScoutReport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [watchlist, setWatchlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        player_id: '',
        strengths: '',
        weaknesses: '',
        overall_summary: '',
        rating: 7
    });

    useEffect(() => {
        const loadWatchlist = async () => {
            if (!user) return;
            const data = await fetchMyWatchlist(user.id);
            setWatchlist(data);
            if (data.length > 0) setFormData(prev => ({ ...prev, player_id: data[0].id }));
            setIsLoading(false);
        };
        loadWatchlist();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.player_id) return alert("Please select a player.");
        if (!formData.strengths || !formData.weaknesses) return alert("Please fill in strengths and weaknesses.");

        setIsSaving(true);
        try {
            const selectedPlayer = watchlist.find(p => p.id === formData.player_id);

            await createScoutReport({
                scout_id: user.id,
                player_id: formData.player_id,
                player_name: selectedPlayer.name,
                strengths: formData.strengths,
                weaknesses: formData.weaknesses,
                overall_summary: formData.overall_summary,
                rating: Number(formData.rating)
            });

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error(error);
            alert("Failed to save report.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">Loading watchlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <FileText className="w-5 h-5 text-green-600" /> New Scouting Report
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                {success ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-green-200 shadow-sm animate-fadeIn">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Saved!</h2>
                        <p className="text-gray-500">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">

                        {/* Player Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Player (From Watchlist)</label>
                            <select
                                value={formData.player_id}
                                onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            >
                                {watchlist.length === 0 ? (
                                    <option value="">No players in watchlist</option>
                                ) : (
                                    watchlist.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.position} • {p.club})</option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Overall Potential Rating (1-10)</label>
                            <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="flex-1 accent-green-600"
                                />
                                <span className="text-3xl font-bold text-green-600 flex items-center gap-1.5 w-20 justify-end">
                                    <Star className="w-6 h-6 fill-current" /> {formData.rating}
                                </span>
                            </div>
                        </div>

                        {/* Strengths */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Strengths</label>
                            <textarea
                                rows={3}
                                value={formData.strengths}
                                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                placeholder="e.g. Excellent pace, great dribbling in tight spaces..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                            />
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Weaknesses</label>
                            <textarea
                                rows={3}
                                value={formData.weaknesses}
                                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                                placeholder="e.g. Lacks aerial ability, poor defensive work rate..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                            />
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Overall Summary</label>
                            <textarea
                                rows={4}
                                value={formData.overall_summary}
                                onChange={(e) => setFormData({ ...formData, overall_summary: e.target.value })}
                                placeholder="Provide a complete overview of the player's potential and fit..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSaving || watchlist.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Report...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> Save Report</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NewScoutReport;