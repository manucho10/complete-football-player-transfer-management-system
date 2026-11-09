// src/pages/ClubProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, DollarSign, Award, Users, MessageSquare, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';

const ClubProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [club, setClub] = useState(null);
    const [squad, setSquad] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClubData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the Team's Profile
                const { data: teamData, error: teamError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .eq('role', 'team')
                    .single();

                if (teamError) throw teamError;
                setClub(teamData);

                // 2. Fetch the Players currently signed to this Team
                const { data: squadData } = await supabase
                    .from('players')
                    .select('*')
                    .eq('team_id', id)
                    .order('position', { ascending: true });

                setSquad(squadData || []);

            } catch (error) {
                console.error("Error loading club:", error);
                setClub(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadClubData();
    }, [id]);


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Loading club profile...</p>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Club Not Found</h1>
                <button onClick={() => navigate('/browse-clubs')} className="bg-blue-600 px-6 py-2 rounded-lg font-semibold mt-4">
                    Back to Browse Clubs
                </button>
            </div>
        );
    }
    // Modal State
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle Sending Message
    const handleSendMessage = async () => {
        if (!contactMessage.trim() || !user) return;
        setIsSending(true);

        try {
            // 1. Check if a conversation exists
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${club.id}),and(user1_id.eq.${club.id},user2_id.eq.${user.id})`)
                .maybeSingle();

            let conversationId = existingConv?.id;

            // 2. Create conversation if it doesn't exist
            if (!conversationId) {
                const { data: newConv, error: convError } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: club.id })
                    .select()
                    .single();

                if (convError) throw convError;
                conversationId = newConv.id;
            }

            // 3. Insert the message
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                text: contactMessage,
            });

            // 4. Update conversation metadata
            await supabase.from('conversations').update({
                last_message: contactMessage,
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);

            setShowContactModal(false);
            setContactMessage('');
            setSuccessMessage('Message sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error(error);
            alert('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={() => setShowContactModal(true)} // ⭐ Opens modal instead of navigating
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                        <MessageSquare className="w-4 h-4" /> Contact Club
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6">

                {/* Hero Banner */}
                <div className="relative bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 sm:p-10 mb-6 border border-gray-700 overflow-hidden">
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">

                        {/* Club Logo / Initials */}
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-gray-800 shrink-0">
                            {club.team_name ? club.team_name.substring(0, 2).toUpperCase() : 'CL'}
                        </div>

                        {/* Club Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-4xl font-bold mb-3">{club.team_name || club.full_name}</h1>

                            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-sm text-gray-300 mb-4">
                                <span className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-lg">
                                    <Award className="w-4 h-4 text-yellow-400" /> {club.league || 'Unknown League'}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-red-400" /> {club.country || 'Global'}
                                </span>
                                <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 font-semibold">
                                    <DollarSign className="w-4 h-4" /> Transfer Budget: {club.transfer_budget ? (club.transfer_budget / 1000000).toFixed(1) + 'M' : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Squad Section */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-400" /> Current Squad ({squad.length} Players)
                    </h2>

                    {squad.length === 0 ? (
                        <div className="text-center py-10 bg-gray-800/30 rounded-xl">
                            <p className="text-gray-400">This club hasn't signed any players yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {squad.map((player) => (
                                <div key={player.id} className="bg-gray-700/40 rounded-xl p-4 flex items-center gap-4 border border-gray-600 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate(`/players/${player.id}`)}>
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-lg font-bold text-blue-400 shrink-0">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{player.name}</p>
                                        <p className="text-xs text-gray-400">{player.position} • Age {player.age}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            {/* CONTACT MODAL */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowContactModal(false)}>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Contact {club.team_name || club.full_name}</h2>
                                    <p className="text-xs text-gray-400">Send a direct message to the club</p>
                                </div>
                            </div>
                            <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-700/50 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                rows={5}
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder={`Hi, I'm interested in joining ${club.team_name || club.full_name}...`}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowContactModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg text-sm font-semibold transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!contactMessage.trim() || isSending}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubProfile;