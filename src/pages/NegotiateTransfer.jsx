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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p>{error}</p>
                <button onClick={() => navigate('/transfers')} className="mt-4 bg-gray-700 px-4 py-2 rounded-lg">Go Back</button>
            </div>
        );
    }

    // Calculate the 5% commission
    const estimatedCommission = Number(newAmount) * 0.05;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/transfers')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Pipeline
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Handshake className="w-5 h-5 text-purple-400" /> Negotiate Transfer
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Current Offer Details */}
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-300">Current Offer</h2>

                        <div className="space-y-4">
                            <div className="bg-gray-700/30 p-4 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Player</p>
                                <p className="text-lg font-bold">{offer.playerName || 'Unknown'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700/30 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Transfer Fee</p>
                                    <p className="text-xl font-bold text-green-400">€{Number(offer.amount).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-700/30 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Contract</p>
                                    <p className="text-xl font-bold">{offer.duration || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-700/30 p-4 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Offered By (Club)</p>
                                <p className="text-lg font-bold text-blue-400">{offer.from_name || 'Unknown Club'}</p>
                            </div>

                            {offer.notes && (
                                <div className="bg-gray-700/30 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Club Notes</p>
                                    <p className="text-sm text-gray-300">{offer.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Negotiation Form */}
                    <div className="bg-purple-900/10 rounded-2xl border border-purple-500/30 p-6">
                        <h2 className="text-xl font-bold mb-6 text-purple-400">Your Counter-Offer</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">New Transfer Fee (€)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="number"
                                        required
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">New Salary (€/year)</label>
                                <input
                                    type="text"
                                    value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    placeholder="e.g. 2.5M"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Message to Club</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Explain why your client is worth this amount..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                                />
                            </div>

                            {/* Commission Preview */}
                            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                                <p className="text-sm text-green-400 mb-1">Estimated Agent Commission (5%)</p>
                                <p className="text-2xl font-bold text-green-400">
                                    €{estimatedCommission.toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !newAmount}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Counter-Offer'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NegotiateTransfer;