// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, User, Briefcase, Search, Shield,
    ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2,
    Check, Phone, Calendar, Globe, Award, Building2, FileText, Target,
    TrendingUp
} from 'lucide-react';
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
        { id: 'player', icon: <User className="w-6 h-6" />, title: 'Player', description: 'Create your CV and get discovered.' },
        { id: 'agent', icon: <Briefcase className="w-6 h-6" />, title: 'Agent', description: 'Manage your roster and negotiate.' },
        { id: 'scout', icon: <Search className="w-6 h-6" />, title: 'Scout', description: 'Discover talent and file reports.' },
        { id: 'team', icon: <Shield className="w-6 h-6" />, title: 'Team / Club', description: 'Recruit players and manage your squad.' },
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
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
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
        <div className="min-h-screen bg-white flex">
            {/* ==================== LEFT SIDE: BRANDING ==================== */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a2e1f] text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4"></div>

                <Link to="/" className="flex items-center gap-2 relative z-10">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">TransferHub</span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Start your journey in <span className="text-green-400">Professional Football.</span>
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        Join the network of players, agents, scouts, and clubs shaping the future of the transfer market.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Free forever for basic accounts</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Verified club and scout network</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-gray-400">
                    © 2024 TransferHub. All rights reserved.
                </div>
            </div>

            {/* ==================== RIGHT SIDE: FORM ==================== */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 relative overflow-y-auto">

                {/* Desktop Back to Home */}
                <div className="hidden lg:block absolute top-8 left-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md my-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                        {[1, 2, 3].map((num) => (
                            <div key={num} className="relative z-10 flex flex-col items-center gap-2 bg-gray-50 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= num ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > num ? <Check className="w-4 h-4" /> : num}
                                </div>
                                <span className={`text-xs font-medium ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {num === 1 ? 'Role' : num === 2 ? 'Account' : 'Profile'}
                                </span>
                            </div>
                        ))}
                    </div>

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

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.role === role.id
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${formData.role === role.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {role.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">{role.title}</h3>
                                        <p className="text-xs text-gray-500">{role.description}</p>
                                    </div>
                                ))}
                            </div>
                            {errors.role && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mb-4 justify-center">
                                    <AlertCircle className="w-3 h-3" /> {errors.role}
                                </p>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!formData.role}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                                            placeholder="Create a strong password"
                                            className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {formData.password && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 flex gap-1">
                                                {[1, 2, 3, 4].map(lvl => (
                                                    <div key={lvl} className={`h-1 flex-1 rounded-full ${lvl <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'}`}></div>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                                        </div>
                                    )}
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleBack} className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleNext} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <div className="space-y-4 mb-6">
                                {/* Player Fields */}
                                {formData.role === 'player' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                                                <select name="position" value={formData.position} onChange={handleChange} className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.position ? 'border-red-300' : 'border-gray-300'}`}>
                                                    <option value="">Select position</option>
                                                    <option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Club</label>
                                            <input type="text" name="currentClub" value={formData.currentClub} onChange={handleChange} placeholder="e.g., FC Barcelona" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.currentClub ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
                                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g., Nigerian" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nationality ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                    </>
                                )}

                                {/* Agent Fields */}
                                {formData.role === 'agent' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Agency Name</label>
                                            <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} placeholder="e.g., Elite Sports Management" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.agencyName ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">FIFA License Number</label>
                                            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="e.g., FIFA-AG-2024-12345" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.licenseNumber ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                    </>
                                )}

                                {/* Scout Fields */}
                                {formData.role === 'scout' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Club / Agency</label>
                                            <input type="text" name="scoutClub" value={formData.scoutClub} onChange={handleChange} placeholder="e.g., Manchester United" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.scoutClub ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Scouting License Number</label>
                                            <input type="text" name="scoutLicense" value={formData.scoutLicense} onChange={handleChange} placeholder="e.g., SCT-2024-67890" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.scoutLicense ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                    </>
                                )}

                                {/* Team Fields */}
                                {formData.role === 'team' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Club / Team Name</label>
                                            <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} placeholder="e.g., Real Madrid CF" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.teamName ? 'border-red-300' : 'border-gray-300'}`} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">League</label>
                                                <input type="text" name="league" value={formData.league} onChange={handleChange} placeholder="e.g., La Liga" className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.league ? 'border-red-300' : 'border-gray-300'}`} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (€)</label>
                                                <input type="number" name="transferBudget" value={formData.transferBudget} onChange={handleChange} placeholder="e.g., 50000000" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Terms */}
                                <div className="pt-2">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-4 h-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                        <span className="text-sm text-gray-600">
                                            I agree to the <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                                        </span>
                                    </label>
                                    {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={handleBack} disabled={isLoading} className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button type="submit" onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Register;