// src/pages/Transfers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Search, Plus, X, Check, XCircle, Clock,
    DollarSign, Building2, ChevronDown, MessageSquare, FileText,
    CheckCircle2, Handshake, Loader2, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTransfers, updateTransferStatus, createTransferOffer, submitCounterOffer } from '../lib/dbService';
import { generateTransferContract } from '../lib/generateContract';
import { supabase } from '../lib/SupabaseClient';

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
    const [showNegotiationForm, setShowNegotiationForm] = useState(false);
    const [counterAmount, setCounterAmount] = useState('');
    const [counterSalary, setCounterSalary] = useState('');
    const [isNegotiating, setIsNegotiating] = useState(false);


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
        pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        negotiating: { label: 'Negotiating', icon: <Handshake className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        accepted: { label: 'Accepted', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
        rejected: { label: 'Rejected', icon: <XCircle className="w-4 h-4" />, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
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
        pending: filteredOffers.filter((o) => o.status === 'pending' || !['negotiating', 'accepted', 'rejected'].includes(o.status)),
        negotiating: filteredOffers.filter((o) => o.status === 'negotiating'),
        accepted: filteredOffers.filter((o) => o.status === 'accepted'),
        rejected: filteredOffers.filter((o) => o.status === 'rejected'),
    };

    const totalValue = filteredOffers
        .filter((o) => o.status === 'accepted')
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const stats = [
        { label: 'Total Offers', value: offers.length, icon: <FileText className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        { label: 'In Negotiation', value: offersByStatus.negotiating.length, icon: <Handshake className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
        { label: 'Accepted', value: offersByStatus.accepted.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
        { label: 'Total Deal Value', value: `€${(totalValue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50' },
    ];

    const handleStatusChange = async (offerId, action) => {
        try {
            const offer = offers.find(o => o.id === offerId);
            if (!offer) return;

            const updates = {};
            const isTeam = user.id === offer.from_user_id;
            const isPlayer = user.id === offer.player_user_id;

            if (action === 'reject') {
                updates.status = 'rejected';
            } else if (action === 'accept') {
                if (isTeam) updates.team_accepted = true;
                if (isPlayer) updates.player_accepted = true;

                if ((isTeam && offer.player_accepted) || (isPlayer && offer.team_accepted)) {
                    updates.status = 'accepted';
                }
            }

            await supabase.from('transfers').update(updates).eq('id', offerId);

            const updatedOffers = await fetchTransfers(user.id);
            setOffers(updatedOffers);
            setSelectedOffer(null);

        } catch (error) {
            console.error('Failed to update status:', error);
            alert(`Failed to update: ${error.message}`);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        if (!newOfferData.playerName || !newOfferData.amount) return;

        setIsSubmitting(true);
        try {
            const { data: playerData, error: playerError } = await supabase
                .from('players')
                .select('id, user_id')
                .ilike('name', `%${newOfferData.playerName}%`)
                .maybeSingle();

            if (playerError || !playerData) {
                alert("Player not found. Please ensure the name matches a registered player exactly.");
                setIsSubmitting(false);
                return;
            }

            const newOffer = await createTransferOffer({
                from_user_id: user.id,
                from_name: user.name || 'My Club',
                to_user_id: playerData.user_id,
                player_user_id: playerData.user_id,
                player_id: playerData.id,
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

    const handleCompleteTransfer = async () => {
        try {
            const { data: playerData } = await supabase
                .from('players')
                .select('id')
                .eq('name', selectedOffer.playerName)
                .maybeSingle();

            if (!playerData) {
                alert("Player record not found in database. Ensure their name matches exactly.");
                return;
            }

            await supabase
                .from('players')
                .update({
                    team_id: user.id,
                    club: user.name || 'My Club',
                    availability: 'Under Contract'
                })
                .eq('id', playerData.id);

            alert("Player successfully added to your squad!");
            navigate('/squad');

        } catch (error) {
            console.error(error);
            alert("Failed to complete transfer.");
        }
    };

    const handleCounterOffer = async () => {
        if (!counterAmount || !selectedOffer) return;
        setIsNegotiating(true);
        try {
            await submitCounterOffer(selectedOffer.id, Number(counterAmount), counterSalary);
            alert('Counter-offer submitted to the club!');
            setShowNegotiationForm(false);
            setSelectedOffer(null);
            const updatedOffers = await fetchTransfers(user.id);
            setOffers(updatedOffers);
        } catch (error) {
            alert('Failed to submit counter-offer.');
        } finally {
            setIsNegotiating(false);
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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                            <TrendingUp className="w-5 h-5 text-green-600" /> Transfers
                        </h1>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">{filteredOffers.length} offers</span>
                    </div>
                    {['team', 'agent'].includes(user.role) && (
                        <button
                            onClick={() => setShowNewOfferModal(true)}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Offer
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className={`inline-flex p-2.5 rounded-xl ${s.color} mb-4`}>{s.icon}</div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by player or club..." className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm" />
                    </div>
                    <div className="relative">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer shadow-sm">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
                        <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>Pipeline</button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>List</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading transfers from database...</p>
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
                                        <div key={status} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                            <div className={`px-4 py-3 border-b ${cfg.border} ${cfg.bg} flex items-center justify-between`}>
                                                <div className={`flex items-center gap-2 ${cfg.color} font-bold text-sm`}>{cfg.icon} {cfg.label}</div>
                                                <span className={`text-xs font-bold ${cfg.color} bg-white border ${cfg.border} px-2 py-0.5 rounded-full`}>{items.length}</span>
                                            </div>
                                            <div className="p-3 space-y-3 flex-1 min-h-[200px] bg-gray-50/50">
                                                {items.length === 0 ? (
                                                    <div className="text-center text-xs font-medium text-gray-400 py-8">No offers</div>
                                                ) : (
                                                    items.map((offer) => (
                                                        <button key={offer.id} onClick={() => setSelectedOffer(offer)} className="w-full text-left bg-white hover:bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 shadow-sm transition-all">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{offer.playerName || 'Unknown Player'}</p>
                                                                {offer.priority === 'high' && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mb-3">{offer.player_position || 'Position'} • {offer.player_club || 'Club'}</p>
                                                            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                                                <span className="text-sm font-bold text-green-600">{formatMoney(offer.amount)}</span>
                                                                <span className="text-[10px] font-medium text-gray-400">{new Date(offer.created_at).toLocaleDateString()}</span>
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
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {filteredOffers.length === 0 ? (
                                    <div className="p-12 text-center bg-gray-50">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No offers match your filters</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredOffers.map((offer) => {
                                            const cfg = statusConfig[offer.status];
                                            return (
                                                <button key={offer.id} onClick={() => setSelectedOffer(offer)} className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-bold text-gray-900 truncate">{offer.playerName || 'Unknown Player'}</p>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cfg.bg} ${cfg.color} ${cfg.border} flex items-center gap-1`}>{cfg.icon} {cfg.label}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 font-medium">{offer.from_name || 'Buying Club'} → {offer.to_name || 'Selling Club'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">{formatMoney(offer.amount)}</p>
                                                            <p className="text-xs font-medium text-gray-400">{new Date(offer.created_at).toLocaleDateString()}</p>
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
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedOffer(null)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="relative p-6 border-b border-gray-200 bg-gray-50">
                            <button onClick={() => setSelectedOffer(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-green-200">
                                    <Handshake className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">{selectedOffer.playerName || 'Transfer Offer'}</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Offer #{selectedOffer.id.slice(0, 8)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${statusConfig[selectedOffer.status]?.bg} ${statusConfig[selectedOffer.status]?.color} ${statusConfig[selectedOffer.status]?.border} flex items-center gap-1`}>
                                            {statusConfig[selectedOffer.status]?.icon} {statusConfig[selectedOffer.status]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Transfer Fee</p>
                                    <p className="text-2xl font-bold text-green-600">{formatMoney(selectedOffer.amount)}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contract Duration</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedOffer.duration || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-green-600" /> Parties Involved
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">From (Buying Club)</p>
                                            <p className="font-bold text-gray-900 mt-1">{selectedOffer.from_name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    {user.id !== selectedOffer.player_user_id && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">To (Selling Club)</p>
                                                <p className="font-bold text-gray-900 mt-1">{selectedOffer.to_name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedOffer.notes && (
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-green-600" /> Notes
                                    </h3>
                                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                        {selectedOffer.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">

                                {selectedOffer.status === 'negotiating' && (
                                    <div className="flex gap-3 mb-2">
                                        <div className={`flex-1 text-center p-3 rounded-xl text-xs font-bold border ${selectedOffer.team_accepted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            Team: {selectedOffer.team_accepted ? 'Accepted' : 'Pending'}
                                        </div>
                                        <div className={`flex-1 text-center p-3 rounded-xl text-xs font-bold border ${selectedOffer.player_accepted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            Player: {selectedOffer.player_accepted ? 'Accepted' : 'Pending'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={() => navigate('/messages')} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </button>

                                    {user.role === 'agent' && selectedOffer.status !== 'accepted' && selectedOffer.status !== 'rejected' && (
                                        <button onClick={() => navigate(`/negotiate/${selectedOffer.id}`)} className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                            <Handshake className="w-4 h-4" /> Negotiate
                                        </button>
                                    )}

                                    {selectedOffer.status !== 'accepted' && selectedOffer.status !== 'rejected' && (
                                        <>
                                            <button onClick={() => handleStatusChange(selectedOffer.id, 'reject')} className="inline-flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>

                                            {((user.id === selectedOffer.from_user_id && !selectedOffer.team_accepted) ||
                                                (user.id === selectedOffer.player_user_id && !selectedOffer.player_accepted)) && (
                                                    <button onClick={() => handleStatusChange(selectedOffer.id, 'accept')} className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                                        <Check className="w-4 h-4" /> Accept Terms
                                                    </button>
                                                )}
                                        </>
                                    )}
                                </div>

                                {selectedOffer.status === 'accepted' && (
                                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                        <button onClick={() => generateTransferContract(selectedOffer)} className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                            <Download className="w-4 h-4" /> Download PDF
                                        </button>
                                        {['team', 'agent'].includes(user.role) && (
                                            <button onClick={handleCompleteTransfer} className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm">
                                                <CheckCircle2 className="w-4 h-4" /> Sign Player
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW OFFER MODAL */}
            {showNewOfferModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowNewOfferModal(false)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><Plus className="w-5 h-5 text-green-600" /> Create New Offer</h2>
                            <button onClick={() => setShowNewOfferModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateOffer} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Player Name</label>
                                <input type="text" required value={newOfferData.playerName} onChange={(e) => setNewOfferData({ ...newOfferData, playerName: e.target.value })} placeholder="e.g., Lucas Ferreira" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Transfer Fee (€)</label>
                                    <input type="number" required value={newOfferData.amount} onChange={(e) => setNewOfferData({ ...newOfferData, amount: e.target.value })} placeholder="0" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                                    <select value={newOfferData.duration} onChange={(e) => setNewOfferData({ ...newOfferData, duration: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                                        <option>1 year</option><option>2 years</option><option>3 years</option><option>4 years</option><option>5 years</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                                <textarea rows={3} value={newOfferData.notes} onChange={(e) => setNewOfferData({ ...newOfferData, notes: e.target.value })} placeholder="Additional terms or notes..." className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowNewOfferModal(false)} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-bold transition-all shadow-sm">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-sm">
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