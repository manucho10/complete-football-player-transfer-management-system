// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, User, Briefcase, Search, Shield, Users, Award,
    Globe, ChevronRight, CheckCircle2, Sparkles, Video, FileText,
    ArrowRight, Star, Play, Zap
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
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ==================== HERO SECTION ==================== */}
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/80 border border-gray-700 backdrop-blur-sm mb-8 animate-fadeIn">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-semibold tracking-wide uppercase text-gray-300">
                                The #1 Football Transfer Platform
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 animate-slideDown">
                            Where Football <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                                Talent Meets Opportunity.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fadeIn">
                            The all-in-one ecosystem where players, agents, clubs, and scouts manage careers,
                            discover talent using AI, and negotiate transfers securely.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="group relative inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-4 px-8 rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 px-8 rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                                    >
                                        Get Started Now
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all backdrop-blur-sm"
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500 animate-fadeIn">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Free to join</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> AI-Powered</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Secure Deals</span>
                        </div>
                    </div>

                    {/* ==================== MOCKUP PREVIEW ==================== */}
                    <div className="mt-24 relative mx-auto max-w-5xl animate-slideUp">
                        {/* Glow behind mockup */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-[2.5rem] blur opacity-20"></div>

                        <div className="relative rounded-[2rem] border border-gray-800 bg-gray-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                            {/* Window Bar */}
                            <div className="h-10 bg-gray-800/50 border-b border-gray-700 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>

                            {/* Fake Dashboard UI */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                                <div className="col-span-1 border-r border-gray-800 pr-6 space-y-4">
                                    <div className="h-8 bg-gray-800 rounded-lg w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-800 rounded-lg w-1/2 animate-pulse"></div>
                                    <div className="space-y-2 mt-8">
                                        <div className="h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center px-3 gap-2 text-green-400 text-sm font-semibold"><LayoutDashboard className="w-4 h-4" /> Overview</div>
                                        <div className="h-10 bg-gray-800/50 rounded-lg flex items-center px-3 gap-2 text-gray-400 text-sm"><Search className="w-4 h-4" /> Discover</div>
                                        <div className="h-10 bg-gray-800/50 rounded-lg flex items-center px-3 gap-2 text-gray-400 text-sm"><Sparkles className="w-4 h-4" /> AI Finder</div>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="h-8 bg-gray-800 rounded-lg w-1/3 animate-pulse"></div>
                                        <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 h-24"></div>
                                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 h-24"></div>
                                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 h-24"></div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-48 flex items-center justify-center">
                                        <Play className="w-12 h-12 text-green-500 opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================== ROLE CARDS ==================== */}
                    <div className="mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">One Platform. Four Roles.</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">Whether you are kicking the ball, scouting the next Messi, or managing a club, TransferHub has the tools you need to succeed.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {roles.map((role, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-gray-900/50 border border-gray-800 rounded-3xl p-6 hover:bg-gray-800/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg`}>
                                        {role.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{role.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{role.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ==================== FEATURES (BENTO GRID) ==================== */}
                    <div className="mt-32">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Feature 1 */}
                            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles className="w-32 h-32 text-yellow-400" />
                                </div>
                                <div className="relative z-10">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold mb-4">
                                        <Sparkles className="w-3 h-3" /> AI-Powered
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3">Semantic AI Talent Finder</h3>
                                    <p className="text-gray-400 max-w-md">Stop scrolling through endless stats. Just describe the player you need in plain English (e.g., "A fast left-winger with high stamina") and our AI will find the perfect match.</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8">
                                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                                    <Video className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Video Highlights</h3>
                                <p className="text-sm text-gray-400">Players can upload MP4 highlight reels directly to their profiles for scouts to watch.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8">
                                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-6">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">PDF Contracts</h3>
                                <p className="text-sm text-gray-400">Generate professional, downloadable PDF contracts the moment a transfer is accepted.</p>
                            </div>

                            {/* Feature 4 */}
                            <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -bottom-8 -right-8 p-8 opacity-10">
                                    <TrendingUp className="w-48 h-48 text-green-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-6">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Automated Negotiations</h3>
                                    <p className="text-gray-400 max-w-md">Agents can counter-offer on behalf of players. Deals only close when both the Player and the Team accept the terms.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================== FINAL CTA ==================== */}
                    <div className="mt-32 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to make your next big move?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of players, scouts, and clubs already using TransferHub to shape the future of football.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-4 px-10 rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            Create Free Account
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-32 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
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

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 1s ease-out; }
      `}} />
        </div>
    );
};

export default Landing;