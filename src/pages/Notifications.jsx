// src/pages/Notifications.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    Search,
    Check,
    CheckCheck,
    Trash2,
    X,
    Filter,
    Eye,
    MessageSquare,
    FileText,
    Clock,
    Settings as SettingsIcon,
    Award,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} from '../lib/dbService';

const Notifications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadNotifications = async () => {
            setIsLoading(true);
            try {
                const data = await fetchNotifications(user.id);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, [user]);

    // Config for Light Mode
    const typeConfig = {
        offer: { icon: <FileText className="w-5 h-5" />, label: 'Offer', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        message: { icon: <MessageSquare className="w-5 h-5" />, label: 'Message', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        interest: { icon: <Eye className="w-5 h-5" />, label: 'Interest', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        contract: { icon: <Award className="w-5 h-5" />, label: 'Contract', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
        system: { icon: <SettingsIcon className="w-5 h-5" />, label: 'System', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
    };

    const priorityConfig = {
        high: { color: 'bg-red-500', label: 'High' },
        medium: { color: 'bg-yellow-500', label: 'Medium' },
        low: { color: 'bg-gray-400', label: 'Low' },
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const filterTabs = [
        { id: 'all', label: 'All', count: notifications.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
        { id: 'offer', label: 'Offers', count: notifications.filter((n) => n.type === 'offer').length },
        { id: 'message', label: 'Messages', count: notifications.filter((n) => n.type === 'message').length },
        { id: 'interest', label: 'Interest', count: notifications.filter((n) => n.type === 'interest').length },
        { id: 'system', label: 'System', count: notifications.filter((n) => n.type === 'system' || n.type === 'contract').length },
    ];

    const filteredNotifications = useMemo(() => {
        let result = [...notifications];

        if (activeFilter === 'unread') {
            result = result.filter((n) => !n.read);
        } else if (activeFilter !== 'all') {
            if (activeFilter === 'system') {
                result = result.filter((n) => n.type === 'system' || n.type === 'contract');
            } else {
                result = result.filter((n) => n.type === activeFilter);
            }
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n) =>
                    (n.title && n.title.toLowerCase().includes(q)) ||
                    (n.message && n.message.toLowerCase().includes(q))
            );
        }

        return result;
    }, [notifications, activeFilter, searchQuery]);

    const handleMarkRead = async (id) => {
        try {
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
            await markNotificationRead(id);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        try {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            await markAllNotificationsRead(user.id);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id, e = null) => {
        if (e) e.stopPropagation();
        try {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            if (selectedNotification?.id === id) setSelectedNotification(null);
            await deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Delete all notifications? This cannot be undone.')) {
            const idsToDelete = notifications.map(n => n.id);
            setNotifications([]);
            setSelectedNotification(null);
            idsToDelete.forEach(id => deleteNotification(id).catch(console.error));
        }
    };

    const handleNotificationClick = (n) => {
        if (!n.read) handleMarkRead(n.id);
        setSelectedNotification(n);
    };

    const handleActionClick = (n, e = null) => {
        if (e) e.stopPropagation();
        if (!n.read) handleMarkRead(n.id);
        setSelectedNotification(null);
        if (n.action_path) navigate(n.action_path);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                <Bell className="w-5 h-5 text-green-600" /> Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
                                    <CheckCheck className="w-4 h-4" /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" /> Clear all
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden inline-flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter {activeFilter !== 'all' && `(${activeFilter})`}
                    </button>
                </div>

                {/* Filter tabs */}
                <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveFilter(tab.id); setShowFilters(false); }}
                                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeFilter === tab.id
                                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === tab.id ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'No notifications match your search'
                                : activeFilter === 'unread' ? "You're all caught up! 🎉"
                                    : 'Nothing here yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((n) => {
                            const cfg = typeConfig[n.type] || typeConfig.system;
                            const pCfg = priorityConfig[n.priority] || priorityConfig.medium;

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`group bg-white rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${!n.read ? 'border-green-300' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="p-4 flex items-start gap-4">

                                        {/* Icon */}
                                        <div className={`w-12 h-12 ${cfg.bg} ${cfg.color} border ${cfg.border} rounded-xl flex items-center justify-center flex-shrink-0 relative`}>
                                            {cfg.icon}
                                            {!n.read && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                        {n.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-400 flex-shrink-0">
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{n.message}</p>

                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${pCfg.color}`}></span>
                                                        <span className="text-xs font-medium text-gray-500">{pCfg.label} priority</span>
                                                    </div>
                                                    {n.action_path && n.action_label && (
                                                        <button onClick={(e) => handleActionClick(n, e)} className="text-xs font-bold text-green-600 hover:text-green-700">
                                                            {n.action_label} →
                                                        </button>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (!n.read) handleMarkRead(n.id); }}
                                                    className={`text-xs font-semibold flex items-center gap-1 transition-colors ${n.read ? 'text-gray-400 cursor-default' : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    disabled={n.read}
                                                >
                                                    {n.read ? <><CheckCheck className="w-3.5 h-3.5" /> Read</> : <><Check className="w-3.5 h-3.5" /> Mark read</>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hover delete */}
                                        <button
                                            onClick={(e) => handleDelete(n.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedNotification(null)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>

                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 ${(typeConfig[selectedNotification.type] || typeConfig.system).bg} ${(typeConfig[selectedNotification.type] || typeConfig.system).color} border ${(typeConfig[selectedNotification.type] || typeConfig.system).border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    {(typeConfig[selectedNotification.type] || typeConfig.system).icon}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedNotification.title}</h2>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 flex-wrap">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(selectedNotification.created_at).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className={(typeConfig[selectedNotification.type] || typeConfig.system).color}>
                                            {(typeConfig[selectedNotification.type] || typeConfig.system).label}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNotification(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {selectedNotification.full_text || selectedNotification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">
                                <span className={`w-2 h-2 rounded-full ${(priorityConfig[selectedNotification.priority] || priorityConfig.medium).color}`}></span>
                                <span className="font-semibold">{(priorityConfig[selectedNotification.priority] || priorityConfig.medium).label} priority notification</span>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                            <button onClick={() => handleDelete(selectedNotification.id)} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex-1">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            {selectedNotification.action_path && (
                                <button onClick={() => handleActionClick(selectedNotification)} className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex-1">
                                    {selectedNotification.action_label || 'View Details'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}} />
        </div>
    );
};

export default Notifications;