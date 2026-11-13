// src/pages/FindScouts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const FindScouts = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scouts, setScouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hiringId, setHiringId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchScouts = async () => {
            setIsLoading(true);
            // Fetch all users with the role 'scout' who are NOT already hired by another team
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'scout')
                .is('team_id', null);

            if (!error) setScouts(data || []);
            setIsLoading(false);
        };

        if (user) fetchScouts();
    }, [user]);

    const handleHire = async (scoutId) => {
        setHiringId(scoutId);
        try {
            // ⭐ We update BOTH team_id and scout_club here
            const { error } = await supabase
                .from('profiles')
                .update({
                    team_id: user.id,
                    scout_club: user.name || 'Hired Club' // <-- Pass the Team's name
                })
                .eq('id', scoutId);

            if (error) throw error;

            setScouts((prev) => prev.filter((s) => s.id !== scoutId));
            setSuccessMessage('Scout successfully hired!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error(error);
            alert("Failed to hire scout.");
        } finally {
            setHiringId(null);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <UserPlus className="w-5 h-5 text-green-600" /> Hire Scouts
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {scouts.length} available
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Finding available scouts...</p>
                    </div>
                ) : scouts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No scouts available</h3>
                        <p className="text-sm text-gray-500">There are currently no free agent scouts looking for a team.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {scouts.map((scout) => (
                            <div key={scout.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                                <div className="p-6 text-center flex-1">
                                    <div className="w-20 h-20 bg-[#0a2e1f] text-green-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-sm">
                                        {scout.full_name?.charAt(0) || 'S'}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{scout.full_name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mt-1">{scout.country || 'Global'}</p>

                                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                                        Free Agent
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                    <button
                                        onClick={() => handleHire(scout.id)}
                                        disabled={hiringId === scout.id}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        {hiringId === scout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        {hiringId === scout.id ? 'Hiring...' : 'Sign Scout'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindScouts;