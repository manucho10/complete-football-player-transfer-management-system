// src/pages/UpdatePassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { supabase } from '../lib/SupabaseClient';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true); // ⭐ New state to wait for Supabase

    // ⭐ CRITICAL FIX: Listen for the auth state change
    useEffect(() => {
        // Supabase automatically parses the URL hash (#access_token=...) 
        // and logs the user in temporarily for password recovery.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
                setIsVerifying(false); // We have a valid session, allow the form
            }
        });

        // Fallback check in case the event already fired before this component mounted
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsVerifying(false);
            } else {
                // Give Supabase 1.5 seconds to process the URL token before showing an error
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

        return () => {
            subscription.unsubscribe();
        };
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            <Navbar />

            <div className="pt-16 min-h-screen flex items-center justify-center p-4 relative">
                <div className="relative w-full max-w-md">
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">

                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-7 h-7 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
                            <p className="text-gray-400 text-sm">
                                Choose a strong, new password for your account.
                            </p>
                        </div>

                        {/* Show a loading spinner while verifying the token */}
                        {isVerifying ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm">Verifying your secure link...</p>
                            </div>
                        ) : error && !success ? (
                            <div className="text-center py-4">
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm text-left">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                                </div>
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    Request a new link
                                </button>
                            </div>
                        ) : success ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Password Updated!</h3>
                                <p className="text-sm text-gray-400">
                                    Redirecting you to the dashboard...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 8 characters"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;