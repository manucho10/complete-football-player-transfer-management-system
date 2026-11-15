// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, User, Briefcase, Search, Shield, GraduationCap,
    ChevronRight, CheckCircle2, Sparkles, Video, FileText,
    ArrowRight, Play, LayoutDashboard
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const roles = [
        { icon: <User className="w-6 h-6" />, title: 'Player', color: 'from-blue-500 to-blue-600', desc: 'Build your digital CV, upload highlights, and get discovered by top clubs.' },
        { icon: <Briefcase className="w-6 h-6" />, title: 'Agent', color: 'from-purple-500 to-purple-600', desc: 'Manage your roster, negotiate deals, and track your commissions.' },
        { icon: <Search className="w-6 h-6" />, title: 'Scout', color: 'from-green-500 to-green-600', desc: 'Discover hidden talent, file reports, and track targets in real-time.' },
        { icon: <Shield className="w-6 h-6" />, title: 'Team', color: 'from-red-500 to-red-600', desc: 'Recruit players, manage your squad, hire scouts, and dominate the league.' },
        { icon: <GraduationCap className="w-6 h-6" />, title: 'Academy', color: 'from-orange-500 to-orange-600', desc: 'Manage youth teams, register grassroots talent, and prepare players for the pros.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Navbar />

            {/* ==================== HERO SECTION ==================== */}
            <div className="bg-[#0a2e1f] text-white pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8 animate-fadeIn">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-semibold tracking-wide uppercase text-green-300">
                            The #1 Football Transfer Platform
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                        Your Trusted Partner in <span className="text-green-400">Football Transfers</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                        Connect with global clubs, discover top talent, manage your academy, and negotiate deals securely on one unified platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                            >
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                                >
                                    Get Started
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-all"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================== STATS BAR ==================== */}
            <div className="border-b border-gray-200 bg-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">2,500+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Active Players</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">300+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Agents</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">50+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Clubs & Academies</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">€150M+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Transfers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== ROLE CARDS ==================== */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">One Platform. Five Roles.</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Whether you are kicking the ball, scouting the next Messi, managing a club, or running a youth academy, TransferHub has the tools you need.</p>
                    </div>

                    {/* 5 Column Grid with responsive wrap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {roles.map((role, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5 text-white shadow-sm`}>
                                    {role.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed flex-1">{role.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== FEATURES ==================== */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Professional Results</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We combine cutting-edge technology with deep industry knowledge to streamline your transfer process.</p>
                    </div>

                    {/* Feature 1: AI Talent Finder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-yellow-500" /> AI Talent Finder
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Stop manually filtering thousands of players. Describe the exact profile you need in plain English (e.g., "A fast left-winger with high stamina"), and our AI will instantly match you with the perfect candidates.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Semantic search based on player stats and bios</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Instant match percentages</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
                            <div className="bg-white rounded-xl p-4 shadow-sm mb-3 flex items-center gap-3 border border-gray-100">
                                <Search className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-500 text-sm font-medium">"Fast striker who scores headers"</span>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                                <p className="font-bold text-gray-900">Lucas Ferreira</p>
                                <p className="text-sm text-gray-500 font-medium">98% Match • 45 Goals • 1.82m</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Grassroots & Media */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-gray-100">
                                    <GraduationCap className="w-6 h-6 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Grassroots Academy</p>
                                        <p className="text-xs text-gray-500">Discover undiscovered talent</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-gray-100">
                                    <FileText className="w-6 h-6 text-green-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">PDF Contracts</p>
                                        <p className="text-xs text-gray-500">Generated automatically</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-orange-500" /> Empowering Academies & Grassroots
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Local coaches and academies can now act as verified middlemen for their young talent. Register your entire youth team, upload raw match footage, and let professional scouts discover your players.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== FINAL CTA ==================== */}
            <div className="bg-[#0a2e1f] py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to make your next big move?</h2>
                    <p className="text-lg text-gray-300 mb-10">Join thousands of players, academies, scouts, and clubs already using TransferHub.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg"
                    >
                        Create Free Account
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <span className="text-xl font-bold text-gray-900">TransferHub</span>
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-gray-500">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm text-gray-400">© 2024 TransferHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;