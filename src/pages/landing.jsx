// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, User, Briefcase, Search, Shield, GraduationCap,
    ChevronRight, CheckCircle2, Sparkles, Video, FileText,
    ArrowRight, Play, LayoutDashboard
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
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
            {/* ==================== 1. HOME (HERO SECTION) ==================== */}
            <div id="home" className="relative text-white pt-40 pb-32 overflow-hidden flex items-center min-h-[90vh]">

                {/* 1. Background Image Layer (Using the stadium image) */}
                {/* Note: Replace 'stadium.jpg' with the actual filename you save the image as in your project */}
                <img
                    src="/stadium.webp"
                    alt="Football stadium at night"
                    className="absolute inset-0 w-full h-full object-cover object-center animate-zoom origin-center will-change-transform z-0"
                />

                {/* 2. Gradient Overlay Layer (Crucial for text readability) */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e1f]/80 via-[#0a2e1f]/60 to-[#0a2e1f]/95 z-10"></div>
                {/* 3. Optional: Subtle green glow to match your brand */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>

                {/* 4. Content Layer */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 animate-fadeIn shadow-lg">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-semibold tracking-wide uppercase text-green-300">
                            The #1 Football Transfer Platform
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight drop-shadow-lg">
                        Your Trusted Partner in <span className="text-green-400">Football Transfers</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
                        Connect with global clubs, discover top talent, manage your academy, and negotiate deals securely on one unified platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
                            >
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:-translate-y-0.5"
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

            {/* ==================== 2. ROLES SECTION ==================== */}
            <div id="roles" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">One Platform. Five Roles.</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Whether you are kicking the ball, scouting the next Messi, managing a club, or running a youth academy, TransferHub has the tools you need.</p>
                    </div>

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

            {/* ==================== 3. FEATURES SECTION ==================== */}
            <div id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">From grassroots discovery to professional contract signing, TransferHub provides the ultimate toolkit for the football ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 text-yellow-600 border border-yellow-200">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Talent Finder</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Search for players using plain English. Our semantic AI understands your tactical needs and finds the perfect match instantly.</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600 border border-orange-200">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Grassroots Discovery</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Local academies can register their youth squads, upload raw match footage, and allow scouts to request live trials.</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600 border border-green-200">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Contracts</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Once a transfer is agreed upon by both the club and the player, the system automatically generates a downloadable PDF contract.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 4. PRICING SECTION ==================== */}
            <div id="pricing" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Whether you are a weekend amateur or a top-tier club, we have a plan that fits your needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                            <p className="text-sm text-gray-500 mb-6">For Grassroots Players & Academies</p>
                            <div className="text-4xl font-extrabold text-gray-900 mb-6">€0<span className="text-base font-medium text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Basic Player Profile</li>
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Register 1 Academy Team</li>
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Receive Trial Requests</li>
                            </ul>
                            <button onClick={() => navigate('/register')} className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Start for Free</button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-[#0a2e1f] rounded-2xl p-8 border border-green-500 shadow-xl relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-sm text-gray-300 mb-6">For Scouts & Professional Agents</p>
                            <div className="text-4xl font-extrabold text-white mb-6">€29<span className="text-base font-medium text-gray-400">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-green-400" /> AI Talent Finder (Unlimited)</li>
                                <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-green-400" /> Unlimited Watchlists & Reports</li>
                                <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-green-400" /> Request Live Trials</li>
                            </ul>
                            <button onClick={() => navigate('/register')} className="w-full py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors">Upgrade to Pro</button>
                        </div>

                        {/* Club Plan */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Club</h3>
                            <p className="text-sm text-gray-500 mb-6">For Professional Teams</p>
                            <div className="text-4xl font-extrabold text-gray-900 mb-6">€99<span className="text-base font-medium text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Everything in Pro</li>
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Automated PDF Contracts</li>
                                <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500" /> Hire & Manage Scouts</li>
                            </ul>
                            <button onClick={() => navigate('/register')} className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 5. ABOUT SECTION ==================== */}
            <div id="about" className="bg-[#0a2e1f] py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Mission: Democratizing Football Talent</h2>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        For too long, football talent has been locked behind geographic and financial barriers. TransferHub was built to bridge the gap between the streets of Nairobi, the youth academies of Brazil, and the biggest clubs in Europe. We believe the next Messi shouldn't be missed just because they weren't discovered.
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg"
                    >
                        Join the Movement
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
                        <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#terms" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm text-gray-400">© 2026 TransferHub. All rights reserved.</p>
                </div>
            </footer>
            {/* ==================== 6. PRIVACY POLICY ==================== */}
            <div id="privacy" className="py-24 bg-white scroll-mt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600 mb-6">
                            <Shield className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Your data, your control. Here's how we handle your information.
                        </p>
                    </div>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h3>
                            <p className="text-sm">We collect profile data, match footage, performance stats, and contact details you provide when registering as a player, agent, scout, team, or academy.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Data</h3>
                            <p className="text-sm">Your data powers talent discovery, transfer negotiations, and platform features. We never sell your personal information to third parties.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">3. Your Rights</h3>
                            <p className="text-sm">You can request access, correction, or deletion of your data at any time by contacting our data protection team.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 7. TERMS OF SERVICE ==================== */}
            <div id="terms" className="py-24 bg-gray-50 scroll-mt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600 mb-6">
                            <FileText className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            The rules of the game. Please read carefully before using TransferHub.
                        </p>
                    </div>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">1. Account Responsibilities</h3>
                            <p className="text-sm">You are responsible for maintaining the confidentiality of your account and for all activities under it. Provide accurate information at all times.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">2. Acceptable Use</h3>
                            <p className="text-sm">You agree not to misuse the platform, upload false information, or engage in fraudulent transfer negotiations. Violations may result in account termination.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">3. Contracts & Agreements</h3>
                            <p className="text-sm">Automated contracts generated on TransferHub are legally binding once signed by both parties. Consult legal counsel for complex deals.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 8. CONTACT ==================== */}
            <div id="contact" className="py-24 bg-white scroll-mt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600 mb-6">
                            <User className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Questions, feedback, or partnership inquiries? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href="mailto:support@transferhub.com" className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all text-center">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                            <p className="text-sm text-gray-600">support@transferhub.com</p>
                        </a>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                            <p className="text-sm text-gray-600">+254 700 000 000</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                            <p className="text-sm text-gray-600">Nairobi, Kenya</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;