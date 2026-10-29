// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Key } from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { supabase } from '../lib/SupabaseClient';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError('');

        // Get the current URL to use as the redirect base
        // In production, this will be your Vercel URL. In dev, it's localhost.
        const redirectUrl = `${window.location.origin}/update-password`;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            <Navbar />

            <div className="pt-16 min-h-screen flex items-center justify-center p-4 relative">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>

                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Key className="w-7 h-7 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
                            <p className="text-gray-400 text-sm">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Check your email</h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    We've sent a password reset link to <strong className="text-white">{email}</strong>.
                                    Please check your inbox and spam folder.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    Try another email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="you@example.com"
                                            disabled={isLoading}
                                            className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 ${error ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;