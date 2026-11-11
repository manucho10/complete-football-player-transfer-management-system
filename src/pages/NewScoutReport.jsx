// src/pages/NewScoutReport.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Star, Save, Loader2 } from 'lucide-react';
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

    if (isLoading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" /> New Scouting Report
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-6">
                {success ? (
                    <div className="text-center py-20 bg-green-500/10 border border-green-500/30 rounded-2xl">
                        <h2 className="text-2xl font-bold text-green-400 mb-2">Report Saved!</h2>
                        <p className="text-gray-400">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6">

                        {/* Player Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Player (From Watchlist)</label>
                            <select
                                value={formData.player_id}
                                onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Overall Potential Rating (1-10)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="flex-1 accent-green-500"
                                />
                                <span className="text-2xl font-bold text-green-400 flex items-center gap-1 w-16 justify-end">
                                    <Star className="w-5 h-5 fill-current" /> {formData.rating}
                                </span>
                            </div>
                        </div>

                        {/* Strengths */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Strengths</label>
                            <textarea
                                rows={3}
                                value={formData.strengths}
                                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                placeholder="e.g. Excellent pace, great dribbling in tight spaces..."
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 resize-none"
                            />
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Weaknesses</label>
                            <textarea
                                rows={3}
                                value={formData.weaknesses}
                                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                                placeholder="e.g. Lacks aerial ability, poor defensive work rate..."
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 resize-none"
                            />
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Overall Summary</label>
                            <textarea
                                rows={4}
                                value={formData.overall_summary}
                                onChange={(e) => setFormData({ ...formData, overall_summary: e.target.value })}
                                placeholder="Provide a complete overview of the player's potential and fit..."
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving || watchlist.length === 0}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Report</>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NewScoutReport;