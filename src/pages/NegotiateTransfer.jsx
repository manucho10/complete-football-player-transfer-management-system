// src/pages/NegotiateTransfer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Handshake, DollarSign, Calendar, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';
import { submitCounterOffer } from '../lib/dbService';

const NegotiateTransfer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [newAmount, setNewAmount] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchOffer = async () => {
            const { data, error } = await supabase
                .from('transfers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                setError('Offer not found.');
            } else {
                setOffer(data);
                // Pre-fill the form with the current offer details
                setNewAmount(data.amount || '');
                setNewSalary(data.salary || '');
            }
            setIsLoading(false);
        };

        if (id) fetchOffer();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAmount) return;
        setIsSubmitting(true);

        try {
            // Calls the function we added to dbService.js earlier
            await submitCounterOffer(offer.id, Number(newAmount), newSalary);

            // Update the transfer notes manually
            await supabase.from('transfers').update({ notes }).eq('id', offer.id);

            alert('Counter-offer submitted to the club!');
            navigate('/transfers'); // Go back to the Kanban board
        } catch (err) {
            alert('Failed to submit counter-offer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500">Loading offer...</p>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-500 mb-4">{error}</p>
                <button onClick={() => navigate('/transfers')} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    // Calculate the 5% commission
    const estimatedCommission = Number(newAmount) * 0.05;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/transfers')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Pipeline
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Handshake className="w-5 h-5 text-purple-600" /> Negotiate Transfer
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Current Offer Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 text-gray-900">Current Offer</h2>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Player</p>
                                <p className="text-lg font-bold text-gray-900">{offer.playerName || 'Unknown'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Transfer Fee</p>
                                    <p className="text-xl font-bold text-green-600">€{Number(offer.amount).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contract</p>
                                    <p className="text-xl font-bold text-gray-900">{offer.duration || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Offered By (Club)</p>
                                <p className="text-lg font-bold text-blue-600">{offer.from_name || 'Unknown Club'}</p>
                            </div>

                            {offer.notes && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Club Notes</p>
                                    <p className="text-sm text-gray-700">{offer.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Negotiation Form */}
                    <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <h2 className="text-xl font-bold mb-6 text-gray-900 relative z-10">Your Counter-Offer</h2>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Transfer Fee (€)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Salary (€/year)</label>
                                <input
                                    type="text"
                                    value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    placeholder="e.g. 2.5M"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message to Club</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Explain why your client is worth this amount..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                                />
                            </div>

                            {/* Commission Preview */}
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                <p className="text-sm font-semibold text-green-700 mb-1">Estimated Agent Commission (5%)</p>
                                <p className="text-2xl font-bold text-green-600">
                                    €{estimatedCommission.toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !newAmount}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Counter-Offer'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NegotiateTransfer;