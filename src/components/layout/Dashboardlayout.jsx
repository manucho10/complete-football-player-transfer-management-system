// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    Bell,
    ChevronDown,
    User,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications'; // ⭐ Import Hook

const DashboardLayout = ({ children, roleConfig, navItems, recentActivity = [] }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // ⭐ Use the live notification hook
    const unreadCount = useNotifications();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleNavClick = (item) => {
        if (typeof item === 'object' && item.path) {
            navigate(item.path);
        } else {
            setActiveTab(typeof item === 'string' ? item : item.id);
        }
        setSidebarOpen(false);
        setProfileOpen(false);
    };

    const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
            {/* ==================== SIDEBAR ==================== */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-800/95 backdrop-blur-lg border-r border-gray-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                                TransferHub
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 hover:bg-gray-700 rounded-lg"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Role Badge */}
                    <div className="p-4 border-b border-gray-700">
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${roleConfig.bg} ${roleConfig.border} border`}
                        >
                            <div className={roleConfig.text}>{roleConfig.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400">Logged in as</p>
                                <p className={`text-sm font-semibold ${roleConfig.text} truncate`}>
                                    {roleConfig.label}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id && !item.path
                                        ? `${roleConfig.bg} ${roleConfig.text} border ${roleConfig.border}`
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-700 space-y-1">
                        <button
                            onClick={() => handleNavClick('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings'
                                    ? `${roleConfig.bg} ${roleConfig.text} border ${roleConfig.border}`
                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* ==================== MAIN ==================== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                        {/* Left: Menu + Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
                                aria-label="Open sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold capitalize">
                                    {activeTab === 'overview' ? 'Dashboard' : activeTab}
                                </h1>
                                <p className="text-xs text-gray-400 hidden sm:block">
                                    Welcome back, {user.name || user.email}
                                </p>
                            </div>
                        </div>

                        {/* Right: Notifications + Profile */}
                        <div className="flex items-center gap-3">

                            {/* ⭐ LIVE NOTIFICATION BELL ⭐ */}
                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-gray-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                                    aria-label="Profile menu"
                                >
                                    <div
                                        className={`w-8 h-8 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden`}
                                    >
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            userInitial
                                        )}
                                    </div>
                                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-30">
                                        <div className="p-4 border-b border-gray-700">
                                            <p className="text-sm font-semibold truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/profile');
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                            >
                                                <User className="w-4 h-4" /> Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/messages');
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Messages
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/settings');
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                            >
                                                <Settings className="w-4 h-4" /> Settings
                                            </button>
                                            <div className="my-1 border-t border-gray-700"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
            </div>

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

export default DashboardLayout;