// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    TrendingUp,
    Menu,
    X,
    User,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    Settings,
    MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detect scroll to change navbar style
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when route changes
    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        setMobileOpen(false);
        navigate('/login', { replace: true });
    };

    const publicLinks = [
        { label: 'Home', path: '/' },
        { label: 'Features', path: '/#features' },
        { label: 'Pricing', path: '/#pricing' },
        { label: 'About', path: '/#about' },
    ];

    const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 shadow-lg'
                    : 'bg-gray-900/80 backdrop-blur-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                            TransferHub
                        </span>
                    </Link>

                    {/* DESKTOP LINKS */}
                    <div className="hidden md:flex items-center gap-1">
                        {publicLinks.map((link) => (
                            <a
                                key={link.path}
                                href={link.path}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.path)
                                        ? 'text-green-400 bg-green-500/10'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* RIGHT SIDE (AUTH) */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all transform hover:scale-105"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors inline-flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                                        aria-label="Profile menu"
                                    >

                                        {/* ⭐ UPDATED AVATAR UI ⭐ */}
                                        <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
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

                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                                            <div className="p-4 border-b border-gray-700">
                                                <p className="text-sm font-semibold truncate text-white">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                                {user?.role && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full capitalize">
                                                        {user.role}
                                                    </span>
                                                )}
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
                            </>
                        )}
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-900/98 backdrop-blur-lg border-t border-gray-700 animate-slideDown">
                    <div className="px-4 py-4 space-y-2">
                        {publicLinks.map((link) => (
                            <a
                                key={link.path}
                                href={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'text-green-400 bg-green-500/10'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}

                        <div className="border-t border-gray-700 my-2"></div>

                        {!isAuthenticated ? (
                            <div className="space-y-2 pt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 text-center"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg">

                                    {/* ⭐ UPDATED MOBILE AVATAR UI ⭐ */}
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
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

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                >
                                    <User className="w-4 h-4" /> Profile
                                </Link>
                                <Link
                                    to="/messages"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" /> Messages
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;