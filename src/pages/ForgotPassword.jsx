// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Key, TrendingUp } from 'lucide-react';
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
        <div className="min-h-screen bg-white flex">
            {/* ==================== LEFT SIDE: BRANDING ==================== */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a2e1f] text-white flex-col justify-between p-12 relative overflow-hidden">
                {/* Smooth Glowing Orbs */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4"></div>

                {/* Top: Logo */}
                <Link to="/" className="flex items-center gap-2 relative z-10">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">TransferHub</span>
                </Link>

                {/* Middle: Value Proposition */}
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Recover your <span className="text-green-400">Account.</span>
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        Don't worry, it happens to the best of us. Enter your email and we'll help you get back on the pitch.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Secure password reset link</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Instant email delivery</span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Footer */}
                <div className="relative z-10 text-sm text-gray-400">
                    © 2024 TransferHub. All rights reserved.
                </div>
            </div>

            {/* ==================== RIGHT SIDE: FORM ==================== */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 relative">

                {/* Desktop Back to Login */}
                <div className="hidden lg:block absolute top-8 left-8">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    {/* Mobile Back Button */}
                    <div className="lg:hidden mb-8">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                            <Key className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {/* Success State */}
                    {success ? (
                        <div className="text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                We've sent a password reset link to <strong className="text-gray-900">{email}</strong>.
                                Please check your inbox and spam folder.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-sm font-semibold text-green-600 hover:text-green-500"
                            >
                                Try another email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        placeholder="you@example.com"
                                        disabled={isLoading}
                                        className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 ${error ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Link */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Remember your password?{' '}
                        <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;