// src/pages/Transfers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Search, Plus, X, Check, XCircle, Clock,
    DollarSign, Building2, ChevronDown, MessageSquare, FileText,
    CheckCircle2, Handshake, Loader2, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTransfers, updateTransferStatus, createTransferOffer } from '../lib/dbService';
import { generateTransferContract } from '../lib/generateContract';

const Transfers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('kanban');
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showNewOfferModal, setShowNewOfferModal] = useState(false);

    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newOfferData, setNewOfferData] = useState({
        playerName: '', amount: '', duration: '4 years', notes: ''
    });

    useEffect(() => {
        if (!user) return;
        const loadTransfers = async () => {
            setIsLoading(true);
            try {
                const data = await fetchTransfers(user.id);
                setOffers(data);
            } catch (error) {
                console.error('Failed to load transfers:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTransfers();
    }, [user]);

    const statusConfig = {
        pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        negotiating: { label: 'Negotiating', icon: <Handshake className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        accepted: { label: 'Accepted', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/10' },
        rejected: { label: 'Rejected', icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    };

    const filteredOffers = useMemo(() => {
        return offers.filter((o) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                (o.playerName && o.playerName.toLowerCase().includes(searchLower)) ||
                (o.from_name && o.from_name.toLowerCase().includes(searchLower)) ||
                (o.to_name && o.to_name.toLowerCase().includes(searchLower));
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [offers, searchQuery, statusFilter]);

    const offersByStatus = {
        pending: filteredOffers.filter((o) => o.status === 'pending'),
        negotiating: filteredOffers.filter((o) => o.status === 'negotiating'),
        accepted: filteredOffers.filter((o) => o.status === 'accepted'),
        rejected: filteredOffers.filter((o) => o.status === 'rejected'),
    };

    const totalValue = filteredOffers
        .filter((o) => o.status === 'accepted')
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const stats = [
        { label: 'Total Offers', value: offers.length, icon: <FileText className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'In Negotiation', value: offersByStatus.negotiating.length, icon: <Handshake className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Accepted', value: offersByStatus.accepted.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
        { label: 'Total Deal Value', value: `€${(totalValue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-5 h-5" />, color: 'text-yellow-400 bg-yellow-500/10' },
    ];

    const handleStatusChange = async (offerId, newStatus) => {
        try {
            setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o)));

            // ⭐ Update the currently selected offer so the PDF button appears instantly
            if (selectedOffer && selectedOffer.id === offerId) {
                setSelectedOffer((prev) => ({ ...prev, status: newStatus }));
            }

            await updateTransferStatus(offerId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update transfer status. Please try again.');
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        if (!newOfferData.playerName || !newOfferData.amount) return;

        setIsSubmitting(true);
        try {
            const newOffer = await createTransferOffer({
                from_user_id: user.id,
                from_name: user.name || 'My Club',
                player_name: newOfferData.playerName,
                amount: Number(newOfferData.amount),
                duration: newOfferData.duration,
                notes: newOfferData.notes,
                status: 'pending',
                priority: 'medium',
            });

            setOffers([newOffer, ...offers]);
            setShowNewOfferModal(false);
            setNewOfferData({ playerName: '', amount: '', duration: '4 years', notes: '' });
        } catch (error) {
            console.error('Failed to create offer:', error);
            alert('Failed to create offer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatMoney = (amount, currency = '€') => {
        if (!amount) return '€0';
        if (amount >= 1000000) return `${currency}${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${currency}${(amount / 1000).toFixed(0)}K`;
        return `${currency}${amount}`;
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" /> Transfers
                        </h1>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">{filteredOffers.length} offers</span>
                    </div>
                    <button onClick={() => setShowNewOfferModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                        <Plus className="w-4 h-4" /> New Offer
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-5 border border-gray-700">
                            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>{s.icon}</div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by player or club..." className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors" />
                    </div>
                    <div className="relative">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-gray-800/50 border border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-green-500 cursor-pointer">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="flex bg-gray-800/50 border border-gray-700 rounded-xl p-1">
                        <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'kanban' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}>Pipeline</button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}>List</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                        <p className="text-gray-400">Loading transfers from database...</p>
                    </div>
                ) : (
                    <>
                        {/* KANBAN VIEW */}
                        {viewMode === 'kanban' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['pending', 'negotiating', 'accepted', 'rejected'].map((status) => {
                                    const cfg = statusConfig[status];
                                    const items = offersByStatus[status];
                                    return (
                                        <div key={status} className="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                                            <div className={`px-4 py-3 border-b border-gray-700 ${cfg.bg} flex items-center justify-between`}>
                                                <div className={`flex items-center gap-2 ${cfg.color} font-semibold text-sm`}>{cfg.icon} {cfg.label}</div>
                                                <span className={`text-xs font-semibold ${cfg.color} bg-gray-800/50 px-2 py-0.5 rounded-full`}>{items.length}</span>
                                            </div>
                                            <div className="p-3 space-y-3 flex-1 min-h-[200px]">
                                                {items.length === 0 ? (
                                                    <div className="text-center text-xs text-gray-500 py-8">No offers</div>
                                                ) : (
                                                    items.map((offer) => (
                                                        <button key={offer.id} onClick={() => setSelectedOffer(offer)} className="w-full text-left bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <p className="text-sm font-semibold truncate">{offer.playerName || 'Unknown Player'}</p>
                                                                {offer.priority === 'high' && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">{offer.player_position || 'Position'} • {offer.player_club || 'Club'}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-bold text-green-400">{formatMoney(offer.amount)}</span>
                                                                <span className="text-[10px] text-gray-500">{new Date(offer.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* LIST VIEW */}
                        {viewMode === 'list' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
                                {filteredOffers.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-400">No offers match your filters</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {filteredOffers.map((offer) => {
                                            const cfg = statusConfig[offer.status];
                                            return (
                                                <button key={offer.id} onClick={() => setSelectedOffer(offer)} className="w-full text-left p-4 hover:bg-gray-700/30 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold truncate">{offer.playerName || 'Unknown Player'}</p>
                                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${cfg.bg} ${cfg.color} flex items-center gap-1`}>{cfg.icon} {cfg.label}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400">{offer.from_name || 'Buying Club'} → {offer.to_name || 'Selling Club'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-400">{formatMoney(offer.amount)}</p>
                                                            <p className="text-xs text-gray-500">{new Date(offer.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* OFFER DETAIL MODAL */}
            {selectedOffer && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedOffer(null)}>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="relative p-6 border-b border-gray-700">
                            <button onClick={() => setSelectedOffer(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Handshake className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <h2 className="text-xl font-bold truncate">{selectedOffer.playerName || 'Transfer Offer'}</h2>
                                    <p className="text-sm text-gray-400">Offer #{selectedOffer.id.slice(0, 8)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${statusConfig[selectedOffer.status]?.bg} ${statusConfig[selectedOffer.status]?.color} flex items-center gap-1`}>
                                            {statusConfig[selectedOffer.status]?.icon} {statusConfig[selectedOffer.status]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-1">Transfer Fee</p>
                                    <p className="text-xl font-bold text-green-400">{formatMoney(selectedOffer.amount)}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-1">Contract Duration</p>
                                    <p className="text-xl font-bold">{selectedOffer.duration || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-green-400" /> Parties Involved</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div><p className="text-xs text-gray-400">From (Buying Club)</p><p className="font-semibold">{selectedOffer.from_name || 'Unknown'}</p></div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div><p className="text-xs text-gray-400">To (Selling Club)</p><p className="font-semibold">{selectedOffer.to_name || 'Unknown'}</p></div>
                                    </div>
                                </div>
                            </div>

                            {selectedOffer.notes && (
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-green-400" /> Notes</h3>
                                    <p className="text-sm text-gray-300 bg-gray-700/30 rounded-lg p-3">{selectedOffer.notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">

                                {/* ⭐ PDF DOWNLOAD BUTTON ⭐ */}
                                {selectedOffer.status === 'accepted' && (
                                    <button
                                        onClick={() => generateTransferContract(selectedOffer)}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all flex-1"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </button>
                                )}

                                <button onClick={() => navigate('/messages')} className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-xl font-semibold transition-all flex-1">
                                    <MessageSquare className="w-4 h-4" /> Message
                                </button>

                                {selectedOffer.status !== 'accepted' && selectedOffer.status !== 'rejected' && (
                                    <>
                                        <button onClick={() => handleStatusChange(selectedOffer.id, 'rejected')} className="inline-flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-4 rounded-xl font-semibold transition-all flex-1">
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                        <button onClick={() => handleStatusChange(selectedOffer.id, 'accepted')} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-3 px-4 rounded-xl font-semibold transition-all flex-1">
                                            <Check className="w-4 h-4" /> Accept
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW OFFER MODAL */}
            {showNewOfferModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowNewOfferModal(false)}>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-green-400" /> Create New Offer</h2>
                            <button onClick={() => setShowNewOfferModal(false)} className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateOffer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Player Name</label>
                                <input type="text" required value={newOfferData.playerName} onChange={(e) => setNewOfferData({ ...newOfferData, playerName: e.target.value })} placeholder="e.g., Lucas Ferreira" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Transfer Fee (€)</label>
                                    <input type="number" required value={newOfferData.amount} onChange={(e) => setNewOfferData({ ...newOfferData, amount: e.target.value })} placeholder="0" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                    <select value={newOfferData.duration} onChange={(e) => setNewOfferData({ ...newOfferData, duration: e.target.value })} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500">
                                        <option>1 year</option><option>2 years</option><option>3 years</option><option>4 years</option><option>5 years</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                                <textarea rows={3} value={newOfferData.notes} onChange={(e) => setNewOfferData({ ...newOfferData, notes: e.target.value })} placeholder="Additional terms or notes..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowNewOfferModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-semibold transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}} />
        </div>
    );
};

export default Transfers;