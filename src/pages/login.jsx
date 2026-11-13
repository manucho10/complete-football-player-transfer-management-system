// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    const from = location.state?.from?.pathname || '/dashboard';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, from]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrors({});
        if (!validateForm()) return;

        setIsLoading(true);
        const result = await login({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe,
        });

        if (result.success) {
            setSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => navigate(from, { replace: true }), 800);
        } else {
            setErrors({ general: result.error || 'Invalid email or password' });
        }
        setIsLoading(false);
    };

    const handleDemoLogin = async (role) => {
        setErrors({});
        setIsLoading(true);
        const result = await login({
            email: `${role}@demo.com`,
            password: 'demo1234',
            rememberMe: false,
            role,
        });
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setErrors({ general: result.error });
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* ==================== LEFT SIDE: BRANDING ==================== */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a2e1f] text-white flex-col justify-between p-12 relative overflow-hidden">

                {/* ⭐ Smooth Glowing Orbs (Replaced the grid) */}
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
                        Welcome back to the <span className="text-green-400">Marketplace.</span>
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        Sign in to manage your career, negotiate deals, and connect with top football talent around the globe.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>AI-powered talent discovery</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Secure contract negotiations</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Real-time scouting reports</span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Footer */}
                <div className="relative z-10 text-sm text-gray-400">
                    © 2024 TransferHub. All rights reserved.
                </div>
            </div>

            {/* ==================== RIGHT SIDE: LOGIN FORM ==================== */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 relative">

                {/* ⭐ ADDED: Desktop Back to Home button */}
                <div className="hidden lg:block absolute top-8 left-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    {/* Mobile Logo / Back Button */}
                    <div className="lg:hidden mb-8 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">TransferHub</span>
                        </Link>
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    </div>
                </div>



                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
                    <p className="text-sm text-gray-600 mb-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-green-600 hover:text-green-500">
                            Create one now
                        </Link>
                    </p>
                </div>

                {/* Redirect Notice */}
                {location.state?.from && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        Please sign in to access <span className="font-semibold">{location.state.from.pathname}</span>
                    </div>
                )}

                {/* Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                    </div>
                )}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errors.general}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                disabled={isLoading}
                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className={`w-full bg-white border rounded-xl pl-10 pr-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                            Remember me for 30 days
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing in...</>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                {/* Demo Roles */}
                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or try a demo role</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-2">
                        {[
                            { role: 'player', label: 'Player', bg: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                            { role: 'agent', label: 'Agent', bg: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
                            { role: 'scout', label: 'Scout', bg: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
                            { role: 'team', label: 'Team', bg: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
                        ].map(({ role, label, bg }) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => handleDemoLogin(role)}
                                disabled={isLoading}
                                className={`border rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${bg}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div >
    );
};

export default Login;