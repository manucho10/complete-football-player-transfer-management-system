// src/pages/ClubProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, DollarSign, Award, Users, MessageSquare, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';

const ClubProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [club, setClub] = useState(null);
    const [squad, setSquad] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

    const handleSendMessage = async () => {
        if (!contactMessage.trim() || !user) return;
        setIsSending(true);

        try {
            // 1. Check if a conversation already exists
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${club.id}),and(user1_id.eq.${club.id},user2_id.eq.${user.id})`)
                .maybeSingle();

            let conversationId = existingConv?.id;

            // 2. Create a new conversation if it doesn't exist
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

            // 4. Update the conversation's last message time
            await supabase.from('conversations').update({
                last_message: contactMessage,
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);

            // 5. Show success and close modal
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">Loading club profile...</p>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Club Not Found</h1>
                <button onClick={() => navigate('/browse-clubs')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold mt-4">
                    Back to Browse Clubs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={() => setShowContactModal(true)}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm"
                    >
                        <MessageSquare className="w-4 h-4" /> Contact Club
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="max-w-6xl mx-auto mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                </div>
            )}

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Hero Banner */}
                <div className="bg-white rounded-2xl p-6 sm:p-10 mb-6 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    {/* Club Logo / Initials */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#0a2e1f] text-green-400 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg shrink-0 z-10">
                        {club.team_name ? club.team_name.substring(0, 2).toUpperCase() : 'CL'}
                    </div>

                    {/* Club Info */}
                    <div className="flex-1 text-center sm:text-left z-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{club.team_name || club.full_name}</h1>

                        <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg font-medium text-gray-700 border border-gray-200">
                                <Award className="w-4 h-4 text-yellow-600" /> {club.league || 'Unknown League'}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg font-medium text-gray-700 border border-gray-200">
                                <MapPin className="w-4 h-4 text-red-600" /> {club.country || 'Global'}
                            </span>
                            <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-bold text-green-700">
                                <DollarSign className="w-4 h-4" /> Transfer Budget: {club.transfer_budget ? (club.transfer_budget / 1000000).toFixed(1) + 'M' : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Squad Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" /> Current Squad ({squad.length} Players)
                    </h2>

                    {squad.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-gray-500">This club hasn't signed any players yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {squad.map((player) => (
                                <div
                                    key={player.id}
                                    className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/players/${player.id}`)}
                                >
                                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 shrink-0">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{player.name}</p>
                                        <p className="text-xs text-gray-500">{player.position} • Age {player.age}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* CONTACT MODAL */}
            {showContactModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Contact {club.team_name || club.full_name}</h2>
                                    <p className="text-xs text-gray-500">Send a direct message to the club</p>
                                </div>
                            </div>
                            <button onClick={() => setShowContactModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                rows={5}
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder={`Hi, I'm interested in joining ${club.team_name || club.full_name}...`}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowContactModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!contactMessage.trim() || isSending}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
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