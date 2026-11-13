// src/pages/UpdatePassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, TrendingUp, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    // Listen for the auth state change to ensure the reset link is valid
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
                setIsVerifying(false);
            }
        });

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsVerifying(false);
            } else {
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        setIsVerifying(false);
                    } else {
                        setError('Your reset link is invalid or has expired. Please request a new one.');
                        setIsVerifying(false);
                    }
                }, 1500);
            }
        };

        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password.');
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
                <div className="flex items-center gap-2 relative z-10">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">TransferHub</span>
                </div>

                {/* Middle: Value Proposition */}
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Secure your <span className="text-green-400">Account.</span>
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        Choose a strong, new password to keep your transfer data and negotiations safe.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Minimum 8 characters</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Include numbers and symbols</span>
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

                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    <div className="text-center lg:text-left mb-8">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                            <Lock className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
                        <p className="text-sm text-gray-600">
                            Please enter your new password below.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && !success && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {/* Loading/Verifying State */}
                    {isVerifying ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                            <p className="text-gray-600 text-sm">Verifying your secure link...</p>
                        </div>
                    ) : success ? (
                        <div className="text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Password Updated!</h3>
                            <p className="text-sm text-gray-600">
                                Redirecting you to the dashboard...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Updating...</>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    {!success && (
                        <p className="mt-8 text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <button onClick={() => navigate('/login')} className="font-semibold text-green-600 hover:text-green-500">
                                Back to Sign In
                            </button>
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;