// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    User,
    Key,
    UserPlus,
    Briefcase,
    Search,
    Shield,
    Users,
    Award,
    Globe,
    ChevronRight,
    CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const roles = [
        { icon: <User className="w-6 h-6" />, title: 'Player', color: 'from-blue-500 to-blue-600', desc: 'Build your digital CV' },
        { icon: <Briefcase className="w-6 h-6" />, title: 'Agent', color: 'from-purple-500 to-purple-600', desc: 'Manage your roster' },
        { icon: <Search className="w-6 h-6" />, title: 'Scout', color: 'from-green-500 to-green-600', desc: 'Discover hidden talent' },
        { icon: <Shield className="w-6 h-6" />, title: 'Team', color: 'from-red-500 to-red-600', desc: 'Recruit players' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            <Navbar />

            {/* Content offset for fixed navbar */}
            <div className="pt-16">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Hero Section */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            The #1 Football Transfer Platform
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            The Marketplace for Football Talent
                            <span className="block text-green-400 mt-2">Connect. Scout. Transfer.</span>
                        </h1>

                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                            The all-in-one ecosystem where players, agents, clubs, and scouts manage careers,
                            discover talent, and negotiate transfers securely.
                        </p>

                        {/* If logged in → show Dashboard CTA */}
                        {isAuthenticated && (
                            <div className="mb-12">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105"
                                >
                                    Go to Dashboard <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Action Hub */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Login Card */}
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                                <div className="flex items-center justify-center w-14 h-14 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                                    <Key className="w-7 h-7 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Welcome Back</h3>
                                <p className="text-gray-400 mb-6">
                                    Access your dashboard, messages, and active transfer deals.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Login <ChevronRight className="w-4 h-4" />
                                    </span>
                                </button>
                            </div>

                            {/* Register Card */}
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-center w-14 h-14 bg-green-500/20 rounded-xl mb-4 mx-auto">
                                        <UserPlus className="w-7 h-7 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Get Started</h3>
                                    <p className="text-gray-400 mb-6">
                                        Join the network and unlock your transfer potential.
                                    </p>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Create Account <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roles Section */}
                    <div id="features" className="mt-24">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                                Built for Everyone in Football
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Whether you're a player looking to get discovered, or a club hunting for talent — TransferHub has you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {roles.map((role, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all text-center"
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                        <div className="text-white">{role.icon}</div>
                                    </div>
                                    <h3 className="font-bold mb-1">{role.title}</h3>
                                    <p className="text-xs text-gray-400">{role.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div id="about" className="mt-24 pt-12 border-t border-gray-800">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-400 mb-1">
                                    <Users className="w-6 h-6" /> 2,500+
                                </div>
                                <p className="text-gray-400 text-sm">Active Players</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-400 mb-1">
                                    <Briefcase className="w-6 h-6" /> 300+
                                </div>
                                <p className="text-gray-400 text-sm">Accredited Agents</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-400 mb-1">
                                    <Award className="w-6 h-6" /> 50+
                                </div>
                                <p className="text-gray-400 text-sm">Professional Clubs</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-400 mb-1">
                                    <Globe className="w-6 h-6" /> $150M+
                                </div>
                                <p className="text-gray-400 text-sm">Transfers Facilitated</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div id="pricing" className="mt-24 grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                            <h4 className="text-lg font-bold text-green-400 mb-4">For Players & Agents</h4>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Upload match footage, physical stats, and medical history</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Secure negotiation chat with clubs directly on platform</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Track offers and transfer interest in real-time</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                            <h4 className="text-lg font-bold text-blue-400 mb-4">For Scouts & Teams</h4>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Advanced filtering by pace, stamina, goals, and injury history</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Centralized scouting reports and performance tracking</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Collaborate with staff and share player assessments</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                        <div className="flex flex-wrap justify-center gap-6 mb-4">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">GDPR Compliance</a>
                            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                        </div>
                        <p>© 2024 TransferHub. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;