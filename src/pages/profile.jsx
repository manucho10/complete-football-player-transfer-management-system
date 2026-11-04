// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Briefcase,
    Search,
    Shield,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Globe,
    Building2,
    Award,
    FileText,
    Target,
    Save,
    ArrowLeft,
    Camera,
    Edit3,
    X,
    Check,
    AlertCircle,
    CheckCircle2,
    Loader2,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient'; // ⭐ Added Supabase

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser, refreshProfile } = useAuth();

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        currentClub: '',
        nationality: '',
        dateOfBirth: '',
        agencyName: '',
        licenseNumber: '',
        scoutClub: '',
        scoutLicense: '',
        teamName: '',
        league: '',
        transferBudget: '',
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // ⭐ Fetch fresh data from Database on mount
    useEffect(() => {
        const fetchLatestData = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFormData({
                    fullName: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    position: data.position || '',
                    // ⭐ This pulls the new team name from the DB
                    currentClub: data.current_club || '',
                    nationality: data.nationality || '',
                    dateOfBirth: data.date_of_birth || '',
                    agencyName: data.agency_name || '',
                    licenseNumber: data.license_number || '',
                    scoutClub: data.scout_club || '',
                    scoutLicense: data.license_number || '',
                    teamName: data.team_name || '',
                    league: data.league || '',
                    transferBudget: data.transfer_budget || '',
                });
            }
        };

        fetchLatestData();
        refreshProfile();
    }, [user]);

    if (!user) return null;

    // Role config
    const roleConfig = {
        player: { icon: <User className="w-5 h-5" />, label: 'Player', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
        agent: { icon: <Briefcase className="w-5 h-5" />, label: 'Agent', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
        scout: { icon: <Search className="w-5 h-5" />, label: 'Scout', color: 'from-green-500 to-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
        team: { icon: <Shield className="w-5 h-5" />, label: 'Team', color: 'from-red-500 to-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    };

    const role = roleConfig[user.role] || roleConfig.player;
    const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (user.role === 'player') {
            if (!formData.position) newErrors.position = 'Position is required';
            if (!formData.currentClub.trim()) newErrors.currentClub = 'Current club is required';
            if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        }

        if (user.role === 'agent') {
            if (!formData.agencyName.trim()) newErrors.agencyName = 'Agency name is required';
            if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        }

        if (user.role === 'scout') {
            if (!formData.scoutClub.trim()) newErrors.scoutClub = 'Club/Agency is required';
            if (!formData.scoutLicense.trim()) newErrors.scoutLicense = 'License number is required';
        }

        if (user.role === 'team') {
            if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
            if (!formData.league.trim()) newErrors.league = 'League is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrors({});

        if (!validate()) return;

        setIsLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            updateUser({
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                currentClub: formData.currentClub,
                nationality: formData.nationality,
                dateOfBirth: formData.dateOfBirth,
                agencyName: formData.agencyName,
                licenseNumber: formData.licenseNumber,
                scoutClub: formData.scoutClub,
                scoutLicense: formData.scoutLicense,
                teamName: formData.teamName,
                league: formData.league,
                transferBudget: formData.transferBudget,
            });

            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrors({ general: 'Failed to update profile. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        setSuccessMessage('');
        setFormData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            position: user.position || '',
            currentClub: user.currentClub || '',
            nationality: user.nationality || '',
            dateOfBirth: user.dateOfBirth || '',
            agencyName: user.agencyName || '',
            licenseNumber: user.licenseNumber || '',
            scoutClub: user.scoutClub || '',
            scoutLicense: user.scoutLicense || '',
            teamName: user.teamName || '',
            league: user.league || '',
            transferBudget: user.transferBudget || '',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${role.color} rounded-full mix-blend-multiply filter blur-3xl opacity-10`}></div>
            </div>

            <div className="relative max-w-4xl mx-auto p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>

                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                        <button onClick={handleCancel} className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    )}
                </div>

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fadeIn">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.general}
                    </div>
                )}

                {/* Profile Header */}
                <div className={`bg-gradient-to-r ${role.color} rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden`}>
                    <div className="absolute -right-8 -bottom-8 opacity-10"><div className="w-48 h-48">{role.icon}</div></div>
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="relative">
                            <div className={`w-24 h-24 bg-gray-900/40 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold`}>{userInitial}</div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{formData.fullName || user.name}</h1>
                            <p className="text-white/80 mb-3">{formData.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold`}>
                                    {role.icon} {role.label}
                                </span>
                                {user.role === 'scout' && user.team_id && (
                                    <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
                                        <Building2 className="w-3 h-3" /> Hired by Club
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Account Information */}
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" /> Account Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.fullName ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`} />
                                </div>
                                {errors.fullName && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`} />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="+1 234 567 8900" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500">{role.icon}</div>
                                    <input type="text" value={role.label} disabled className="w-full bg-gray-700/30 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-400 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Player Fields */}
                    {user.role === 'player' && (
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" /> Player Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <select name="position" value={formData.position} onChange={handleChange} disabled={!isEditing} className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none appearance-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.position ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`}>
                                            <option value="">Select position</option>
                                            <option value="Goalkeeper">Goalkeeper</option>
                                            <option value="Defender">Defender</option>
                                            <option value="Midfielder">Midfielder</option>
                                            <option value="Forward">Forward</option>
                                        </select>
                                    </div>
                                    {errors.position && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.position}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={!isEditing} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Club</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="currentClub" value={formData.currentClub} onChange={handleChange} disabled={!isEditing} placeholder="e.g., FC Barcelona" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.currentClub ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`} />
                                    </div>
                                    {errors.currentClub && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.currentClub}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} disabled={!isEditing} placeholder="e.g., Nigerian" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.nationality ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`} />
                                    </div>
                                    {errors.nationality && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nationality}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Agent Fields */}
                    {user.role === 'agent' && (
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-400" /> Agent Details</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Agency Name</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} disabled={!isEditing} placeholder="e.g., Elite Sports Management" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.agencyName ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'}`} />
                                    </div>
                                    {errors.agencyName && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.agencyName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">FIFA Agent License Number</label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} disabled={!isEditing} placeholder="e.g., FIFA-AG-2024-12345" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.licenseNumber ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'}`} />
                                    </div>
                                    {errors.licenseNumber && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.licenseNumber}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scout Fields */}
                    {user.role === 'scout' && (
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-green-400" /> Scout Details</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Club / Agency You Scout For</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="scoutClub" value={formData.scoutClub || user?.scoutClub || ''} disabled={true} placeholder="Hired by a Team via Dashboard" className="w-full bg-gray-700/30 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-400 cursor-not-allowed" />
                                    </div>
                                    <p className="mt-1 text-[10px] text-gray-500">This is automatically updated when a Team hires you.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Scouting License Number</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="scoutLicense" value={formData.scoutLicense} onChange={handleChange} disabled={!isEditing} placeholder="e.g., SCT-2024-67890" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.scoutLicense ? 'border-red-500' : 'border-gray-600 focus:border-green-500'}`} />
                                    </div>
                                    {errors.scoutLicense && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.scoutLicense}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Fields */}
                    {user.role === 'team' && (
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" /> Team Details</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Club / Team Name</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} disabled={!isEditing} placeholder="e.g., Real Madrid CF" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.teamName ? 'border-red-500' : 'border-gray-600 focus:border-red-500'}`} />
                                    </div>
                                    {errors.teamName && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.teamName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">League</label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" name="league" value={formData.league} onChange={handleChange} disabled={!isEditing} placeholder="e.g., La Liga" className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${errors.league ? 'border-red-500' : 'border-gray-600 focus:border-red-500'}`} />
                                    </div>
                                    {errors.league && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.league}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Transfer Budget (€)</label>
                                    <input type="number" name="transferBudget" value={formData.transferBudget} onChange={handleChange} disabled={!isEditing} placeholder="e.g., 50000000" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {isEditing && (
                        <div className="flex gap-3">
                            <button type="button" onClick={handleCancel} disabled={isLoading} className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                                {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : (<><Save className="w-4 h-4" /> Save Changes</>)}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}} />
        </div>
    );
};

export default Profile;