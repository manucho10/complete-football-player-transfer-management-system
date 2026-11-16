import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';

const AcademyTransferInbox = () => {
    // Mock data representing incoming requests
    const [requests, setRequests] = useState([
        {
            id: 1,
            playerName: "John Doe",
            playerPosition: "Striker (U-17)",
            fromClub: "FC Barcelona Academy",
            type: "Transfer Offer",
            message: "We are interested in signing John for our U-18 squad. We are offering a trial period.",
            date: "2 hours ago",
            status: "pending"
        },
        {
            id: 2,
            playerName: "Samuel Osei",
            playerPosition: "Center Back (U-15)",
            fromClub: "Manchester City Scout",
            type: "Scouting Message",
            message: "I will be attending your match this Saturday. Would it be okay to speak with Samuel's parents?",
            date: "1 day ago",
            status: "pending"
        }
    ]);

    const handleAction = (id, newStatus) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        ));
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Academy Inbox</h1>
                <p className="text-gray-500">Manage incoming transfer requests and scout messages for your youth players.</p>
            </div>

            <div className="space-y-4">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md mb-2">
                                    <AlertCircle className="w-3 h-3" /> {req.type}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">{req.playerName} <span className="text-sm font-normal text-gray-500">({req.playerPosition})</span></h3>
                                <p className="text-sm text-gray-500">From: <span className="font-semibold text-gray-700">{req.fromClub}</span> • {req.date}</p>
                            </div>

                            {/* Status Badge */}
                            <div>
                                {req.status === 'approved' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Forwarded to Player</span>}
                                {req.status === 'declined' && <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> Declined</span>}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-gray-700 text-sm">
                            "{req.message}"
                        </div>

                        {/* Action Buttons (Only show if pending) */}
                        {req.status === 'pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(req.id, 'approved')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve & Forward to Player
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'declined')}
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                                <button className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AcademyTransferInbox;