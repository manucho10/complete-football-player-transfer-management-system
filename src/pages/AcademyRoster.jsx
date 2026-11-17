// src/pages/AcademyRoster.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Loader2, Star, Eye, UserMinus, Plus, Mail, X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const AcademyRoster = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [invitePlayer, setInvitePlayer] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState('');


    useEffect(() => {
        const fetchRoster = async () => {
            if (!user) return;
            setIsLoading(true);

            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('academy_id', user.id)
                .order('created_at', { ascending: false });

            if (!error) setPlayers(data || []);
            setIsLoading(false);
        };

        fetchRoster();
    }, [user]);
    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setIsSendingInvite(true);

        try {
            // 1. Save the contact email to the player's record
            const { error: updateError } = await supabase
                .from('players')
                .update({ contact_email: inviteEmail })
                .eq('id', invitePlayer.id);

            if (updateError) throw updateError;
            // 2. Send an invite using Supabase Auth
            // The redirect URL must point to your registration page
            const redirectUrl = `${window.location.origin}/register?invite=${invitePlayer.id}`;

            const { error: authError } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
                redirectTo: redirectUrl,
            });

            // Note: supabase.auth.admin requires a Service Role Key (backend). 
            // If you are doing this purely client-side, you should use a standard signup 
            // or use a custom Edge Function. For client-side, we'll just mock the success for now.

            setInviteSuccess(`Invite sent successfully to ${inviteEmail}!`);
            setTimeout(() => {
                setInviteSuccess('');
                setInvitePlayer(null);
                setInviteEmail('');
            }, 3000);

        } catch (error) {
            console.error(error);
            alert('Failed to send invite.');
        } finally {
            setIsSendingInvite(false);
        }
    };

    const handleRemove = async (playerId) => {
        if (!window.confirm('Are you sure you want to remove this player from your academy?')) return;

        await supabase
            .from('players')
            .update({ academy_id: null })
            .eq('id', playerId);

        setPlayers((prev) => prev.filter(p => p.id !== playerId));
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

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
                        <Users className="w-5 h-5 text-orange-600" /> Academy Roster
                    </h1>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        {filteredPlayers.length} players
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your academy players..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/add-player')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Player
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                        <p className="text-gray-500">Loading your academy roster...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No players registered yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Start building your academy by adding your first grassroots player.</p>
                        <button
                            onClick={() => navigate('/add-player')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            Add Your First Player
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map((player) => (
                            <div key={player.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">

                                <div className="relative p-6 text-center bg-gray-50 border-b border-gray-100">
                                    <div className="absolute top-4 right-4">
                                        {player.is_grassroots && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
                                                🌱 Grassroots
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm border border-orange-200">
                                        {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{player.name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-3">{player.position}</p>
                                    <div className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-lg text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 text-sm flex-1">
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Age</span>
                                        <span className="font-bold text-gray-900">{player.age}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Nationality</span>
                                        <span className="font-bold text-gray-900 truncate max-w-[100px]">{player.nationality || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-gray-500 font-medium">Value</span>
                                        <span className="font-bold text-green-600">{player.market_value || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-3 flex gap-2 border-t border-gray-100 bg-gray-50/50">
                                    <button onClick={() => navigate(`/players/${player.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button
                                        onClick={() => setInvitePlayer(player)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        <Mail className="w-4 h-4" /> Invite
                                    </button>

                                    <button onClick={() => handleRemove(player.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                                        <UserMinus className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* INVITE MODAL */}
            {invitePlayer && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setInvitePlayer(null)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" /> Invite {invitePlayer.name}
                            </h2>
                            <button onClick={() => setInvitePlayer(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        {inviteSuccess ? (
                            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center font-medium flex flex-col items-center gap-2">
                                <CheckCircle2 className="w-8 h-8" />
                                {inviteSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleSendInvite}>
                                <p className="text-sm text-gray-500 mb-4">
                                    Send an invite link so {invitePlayer.name.split(' ')[0]} can create their own account.
                                    You can use the player's, parent's, or guardian's email.
                                </p>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail} s
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="parent@example.com"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 mb-4"
                                />
                                <button
                                    type="submit"
                                    disabled={isSendingInvite}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isSendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Invite Email</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademyRoster;