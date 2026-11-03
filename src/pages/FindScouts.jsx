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
            alert("Scout successfully hired!");
        } catch (error) {
            console.error(error);
            alert("Failed to hire scout.");
        } finally {
            setHiringId(null);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Search className="w-5 h-5 text-green-400" /> Hire Scouts
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                        <p className="text-gray-400">Finding available scouts...</p>
                    </div>
                ) : scouts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No available scouts found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scouts.map((scout) => (
                            <div key={scout.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                    {scout.full_name?.charAt(0) || 'S'}
                                </div>
                                <h3 className="font-bold">{scout.full_name}</h3>
                                <p className="text-xs text-gray-400 mb-4">{scout.country || 'Global'}</p>

                                <button
                                    onClick={() => handleHire(scout.id)}
                                    disabled={hiringId === scout.id}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    {hiringId === scout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Sign Scout
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindScouts;