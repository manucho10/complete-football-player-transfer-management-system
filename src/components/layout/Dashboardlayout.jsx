// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp, MessageSquare, Settings, LogOut, Menu, Bell,
    ChevronDown, User, X, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const DashboardLayout = ({ children, roleConfig, navItems, recentActivity = [] }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const unreadCount = useNotifications();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleNavClick = (item) => {
        if (typeof item === 'object' && item.path) {
            navigate(item.path);
        }
        setSidebarOpen(false);
        setProfileOpen(false);
    };

    const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans">

            {/* ==================== SIDEBAR (Deep Green & Scrollable) ==================== */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0a2e1f] text-white transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-green-900/50 shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">TransferHub</span>
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="p-4 border-b border-green-900/50 shrink-0">
                    <div className="flex items-center gap-3 px-3 py-2 bg-[#081f15] rounded-lg border border-green-900/50">
                        <div className={`p-1.5 rounded-md bg-green-900/50 text-green-400`}>
                            {roleConfig.icon}
                        </div>
                        <div>
                            <p className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">Role</p>
                            <p className="text-sm font-bold text-white">{roleConfig.label}</p>
                        </div>
                    </div>
                </div>

                {/* ⭐ SCROLLABLE NAVIGATION ⭐ */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${!item.path && window.location.pathname === '/dashboard' && item.id === 'overview'
                                    ? 'bg-green-800/50 text-green-300'
                                    : 'text-gray-300 hover:bg-green-900/50 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-green-900/50 space-y-1 shrink-0 bg-[#0a2e1f]">
                    <button
                        onClick={() => handleNavClick({ path: '/settings' })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-green-900/50 hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* ==================== MAIN CONTENT ==================== */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shrink-0">

                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 capitalize">
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden md:flex relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-sm transition-all outline-none" />
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={() => navigate('/notifications')}
                            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm border border-green-200">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30">
                                    <div className="p-4 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button onClick={() => handleNavClick({ path: '/profile' })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                            <User className="w-4 h-4" /> Profile
                                        </button>
                                        <button onClick={() => handleNavClick({ path: '/settings' })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                            <Settings className="w-4 h-4" /> Settings
                                        </button>
                                        <div className="my-1 border-t border-gray-100"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;