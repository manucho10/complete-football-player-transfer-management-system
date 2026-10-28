/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, User, Briefcase, Search, Shield,
    ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2,
    Check, Phone, Calendar, Globe, Award, Building2, FileText, Target,
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, isLoading: authLoading } = useAuth();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        role: '', fullName: '', email: '', password: '', confirmPassword: '',
        position: '', currentClub: '', nationality: '', dateOfBirth: '',
        agencyName: '', licenseNumber: '',
        scoutClub: '', scoutLicense: '',
        teamName: '', league: '', transferBudget: '',
        phone: '', agreeTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const roles = [
        { id: 'player', icon: <User className="w-8 h-8" />, title: 'Player', description: 'Create your digital CV and get discovered by clubs', color: 'from-blue-500 to-blue-600', border: 'border-blue-500', bg: 'bg-blue-500/10' },
        { id: 'agent', icon: <Briefcase className="w-8 h-8" />, title: 'Agent', description: 'Manage your roster and negotiate deals for clients', color: 'from-purple-500 to-purple-600', border: 'border-purple-500', bg: 'bg-purple-500/10' },
        { id: 'scout', icon: <Search className="w-8 h-8" />, title: 'Scout', description: 'Discover talent and create detailed scouting reports', color: 'from-green-500 to-green-600', border: 'border-green-500', bg: 'bg-green-500/10' },
        { id: 'team', icon: <Shield className="w-8 h-8" />, title: 'Team / Club', description: 'Recruit players and manage your squad transfers', color: 'from-red-500 to-red-600', border: 'border-red-500', bg: 'bg-red-500/10' },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleRoleSelect = (roleId) => {
        setFormData((prev) => ({ ...prev, role: roleId }));
        setErrors((prev) => ({ ...prev, role: '' }));
    };

    const getPasswordStrength = () => {
        const pwd = formData.password;
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (score === 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
        return { level: 4, label: 'Strong', color: 'bg-green-500' };
    };

    const validateStep1 = () => {
        if (!formData.role) {
            setErrors({ role: 'Please select a role to continue' });
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (formData.role === 'player') {
            if (!formData.position) newErrors.position = 'Position is required';
            if (!formData.currentClub.trim()) newErrors.currentClub = 'Current club is required';
            if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        }
        if (formData.role === 'agent') {
            if (!formData.agencyName.trim()) newErrors.agencyName = 'Agency name is required';
            if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        }
        if (formData.role === 'scout') {
            if (!formData.scoutClub.trim()) newErrors.scoutClub = 'Club/Agency is required';
            if (!formData.scoutLicense.trim()) newErrors.scoutLicense = 'License number is required';
        }
        if (formData.role === 'team') {
            if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
            if (!formData.league.trim()) newErrors.league = 'League is required';
        }
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms to continue';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        if (!validateStep3()) return;
        setIsLoading(true);
        setSuccessMessage('');
        const result = await register(formData);
        if (result.success) {
            setSuccessMessage('Account created successfully! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1200);
        } else {
            setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
        setIsLoading(false);
    };

    const passwordStrength = getPasswordStrength();
    const selectedRole = roles.find((r) => r.id === formData.role);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            <Navbar />

            <div className="pt-16 min-h-screen flex items-center justify-center p-4 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="relative w-full max-w-2xl">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
                            <p className="text-gray-400 text-sm">
                                Join the network and unlock your transfer potential
                            </p>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            {[1, 2, 3].map((num, idx) => (
                                <React.Fragment key={num}>
                                    <div className="flex items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${step >= num
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                : 'bg-gray-700 text-gray-400'
                                                }`}
                                        >
                                            {step > num ? <Check className="w-5 h-5" /> : num}
                                        </div>
                                        <span
                                            className={`ml-2 text-sm hidden sm:inline ${step >= num ? 'text-white' : 'text-gray-500'
                                                }`}
                                        >
                                            {num === 1 ? 'Role' : num === 2 ? 'Account' : 'Profile'}
                                        </span>
                                    </div>
                                    {idx < 2 && (
                                        <div
                                            className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 ${step > num ? 'bg-green-500' : 'bg-gray-700'
                                                }`}
                                        ></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMessage}
                            </div>
                        )}

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.general}
                            </div>
                        )}

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-2 text-center">I am a...</h2>
                                <p className="text-gray-400 text-sm text-center mb-6">
                                    Choose your role to personalize your experience
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            onClick={() => handleRoleSelect(role.id)}
                                            className={`cursor-pointer p-5 rounded-xl border-2 transition-all ${formData.role === role.id
                                                ? `${role.border} ${role.bg}`
                                                : 'border-gray-600 hover:border-gray-400 bg-gray-700/20'
                                                }`}
                                        >
                                            <div
                                                className={`w-14 h-14 bg-gradient-to-r ${role.color} rounded-lg flex items-center justify-center mb-3`}
                                            >
                                                {role.icon}
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{role.title}</h3>
                                            <p className="text-xs text-gray-400">{role.description}</p>
                                            {formData.role === role.id && (
                                                <div className="mt-3 flex items-center gap-1 text-green-400 text-xs font-semibold">
                                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.role && (
                                    <p className="text-xs text-red-400 flex items-center gap-1 mb-4 justify-center">
                                        <AlertCircle className="w-3 h-3" /> {errors.role}
                                    </p>
                                )}
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.role}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-40 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    {selectedRole && (
                                        <div className={`w-8 h-8 bg-gradient-to-r ${selectedRole.color} rounded-lg flex items-center justify-center`}>
                                            <div className="scale-75">{selectedRole.icon}</div>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-semibold">
                                        Create {selectedRole?.title} Account
                                    </h2>
                                </div>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text" name="fullName" value={formData.fullName}
                                                onChange={handleChange} placeholder="John Doe"
                                                className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                    }`}
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.fullName}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email" name="email" value={formData.email}
                                                onChange={handleChange} placeholder="you@example.com"
                                                className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
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
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Phone Number <span className="text-gray-500">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="tel" name="phone" value={formData.phone}
                                                onChange={handleChange} placeholder="+1 234 567 8900"
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type={showPassword ? 'text' : 'password'} name="password"
                                                value={formData.password} onChange={handleChange}
                                                placeholder="Create a strong password"
                                                className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.password ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                    }`}
                                            />
                                            <button
                                                type="button" onClick={() => setShowPassword((p) => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {formData.password && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4].map((lvl) => (
                                                        <div
                                                            key={lvl}
                                                            className={`h-1 flex-1 rounded-full ${lvl <= passwordStrength.level ? passwordStrength.color : 'bg-gray-700'
                                                                }`}
                                                        ></div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    Strength:{' '}
                                                    <span
                                                        className={
                                                            passwordStrength.level >= 3 ? 'text-green-400'
                                                                : passwordStrength.level === 2 ? 'text-yellow-400'
                                                                    : 'text-red-400'
                                                        }
                                                    >
                                                        {passwordStrength.label}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                        {errors.password && (
                                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.password}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword" value={formData.confirmPassword}
                                                onChange={handleChange} placeholder="Re-enter your password"
                                                className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                    }`}
                                            />
                                            <button
                                                type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </form>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    {selectedRole && (
                                        <div className={`w-8 h-8 bg-gradient-to-r ${selectedRole.color} rounded-lg flex items-center justify-center`}>
                                            <div className="scale-75">{selectedRole.icon}</div>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-semibold">
                                        {selectedRole?.title} Profile Details
                                    </h2>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {formData.role === 'player' && (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                                                    <div className="relative">
                                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <select
                                                            name="position" value={formData.position} onChange={handleChange}
                                                            className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none appearance-none ${errors.position ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                                }`}
                                                        >
                                                            <option value="">Select position</option>
                                                            <option>Goalkeeper</option>
                                                            <option>Defender</option>
                                                            <option>Midfielder</option>
                                                            <option>Forward</option>
                                                        </select>
                                                    </div>
                                                    {errors.position && (
                                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> {errors.position}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="date" name="dateOfBirth" value={formData.dateOfBirth}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Club</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text" name="currentClub" value={formData.currentClub}
                                                            onChange={handleChange} placeholder="e.g., FC Barcelona"
                                                            className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.currentClub ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                                }`}
                                                        />
                                                    </div>
                                                    {errors.currentClub && (
                                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> {errors.currentClub}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text" name="nationality" value={formData.nationality}
                                                            onChange={handleChange} placeholder="e.g., Nigerian"
                                                            className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.nationality ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                                }`}
                                                        />
                                                    </div>
                                                    {errors.nationality && (
                                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> {errors.nationality}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {formData.role === 'agent' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Agency Name</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text" name="agencyName" value={formData.agencyName}
                                                        onChange={handleChange} placeholder="e.g., Elite Sports Management"
                                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.agencyName ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
                                                            }`}
                                                    />
                                                </div>
                                                {errors.agencyName && (
                                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.agencyName}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">FIFA Agent License Number</label>
                                                <div className="relative">
                                                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text" name="licenseNumber" value={formData.licenseNumber}
                                                        onChange={handleChange} placeholder="e.g., FIFA-AG-2024-12345"
                                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.licenseNumber ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
                                                            }`}
                                                    />
                                                </div>
                                                {errors.licenseNumber && (
                                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.licenseNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {formData.role === 'scout' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Club / Agency You Scout For</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text" name="scoutClub" value={formData.scoutClub}
                                                        onChange={handleChange} placeholder="e.g., Manchester United"
                                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.scoutClub ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                            }`}
                                                    />
                                                </div>
                                                {errors.scoutClub && (
                                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.scoutClub}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Scouting License Number</label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text" name="scoutLicense" value={formData.scoutLicense}
                                                        onChange={handleChange} placeholder="e.g., SCT-2024-67890"
                                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.scoutLicense ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                            }`}
                                                    />
                                                </div>
                                                {errors.scoutLicense && (
                                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.scoutLicense}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {formData.role === 'team' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Club / Team Name</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text" name="teamName" value={formData.teamName}
                                                        onChange={handleChange} placeholder="e.g., Real Madrid CF"
                                                        className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.teamName ? 'border-red-500' : 'border-gray-600 focus:border-red-500'
                                                            }`}
                                                    />
                                                </div>
                                                {errors.teamName && (
                                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.teamName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">League</label>
                                                    <div className="relative">
                                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text" name="league" value={formData.league}
                                                            onChange={handleChange} placeholder="e.g., La Liga"
                                                            className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none ${errors.league ? 'border-red-500' : 'border-gray-600 focus:border-red-500'
                                                                }`}
                                                        />
                                                    </div>
                                                    {errors.league && (
                                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> {errors.league}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Transfer Budget (€) <span className="text-gray-500">(optional)</span>
                                                    </label>
                                                    <input
                                                        type="number" name="transferBudget" value={formData.transferBudget}
                                                        onChange={handleChange} placeholder="e.g., 50000000"
                                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-2">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox" name="agreeTerms" checked={formData.agreeTerms}
                                                onChange={handleChange}
                                                className="w-4 h-4 mt-0.5 bg-gray-700 border-gray-600 rounded accent-green-500"
                                            />
                                            <span className="text-sm text-gray-300">
                                                I agree to the{' '}
                                                <button type="button" className="text-green-400 underline hover:text-green-300">Terms of Service</button>{' '}
                                                and{' '}
                                                <button type="button" className="text-green-400 underline hover:text-green-300">Privacy Policy</button>
                                            </span>
                                        </label>
                                        {errors.agreeTerms && (
                                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.agreeTerms}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button" onClick={handleBack} disabled={isLoading}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button
                                            type="submit" disabled={isLoading}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                                                </>
                                            ) : (
                                                <>
                                                    Create Account <Check className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <p className="mt-6 text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        By registering, you agree to our{' '}
                        <button type="button" className="text-gray-400 underline hover:text-gray-300">Terms</button>{' '}
                        and{' '}
                        <button type="button" className="text-gray-400 underline hover:text-gray-300">Privacy Policy</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;