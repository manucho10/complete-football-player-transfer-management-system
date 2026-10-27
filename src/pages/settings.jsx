// src/pages/Settings.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Settings as SettingsIcon,
    User,
    Lock,
    Bell,
    Palette,
    Shield,
    Trash2,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Mail,
    Phone,
    Globe,
    Sun,
    Moon,
    Monitor,
    MessageSquare,
    FileText,
    TrendingUp,
    Smartphone,
    Key,
    LogOut,
    Download,
    Upload,
    X,
    Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    // Added uploadAvatar to useAuth
    const { user, updateUser, logout, uploadAvatar } = useAuth();

    // Active tab
    const [activeTab, setActiveTab] = useState('account');

    // ================================================================
    // ACCOUNT TAB STATE
    // ================================================================
    const [accountData, setAccountData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        country: user?.country || '',
        bio: user?.bio || '',
    });

    // ================================================================
    // SECURITY TAB STATE
    // ================================================================
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

    // ================================================================
    // NOTIFICATIONS TAB STATE
    // ================================================================
    const [notificationPrefs, setNotificationPrefs] = useState({
        emailOffers: true,
        emailMessages: true,
        emailInterest: true,
        emailSystem: false,
        pushOffers: true,
        pushMessages: true,
        pushInterest: false,
        pushSystem: false,
        weeklyDigest: true,
        marketing: false,
    });

    // ================================================================
    // APPEARANCE TAB STATE
    // ================================================================
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('auto');

    // ================================================================
    // PRIVACY TAB STATE
    // ================================================================
    const [privacyPrefs, setPrivacyPrefs] = useState({
        profilePublic: user?.profilePublic !== false,
        showEmail: user?.showEmail || false,
        showPhone: user?.showPhone || false,
        allowMessagesFrom: 'everyone',
        showOnlineStatus: true,
        allowSearchIndexing: true,
    });

    // ================================================================
    // UI STATE & FILE UPLOAD
    // ================================================================
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // File Upload Ref & State
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!user) return null;

    // Tabs config
    const tabs = [
        { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
        { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
        { id: 'danger', label: 'Danger Zone', icon: <AlertCircle className="w-4 h-4" /> },
    ];

    // Role config
    const roleConfig = {
        player: { label: 'Player', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-400' },
        agent: { label: 'Agent', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10', text: 'text-purple-400' },
        scout: { label: 'Scout', color: 'from-green-500 to-green-600', bg: 'bg-green-500/10', text: 'text-green-400' },
        team: { label: 'Team', color: 'from-red-500 to-red-600', bg: 'bg-red-500/10', text: 'text-red-400' },
    };
    const role = roleConfig[user.role] || roleConfig.player;
    const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

    // ================================================================
    // HANDLERS
    // ================================================================
    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Maximum size is 2MB.");
            return;
        }

        setIsUploading(true);
        const result = await uploadAvatar(file);
        setIsUploading(false);

        if (result.success) {
            showSuccess('Profile picture updated!');
        } else {
            alert('Failed to upload picture: ' + result.error);
        }
    };

    const handleAccountSave = async (e) => {
        e.preventDefault();
        setErrors({});
        const newErrors = {};

        if (!accountData.name.trim()) newErrors.name = 'Name is required';
        if (!accountData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
            newErrors.email = 'Enter a valid email';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const result = await updateUser(accountData);
        setIsLoading(false);

        if (result.success) {
            showSuccess('Account settings saved!');
        } else {
            setErrors({ general: result.error });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrors({});
        const newErrors = {};

        if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password required';
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'Must be at least 8 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        // 🔌 In a real app, you would use supabase.auth.updateUser({ password: newPassword })
        await new Promise((r) => setTimeout(r, 800));
        setIsLoading(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showSuccess('Password updated successfully!');
    };

    const handleNotificationSave = async () => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setIsLoading(false);
        showSuccess('Notification preferences saved!');
    };

    const handleAppearanceSave = async () => {
        setIsLoading(true);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            prefersDark ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);

        await new Promise((r) => setTimeout(r, 500));
        setIsLoading(false);
        showSuccess('Appearance settings saved!');
    };

    const handlePrivacySave = async () => {
        setIsLoading(true);
        const result = await updateUser({
            profilePublic: privacyPrefs.profilePublic,
            showEmail: privacyPrefs.showEmail,
            showPhone: privacyPrefs.showPhone,
        });
        setIsLoading(false);

        if (result.success) {
            showSuccess('Privacy settings saved!');
        }
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'DELETE') return;
        logout();
        navigate('/');
    };

    const handleExportData = () => {
        const data = {
            user: { name: user.name, email: user.email, role: user.role },
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transferhub-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Data exported!');
    };

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-green-400" />
                        Settings
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* ==================== SIDEBAR TABS ==================== */}
                    <aside className="md:col-span-1">
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-3 md:sticky md:top-24">

                            {/* User card */}
                            <div className="px-3 py-3 border-b border-gray-700 mb-2">
                                <div className="flex items-center gap-3">
                                    {/* Sidebar Avatar Update */}
                                    <div className={`w-10 h-10 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center text-white font-semibold overflow-hidden`}>
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            userInitial
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{user.name}</p>
                                        <p className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase inline-block ${role.bg} ${role.text}`}>
                                            {role.label}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === tab.id
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                                : tab.id === 'danger'
                                                    ? 'text-red-400 hover:bg-red-500/10'
                                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Logout */}
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <button
                                    onClick={() => { logout(); navigate('/login'); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* ==================== TAB CONTENT ==================== */}
                    <div className="md:col-span-3">

                        {/* ==================== ACCOUNT ==================== */}
                        {activeTab === 'account' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">

                                {/* Header with Avatar */}
                                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-700">
                                    <div className="relative">
                                        {/* THE AVATAR IMAGE */}
                                        <div className="w-24 h-24 bg-gray-900/40 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-gray-600">
                                            {isUploading ? (
                                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                                            ) : user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                userInitial
                                            )}
                                        </div>

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        {/* Camera Button */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-600 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            <Camera className="w-4 h-4 text-white" />
                                        </button>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Profile Picture</h2>
                                        <p className="text-sm text-gray-400">Click the camera icon to upload a new photo. Max size 2MB.</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-1">Account Information</h2>
                                    <p className="text-sm text-gray-400">Update your personal details</p>
                                </div>

                                <form onSubmit={handleAccountSave} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={accountData.name}
                                                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                                                    className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                        }`}
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="email"
                                                    value={accountData.email}
                                                    disabled
                                                    className="w-full bg-gray-700/30 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="mt-1 text-[10px] text-gray-500">Email cannot be changed.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="tel"
                                                    value={accountData.phone}
                                                    onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                                                    placeholder="+1 234 567 8900"
                                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={accountData.country}
                                                    onChange={(e) => setAccountData({ ...accountData, country: e.target.value })}
                                                    placeholder="e.g., Nigeria"
                                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                        <textarea
                                            rows={4}
                                            value={accountData.bio}
                                            onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                            ) : (
                                                <><Save className="w-4 h-4" /> Save Changes</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ==================== SECURITY ==================== */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold mb-1">Change Password</h2>
                                        <p className="text-sm text-gray-400">Use a strong password to keep your account secure</p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none ${errors.currentPassword ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                                >
                                                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.currentPassword && (
                                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.currentPassword}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none ${errors.newPassword ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                                >
                                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && (
                                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.newPassword}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className={`w-full bg-gray-700/50 border rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-all"
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                            ) : (
                                                <><Save className="w-4 h-4" /> Update Password</>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* 2FA */}
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
                                                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                            className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                                }`}></span>
                                        </button>
                                    </div>
                                    {twoFactorEnabled && (
                                        <p className="mt-4 text-xs text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Two-factor authentication is enabled
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ==================== NOTIFICATIONS ==================== */}
                        {activeTab === 'notifications' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-1">Notification Preferences</h2>
                                    <p className="text-sm text-gray-400">Choose how you want to be notified</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" /> Email Notifications
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'emailOffers', label: 'New offers', desc: 'When a club submits an offer' },
                                            { key: 'emailMessages', label: 'New messages', desc: 'When you receive a message' },
                                            { key: 'emailInterest', label: 'Profile interest', desc: 'When a scout or club views your profile' },
                                            { key: 'emailSystem', label: 'System updates', desc: 'Account and platform announcements' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium">{item.label}</p>
                                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                                </div>
                                                <Toggle
                                                    checked={notificationPrefs[item.key]}
                                                    onChange={() => setNotificationPrefs({ ...notificationPrefs, [item.key]: !notificationPrefs[item.key] })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-purple-400" /> Push Notifications
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'pushOffers', label: 'New offers' },
                                            { key: 'pushMessages', label: 'New messages' },
                                            { key: 'pushInterest', label: 'Profile interest' },
                                            { key: 'pushSystem', label: 'System updates' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                                <p className="text-sm font-medium">{item.label}</p>
                                                <Toggle
                                                    checked={notificationPrefs[item.key]}
                                                    onChange={() => setNotificationPrefs({ ...notificationPrefs, [item.key]: !notificationPrefs[item.key] })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Weekly Digest</p>
                                            <p className="text-xs text-gray-400">Get a summary of your weekly activity</p>
                                        </div>
                                        <Toggle
                                            checked={notificationPrefs.weeklyDigest}
                                            onChange={() => setNotificationPrefs({ ...notificationPrefs, weeklyDigest: !notificationPrefs.weeklyDigest })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Marketing Emails</p>
                                            <p className="text-xs text-gray-400">Promotions, tips, and updates</p>
                                        </div>
                                        <Toggle
                                            checked={notificationPrefs.marketing}
                                            onChange={() => setNotificationPrefs({ ...notificationPrefs, marketing: !notificationPrefs.marketing })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleNotificationSave}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Preferences</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ==================== APPEARANCE ==================== */}
                        {activeTab === 'appearance' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-1">Appearance</h2>
                                    <p className="text-sm text-gray-400">Customize how TransferHub looks</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-green-400" /> Theme
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
                                            { id: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
                                            { id: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === t.id
                                                        ? 'border-green-500 bg-green-500/10 text-green-400'
                                                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                                                    }`}
                                            >
                                                {t.icon}
                                                <span className="text-xs font-semibold">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-400" /> Language
                                    </h3>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="es">Español</option>
                                        <option value="pt">Português</option>
                                        <option value="ar">العربية</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-purple-400" /> Timezone
                                    </h3>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                                    >
                                        <option value="auto">Auto-detect</option>
                                        <option value="utc">UTC</option>
                                        <option value="est">Eastern (EST)</option>
                                        <option value="pst">Pacific (PST)</option>
                                        <option value="gmt">GMT</option>
                                        <option value="wat">West Africa (WAT)</option>
                                    </select>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAppearanceSave}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Preferences</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ==================== PRIVACY ==================== */}
                        {activeTab === 'privacy' && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-1">Privacy & Visibility</h2>
                                    <p className="text-sm text-gray-400">Control who can see your information</p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Public Profile</p>
                                            <p className="text-xs text-gray-400">Allow anyone to view your profile</p>
                                        </div>
                                        <Toggle
                                            checked={privacyPrefs.profilePublic}
                                            onChange={() => setPrivacyPrefs({ ...privacyPrefs, profilePublic: !privacyPrefs.profilePublic })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Show Email Address</p>
                                            <p className="text-xs text-gray-400">Display your email on your profile</p>
                                        </div>
                                        <Toggle
                                            checked={privacyPrefs.showEmail}
                                            onChange={() => setPrivacyPrefs({ ...privacyPrefs, showEmail: !privacyPrefs.showEmail })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Show Phone Number</p>
                                            <p className="text-xs text-gray-400">Display your phone on your profile</p>
                                        </div>
                                        <Toggle
                                            checked={privacyPrefs.showPhone}
                                            onChange={() => setPrivacyPrefs({ ...privacyPrefs, showPhone: !privacyPrefs.showPhone })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Show Online Status</p>
                                            <p className="text-xs text-gray-400">Let others see when you're online</p>
                                        </div>
                                        <Toggle
                                            checked={privacyPrefs.showOnlineStatus}
                                            onChange={() => setPrivacyPrefs({ ...privacyPrefs, showOnlineStatus: !privacyPrefs.showOnlineStatus })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Search Engine Indexing</p>
                                            <p className="text-xs text-gray-400">Allow search engines to index your profile</p>
                                        </div>
                                        <Toggle
                                            checked={privacyPrefs.allowSearchIndexing}
                                            onChange={() => setPrivacyPrefs({ ...privacyPrefs, allowSearchIndexing: !privacyPrefs.allowSearchIndexing })}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-purple-400" /> Who can message you
                                    </h3>
                                    <select
                                        value={privacyPrefs.allowMessagesFrom}
                                        onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, allowMessagesFrom: e.target.value })}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                                    >
                                        <option value="everyone">Everyone</option>
                                        <option value="verified">Verified users only</option>
                                        <option value="connections">My connections only</option>
                                        <option value="nobody">Nobody</option>
                                    </select>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePrivacySave}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Preferences</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ==================== DANGER ZONE ==================== */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                                        <Download className="w-5 h-5 text-blue-400" /> Export Your Data
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Download a copy of all your TransferHub data
                                    </p>
                                    <button
                                        onClick={handleExportData}
                                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Download Data
                                    </button>
                                </div>

                                <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
                                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-red-400">
                                        <Trash2 className="w-5 h-5" /> Delete Account
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Once you delete your account, there is no going back. All your data, including your profile, offers, and messages, will be permanently deleted.
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================== DELETE MODAL ==================== */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-gray-800 rounded-2xl border border-red-500/30 max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold">Delete Account?</h2>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            This action <strong className="text-red-400">cannot be undone</strong>. Type{' '}
                            <span className="font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</span>{' '}
                            to confirm.
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE'}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

// Small reusable toggle component
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-600'
            }`}
    >
        <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
        ></span>
    </button>
);

export default Settings;