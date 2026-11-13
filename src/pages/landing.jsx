// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, User, Briefcase, Search, Shield,
    ChevronRight, CheckCircle2, Sparkles, Video, FileText,
    ArrowRight, Play, LayoutDashboard, Globe, Award, Users
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const roles = [
        { icon: <User className="w-6 h-6" />, title: 'Player', color: 'bg-blue-600', desc: 'Build your digital CV, upload highlights, and get discovered by top clubs.' },
        { icon: <Briefcase className="w-6 h-6" />, title: 'Agent', color: 'bg-purple-600', desc: 'Manage your roster, negotiate deals, and track your commissions.' },
        { icon: <Search className="w-6 h-6" />, title: 'Scout', color: 'bg-green-600', desc: 'Discover hidden talent, file reports, and track targets in real-time.' },
        { icon: <Shield className="w-6 h-6" />, title: 'Team', color: 'bg-red-600', desc: 'Recruit players, manage your squad, hire scouts, and dominate the league.' },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Navbar />

            {/* ==================== HERO SECTION ==================== */}
            {/* Deep Green Background similar to Agroworld */}
            <div className="bg-[#0a2e1f] text-white pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                        Your Trusted Partner in <span className="text-green-400">Football Transfers</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                        Connect with global clubs, discover top talent, and manage your career with a platform built on transparency and trust.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-md transition-all"
                            >
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-md transition-all"
                                >
                                    Get Started
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/30 text-white font-semibold py-3 px-8 rounded-md transition-all"
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
                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Clubs</p>
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Who is TransferHub for?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Four distinct roles, one unified platform. We provide the tools for every stakeholder in the transfer ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roles.map((role, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${role.color} text-white rounded-lg flex items-center justify-center mb-6`}>
                                    {role.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{role.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== FEATURES (SIMPLE GRID) ==================== */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Professional Results</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We combine cutting-edge technology with deep industry knowledge to streamline your transfer process.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-yellow-500" /> AI Talent Finder
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Stop manually filtering thousands of players. Describe the exact profile you need in plain English (e.g., "A fast left-winger with high stamina"), and our AI will instantly match you with the perfect candidates.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-gray-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Semantic search based on player stats and bios</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Instant match percentages</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-100 rounded-xl p-8 border border-gray-200">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-3 flex items-center gap-3">
                                <Search className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600">"Fast striker who scores headers"</span>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                                <p className="font-semibold text-gray-900">Lucas Ferreira</p>
                                <p className="text-sm text-gray-500">98% Match • 45 Goals • 1.82m</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-24">
                        <div className="order-2 md:order-1 bg-gray-100 rounded-xl p-8 border border-gray-200">
                            <div className="flex flex-col gap-3">
                                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
                                    <Video className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Highlight Reel</p>
                                        <p className="text-xs text-gray-500">Uploaded by Player</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-green-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Contract.pdf</p>
                                        <p className="text-xs text-gray-500">Generated on acceptance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-500" /> Multimedia Profiles & Contracts
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Players can upload highlight reels directly to their profiles, giving scouts a real feel for their playing style. Once a deal is agreed, the system automatically generates a professional PDF contract.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== FINAL CTA ==================== */}
            <div className="bg-[#0a2e1f] py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to make your next big move?</h2>
                    <p className="text-lg text-gray-300 mb-10">Join thousands of players, scouts, and clubs already using TransferHub to shape the future of football.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-md transition-all"
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
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900">Terms of Service</a>
                        <a href="#" className="hover:text-gray-900">Contact</a>
                    </div>
                    <p className="text-sm text-gray-400">© 2024 TransferHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;