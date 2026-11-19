import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Loader2, ArrowLeft, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/SupabaseClient';

const AcademyTransferInbox = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ================================================================
    // 1. FETCH REAL TRANSFERS FROM DATABASE
    // ================================================================
    const fetchRequests = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch transfers where the Academy is the recipient
            const { data, error } = await supabase
                .from('transfers')
                .select('*')
                .eq('to_user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error("Error fetching transfers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]);

    // ================================================================
    // 2. HANDLE APPROVE / DECLINE
    // ================================================================
    const handleAction = async (id, action) => {
        try {
            const offer = requests.find(r => r.id === id);
            if (!offer) return;

            if (action === 'approved') {
                // 1. Update the transfer to route to the PLAYER (not the academy)
                const { error: transferError } = await supabase
                    .from('transfers')
                    .update({
                        to_user_id: offer.player_user_id, // ⭐ Forward to the player
                        status: 'negotiating'
                    })
                    .eq('id', id);

                if (transferError) throw transferError;

                // 2. Send a notification to the Player
                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert({
                        user_id: offer.player_user_id, // The player gets the alert
                        title: 'New Transfer Offer Approved',
                        message: `${offer.from_name} has made an offer for you. Your academy has approved the negotiation.`,
                        type: 'offer', // This matches your Notifications.jsx config
                        priority: 'high',
                        action_path: '/transfers', // Where they go when they click it
                        action_label: 'View Offer'
                    });

                if (notifError) console.error("Notification error:", notifError);

                alert('Offer approved and forwarded to the player!');

            } else {
                // Decline the offer
                const { error: declineError } = await supabase
                    .from('transfers')
                    .update({ status: 'rejected' })
                    .eq('id', id);

                if (declineError) throw declineError;
            }

            // Refresh the list to show the new status
            fetchRequests();

        } catch (error) {
            console.error('Failed to update request:', error);
            alert(`Failed to process request: ${error.message || error.details || 'Unknown error'}`); // 👈 Show the real error
        }


        // ================================================================
        // 3. RENDER
        // ================================================================
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transfer Requests</h1>
                        <p className="text-gray-500">Manage incoming offers for your academy players.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading transfer requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No requests yet</h3>
                        <p className="text-sm text-gray-500">When clubs send offers for your players, they will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                                    <div>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded-md mb-2 border border-green-200">
                                            <AlertCircle className="w-3 h-3" /> Transfer Offer
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {req.playerName || 'Player Name'}
                                            <span className="text-sm font-normal text-gray-500 ml-2">(€{Number(req.amount).toLocaleString()})</span>
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            From: <span className="font-semibold text-gray-700">{req.from_name || 'Unknown Club'}</span> • {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="text-right">
                                        {req.status === 'negotiating' && <span className="text-blue-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Forwarded to Player</span>}
                                        {req.status === 'rejected' && <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> Declined</span>}
                                        {req.status === 'pending' && <span className="text-yellow-600 font-bold text-sm bg-yellow-50 px-2 py-1 rounded border border-yellow-200">Pending Review</span>}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-700 text-sm border border-gray-100">
                                    <p className="font-semibold text-gray-900 mb-1">Offer Details:</p>
                                    <p>Duration: {req.duration || 'N/A'}</p>
                                    {req.notes && <p className="mt-2 italic text-gray-600">"{req.notes}"</p>}
                                </div>

                                {/* Action Buttons (Only show if pending) */}
                                {req.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction(req.id, 'approved')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve & Forward to Player
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'declined')}
                                            className="flex-1 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <XCircle className="w-4 h-4" /> Decline
                                        </button>
                                        <button onClick={() => navigate('/messages')} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                                            <MessageSquare className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    export default AcademyTransferInbox;