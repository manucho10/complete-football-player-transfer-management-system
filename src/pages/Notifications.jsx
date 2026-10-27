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
    Star,
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

    // ================================================================
    // STATE
    // ================================================================
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Supabase Data State
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ================================================================
    // FETCH FROM SUPABASE
    // ================================================================
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

    // ================================================================
    // CONFIG
    // ================================================================
    const typeConfig = {
        offer: {
            icon: <FileText className="w-5 h-5" />,
            label: 'Offer',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
        },
        message: {
            icon: <MessageSquare className="w-5 h-5" />,
            label: 'Message',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
        },
        interest: {
            icon: <Eye className="w-5 h-5" />,
            label: 'Interest',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
        },
        contract: {
            icon: <Award className="w-5 h-5" />,
            label: 'Contract',
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
        },
        system: {
            icon: <SettingsIcon className="w-5 h-5" />,
            label: 'System',
            color: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/30',
        },
    };

    const priorityConfig = {
        high: { color: 'bg-red-500', label: 'High' },
        medium: { color: 'bg-yellow-500', label: 'Medium' },
        low: { color: 'bg-gray-500', label: 'Low' },
    };

    // ================================================================
    // DERIVED DATA
    // ================================================================
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

    // ================================================================
    // HANDLERS
    // ================================================================
    const handleMarkRead = async (id) => {
        try {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
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

    // ⭐ The main click handler for a notification row
    const handleNotificationClick = (n) => {
        if (!n.read) handleMarkRead(n.id);
        setSelectedNotification(n);
    };

    // ⭐ The action button handler (inside the row or modal)
    const handleActionClick = (n, e = null) => {
        if (e) e.stopPropagation();
        if (!n.read) handleMarkRead(n.id);

        setSelectedNotification(null); // Close modal if open

        if (n.action_path) {
            navigate(n.action_path);
        }
    };

    if (!user) return null;

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-green-400" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="w-6 h-6 bg-red-500 rounded-full text-xs font-semibold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <CheckCheck className="w-4 h-4" /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="inline-flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Clear all
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden inline-flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-700/50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filter {activeFilter !== 'all' && `(${activeFilter})`}
                    </button>
                </div>

                {/* Filter tabs */}
                <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveFilter(tab.id);
                                    setShowFilters(false);
                                }}
                                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === tab.id
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === tab.id
                                            ? 'bg-green-500/30 text-green-300'
                                            : 'bg-gray-700 text-gray-500'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
                        <p className="text-gray-400">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No notifications</h3>
                        <p className="text-sm text-gray-400">
                            {searchQuery
                                ? 'No notifications match your search'
                                : activeFilter === 'unread'
                                    ? "You're all caught up! 🎉"
                                    : 'Nothing here yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredNotifications.map((n) => {
                            const cfg = typeConfig[n.type] || typeConfig.system;
                            const pCfg = priorityConfig[n.priority] || priorityConfig.medium;

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`group bg-gray-800/50 backdrop-blur-lg rounded-xl border transition-all cursor-pointer hover:border-gray-600 ${!n.read ? 'border-green-500/30 bg-gray-800/70' : 'border-gray-700'
                                        }`}
                                >
                                    <div className="p-4 flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`w-11 h-11 ${cfg.bg} ${cfg.color} rounded-xl flex items-center justify-center flex-shrink-0 relative`}
                                        >
                                            {cfg.icon}
                                            {!n.read && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3
                                                        className={`text-sm font-semibold ${!n.read ? 'text-white' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        {n.title}
                                                    </h3>
                                                    <span
                                                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${cfg.bg} ${cfg.color}`}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-400 line-clamp-2 mb-2">{n.message}</p>

                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-3">
                                                    {/* Priority dot */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${pCfg.color}`}></span>
                                                        <span className="text-xs text-gray-500">{pCfg.label} priority</span>
                                                    </div>

                                                    {/* Action button */}
                                                    {n.action_path && n.action_label && (
                                                        <button
                                                            onClick={(e) => handleActionClick(n, e)}
                                                            className="text-xs text-green-400 hover:text-green-300 font-semibold"
                                                        >
                                                            {n.action_label} →
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Read/unread status */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!n.read) handleMarkRead(n.id);
                                                    }}
                                                    className={`text-xs flex items-center gap-1 transition-colors ${n.read
                                                            ? 'text-gray-500 cursor-default'
                                                            : 'text-gray-400 hover:text-white'
                                                        }`}
                                                    disabled={n.read}
                                                >
                                                    {n.read ? (
                                                        <>
                                                            <CheckCheck className="w-3.5 h-3.5" /> Read
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-3.5 h-3.5" /> Mark read
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hover delete */}
                                        <button
                                            onClick={(e) => handleDelete(n.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all flex-shrink-0"
                                            aria-label="Delete notification"
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

            {/* ==================== DETAIL MODAL ==================== */}
            {selectedNotification && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedNotification(null)}
                >
                    <div
                        className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 ${(typeConfig[selectedNotification.type] || typeConfig.system).bg
                                        } ${(typeConfig[selectedNotification.type] || typeConfig.system).color} rounded-xl flex items-center justify-center flex-shrink-0`}
                                >
                                    {(typeConfig[selectedNotification.type] || typeConfig.system).icon}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h2 className="text-lg font-bold mb-1">{selectedNotification.title}</h2>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(selectedNotification.created_at).toLocaleString()}
                                        </span>
                                        <span>•</span>
                                        <span className={`flex items-center gap-1 ${(typeConfig[selectedNotification.type] || typeConfig.system).color}`}>
                                            {(typeConfig[selectedNotification.type] || typeConfig.system).label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {selectedNotification.full_text || selectedNotification.message}
                            </p>

                            {/* Priority indicator */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-700/30 rounded-lg p-3">
                                <span
                                    className={`w-2 h-2 rounded-full ${(priorityConfig[selectedNotification.priority] || priorityConfig.medium).color
                                        }`}
                                ></span>
                                <span>
                                    <span className="font-semibold">
                                        {(priorityConfig[selectedNotification.priority] || priorityConfig.medium).label} priority
                                    </span>{' '}
                                    notification
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => handleDelete(selectedNotification.id)}
                                className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-xl font-semibold transition-all flex-1"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>

                            {selectedNotification.action_path && (
                                <button
                                    onClick={() => handleActionClick(selectedNotification)}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-3 px-4 rounded-xl font-semibold transition-all flex-1"
                                >
                                    {selectedNotification.action_label || 'View Details'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default Notifications;