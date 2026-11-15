// src/pages/Landing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, User, Briefcase, Search, Shield, GraduationCap,
    ChevronRight, CheckCircle2, Sparkles, Video, FileText,
    ArrowRight, Play, X, Mail, Phone, MapPin
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // ⭐ State for the Footer Modals
    const [footerModal, setFooterModal] = useState(null); // 'privacy', 'terms', 'contact', or null

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

            {/* ... (Keep your existing Hero, Stats, Roles, Features, Pricing, About sections exactly as they are) ... */}

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

            {/* ==================== FOOTER ==================== */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <span className="text-xl font-bold text-gray-900">TransferHub</span>
                    </div>

                    {/* ⭐ CLICKABLE FOOTER LINKS ⭐ */}
                    <div className="flex gap-6 text-sm font-medium text-gray-500">
                        <button onClick={() => setFooterModal('privacy')} className="hover:text-green-600 transition-colors">Privacy Policy</button>
                        <button onClick={() => setFooterModal('terms')} className="hover:text-green-600 transition-colors">Terms of Service</button>
                        <button onClick={() => setFooterModal('contact')} className="hover:text-green-600 transition-colors">Contact</button>
                    </div>

                    <p className="text-sm text-gray-400">© 2024 TransferHub. All rights reserved.</p>
                </div>
            </footer>

            {/* ==================== FOOTER MODALS ==================== */}
            {footerModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setFooterModal(null)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>

                        {/* Close Button */}
                        <button onClick={() => setFooterModal(null)} className="float-right p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        {/* Privacy Policy */}
                        {footerModal === 'privacy' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                                    <p><strong>1. Information We Collect:</strong> We collect your name, email, and role upon registration. If you are a player, we may collect videos, stats, and medical data.</p>
                                    <p><strong>2. How We Use It:</strong> Your data is used to match players with clubs, facilitate trials, and generate contracts.</p>
                                    <p><strong>3. Data Security:</strong> We use industry-standard encryption to protect your data. We never sell your data to third parties.</p>
                                    <p><strong>4. Your Rights:</strong> You can request to delete your account and all associated data at any time from the Settings page.</p>
                                </div>
                            </div>
                        )}

                        {/* Terms of Service */}
                        {footerModal === 'terms' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
                                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                                    <p><strong>1. User Responsibilities:</strong> You must provide accurate information. Players must be at least 16 years old (or have a guardian's consent).</p>
                                    <p><strong>2. Platform Use:</strong> TransferHub is a marketplace. We do not guarantee transfers or contracts. All negotiations must be conducted lawfully.</p>
                                    <p><strong>3. Prohibited Actions:</strong> Harassment, fake profiles, and illegal transfer tapping are strictly prohibited.</p>
                                    <p><strong>4. Termination:</strong> We reserve the right to suspend accounts that violate these terms.</p>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        {footerModal === 'contact' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                                <p className="text-sm text-gray-600 mb-6">Have a question or need support? Reach out to our team.</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <Mail className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Email Support</p>
                                            <p className="text-sm text-gray-500">support@transferhub.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Phone</p>
                                            <p className="text-sm text-gray-500">+254 (0) 700 000 000</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Office</p>
                                            <p className="text-sm text-gray-500">Nairobi, Kenya</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;