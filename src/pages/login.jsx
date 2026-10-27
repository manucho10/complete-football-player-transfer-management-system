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
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            <Navbar />

            <div className="pt-16 min-h-screen flex items-center justify-center p-4 relative">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-gray-400 text-sm">
                                Sign in to access your transfer dashboard
                            </p>
                        </div>

                        {location.state?.from && (
                            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2 text-blue-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                Please sign in to access{' '}
                                <span className="font-semibold">{location.state.from.pathname}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 ${errors.email
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-600 focus:border-blue-500'
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 ${errors.password
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-600 focus:border-blue-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded accent-blue-500"
                                    />
                                    <span className="text-gray-300">Remember me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-gray-800/50 text-gray-500">
                                    Or try a demo role
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { role: 'player', label: 'Player', color: 'from-blue-500 to-blue-600' },
                                { role: 'agent', label: 'Agent', color: 'from-purple-500 to-purple-600' },
                                { role: 'scout', label: 'Scout', color: 'from-green-500 to-green-600' },
                                { role: 'team', label: 'Team', color: 'from-red-500 to-red-600' },
                            ].map(({ role, label, color }) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleDemoLogin(role)}
                                    disabled={isLoading}
                                    className={`bg-gradient-to-r ${color} hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold py-2 px-1 rounded-lg transition-all`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-gray-400 hover:text-white underline">Terms</a>{' '}
                        and{' '}
                        <a href="#" className="text-gray-400 hover:text-white underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;