// src/pages/Settings.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Settings as SettingsIcon, User, Lock, Bell, Palette, Shield,
    Trash2, Save, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Mail,
    Phone, Globe, Sun, Moon, Monitor, MessageSquare, Smartphone, Key, LogOut,
    Download, X, Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout, uploadAvatar } = useAuth();

    const [activeTab, setActiveTab] = useState('account');

    const [accountData, setAccountData] = useState({
        name: user?.name || '', email: user?.email || '', phone: user?.phone || '', country: user?.country || '', bio: user?.bio || '',
    });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

    const [notificationPrefs, setNotificationPrefs] = useState({
        emailOffers: true, emailMessages: true, emailInterest: true, emailSystem: false,
        pushOffers: true, pushMessages: true, pushInterest: false, pushSystem: false,
        weeklyDigest: true, marketing: false,
    });

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('auto');

    const [privacyPrefs, setPrivacyPrefs] = useState({
        profilePublic: user?.profilePublic !== false, showEmail: user?.showEmail || false, showPhone: user?.showPhone || false,
        allowMessagesFrom: 'everyone', showOnlineStatus: true, allowSearchIndexing: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!user) return null;

    const tabs = [
        { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
        { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
        { id: 'danger', label: 'Danger Zone', icon: <AlertCircle className="w-4 h-4" /> },
    ];

    const roleConfig = {
        player: { label: 'Player', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        agent: { label: 'Agent', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
        scout: { label: 'Scout', color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        team: { label: 'Team', color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    const role = roleConfig[user.role] || roleConfig.player;
    const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return alert("File is too large. Maximum size is 2MB.");
        setIsUploading(true);
        const result = await uploadAvatar(file);
        setIsUploading(false);
        if (result.success) showSuccess('Profile picture updated!');
        else alert('Failed to upload picture: ' + result.error);
    };

    const handleAccountSave = async (e) => {
        e.preventDefault();
        setErrors({});
        const newErrors = {};
        if (!accountData.name.trim()) newErrors.name = 'Name is required';
        if (!accountData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) newErrors.email = 'Enter a valid email';
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
        const result = await updateUser(accountData);
        setIsLoading(false);
        if (result.success) showSuccess('Account settings saved!');
        else setErrors({ general: result.error });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrors({});
        const newErrors = {};
        if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password required';
        if (!passwordData.newPassword) newErrors.newPassword = 'New password required';
        else if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Must be at least 8 characters';
        if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
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
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else if (theme === 'light') document.documentElement.classList.remove('dark');
        else {
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
        const result = await updateUser({ profilePublic: privacyPrefs.profilePublic, showEmail: privacyPrefs.showEmail, showPhone: privacyPrefs.showPhone });
        setIsLoading(false);
        if (result.success) showSuccess('Privacy settings saved!');
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'DELETE') return;
        logout();
        navigate('/');
    };

    const handleExportData = () => {
        const data = { user: { name: user.name, email: user.email, role: user.role }, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transferhub-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Data exported!');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <SettingsIcon className="w-5 h-5 text-green-600" /> Settings
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fadeIn shadow-sm">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* ==================== SIDEBAR TABS ==================== */}
                    <aside className="md:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-3 md:sticky md:top-24 shadow-sm">

                            <div className="px-3 py-4 border-b border-gray-100 mb-2 flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center text-white font-bold overflow-hidden shadow-sm`}>
                                    {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : userInitial}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${role.bg} ${role.text} ${role.border}`}>
                                        {role.label}
                                    </p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${activeTab === tab.id
                                                ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                                                : tab.id === 'danger'
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* ==================== TAB CONTENT ==================== */}
                    <div className="md:col-span-3">

                        {/* ACCOUNT */}
                        {activeTab === 'account' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm animate-fadeIn">
                                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-gray-200">
                                            {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-green-600" /> : user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : userInitial}
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm">
                                            <Camera className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Picture</h2>
                                        <p className="text-sm text-gray-500">Click the camera icon to upload a new photo. Max size 2MB.</p>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>

                                <form onSubmit={handleAccountSave} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="text" value={accountData.name} onChange={(e) => setAccountData({ ...accountData, name: e.target.value })} className={`w-full bg-gray-50 border rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 focus:outline-none transition-all ${errors.name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} />
                                            </div>
                                            {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="email" value={accountData.email} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                                            </div>
                                            <p className="mt-1.5 text-xs text-gray-500">Email cannot be changed.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="tel" value={accountData.phone} onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })} placeholder="+1 234 567 8900" className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="text" value={accountData.country} onChange={(e) => setAccountData({ ...accountData, country: e.target.value })} placeholder="e.g., Nigeria" className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                        <textarea rows={4} value={accountData.bio} onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })} placeholder="Tell us about yourself..." className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all" />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* SECURITY */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type={showPasswords.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={`w-full bg-gray-50 border rounded-xl pl-12 pr-12 py-3 text-sm text-gray-900 focus:outline-none transition-all ${errors.currentPassword ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} />
                                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.currentPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.currentPassword}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type={showPasswords.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={`w-full bg-gray-50 border rounded-xl pl-12 pr-12 py-3 text-sm text-gray-900 focus:outline-none transition-all ${errors.newPassword ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} />
                                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.newPassword}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={`w-full bg-gray-50 border rounded-xl pl-12 pr-12 py-3 text-sm text-gray-900 focus:outline-none transition-all ${errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} />
                                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
                                        </div>
                                        <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <><Save className="w-5 h-5" /> Update Password</>}
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 border border-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">Two-Factor Authentication</h3>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                            {twoFactorEnabled && <p className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Enabled</p>}
                                        </div>
                                    </div>
                                    <Toggle checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} />
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm animate-fadeIn">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" /> Email Notifications
                                </h3>
                                <div className="space-y-3 mb-8">
                                    {[
                                        { key: 'emailOffers', label: 'New offers', desc: 'When a club submits an offer' },
                                        { key: 'emailMessages', label: 'New messages', desc: 'When you receive a message' },
                                        { key: 'emailInterest', label: 'Profile interest', desc: 'When a scout views your profile' },
                                        { key: 'emailSystem', label: 'System updates', desc: 'Account announcements' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <Toggle checked={notificationPrefs[item.key]} onChange={() => setNotificationPrefs({ ...notificationPrefs, [item.key]: !notificationPrefs[item.key] })} />
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-purple-600" /> Push Notifications
                                </h3>
                                <div className="space-y-3 mb-8">
                                    {[
                                        { key: 'pushOffers', label: 'New offers' },
                                        { key: 'pushMessages', label: 'New messages' },
                                        { key: 'pushInterest', label: 'Profile interest' },
                                        { key: 'pushSystem', label: 'System updates' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                            <Toggle checked={notificationPrefs[item.key]} onChange={() => setNotificationPrefs({ ...notificationPrefs, [item.key]: !notificationPrefs[item.key] })} />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button onClick={handleNotificationSave} disabled={isLoading} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* APPEARANCE */}
                        {activeTab === 'appearance' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm animate-fadeIn">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>

                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-green-600" /> Theme
                                </h3>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[
                                        { id: 'light', label: 'Light', icon: <Sun className="w-6 h-6" /> },
                                        { id: 'dark', label: 'Dark', icon: <Moon className="w-6 h-6" /> },
                                        { id: 'system', label: 'System', icon: <Monitor className="w-6 h-6" /> },
                                    ].map((t) => (
                                        <button key={t.id} onClick={() => setTheme(t.id)} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === t.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-500 bg-gray-50'}`}>
                                            {t.icon}
                                            <span className="text-xs font-bold">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-600" /> Language
                                        </h3>
                                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="es">Español</option>
                                            <option value="pt">Português</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Monitor className="w-4 h-4 text-purple-600" /> Timezone
                                        </h3>
                                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="auto">Auto-detect</option>
                                            <option value="utc">UTC</option>
                                            <option value="est">Eastern (EST)</option>
                                            <option value="pst">Pacific (PST)</option>
                                            <option value="gmt">GMT</option>
                                            <option value="wat">West Africa (WAT)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleAppearanceSave} disabled={isLoading} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PRIVACY */}
                        {activeTab === 'privacy' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm animate-fadeIn">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy & Visibility</h2>

                                <div className="space-y-3 mb-8">
                                    {[
                                        { key: 'profilePublic', label: 'Public Profile', desc: 'Allow anyone to view your profile' },
                                        { key: 'showEmail', label: 'Show Email Address', desc: 'Display your email on your profile' },
                                        { key: 'showPhone', label: 'Show Phone Number', desc: 'Display your phone on your profile' },
                                        { key: 'showOnlineStatus', label: 'Show Online Status', desc: "Let others see when you're online" },
                                        { key: 'allowSearchIndexing', label: 'Search Engine Indexing', desc: 'Allow search engines to index your profile' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <Toggle checked={privacyPrefs[item.key]} onChange={() => setPrivacyPrefs({ ...privacyPrefs, [item.key]: !privacyPrefs[item.key] })} />
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-purple-600" /> Who can message you
                                    </h3>
                                    <select value={privacyPrefs.allowMessagesFrom} onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, allowMessagesFrom: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                                        <option value="everyone">Everyone</option>
                                        <option value="verified">Verified users only</option>
                                        <option value="connections">My connections only</option>
                                        <option value="nobody">Nobody</option>
                                    </select>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handlePrivacySave} disabled={isLoading} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DANGER ZONE */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Download className="w-5 h-5 text-blue-600" /> Export Your Data
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-6">Download a copy of all your TransferHub data.</p>
                                    <button onClick={handleExportData} className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                                        <Download className="w-4 h-4" /> Download Data
                                    </button>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5" /> Delete Account
                                    </h2>
                                    <p className="text-sm text-red-700/80 mb-6">
                                        Once you delete your account, there is no going back. All your data will be permanently deleted.
                                    </p>
                                    <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                                        <Trash2 className="w-4 h-4" /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Delete Account?</h2>
                            </div>
                            <button onClick={() => setShowDeleteModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            This action <strong className="text-red-600">cannot be undone</strong>. Type <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">DELETE</span> to confirm.
                        </p>

                        <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE to confirm" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-6" />

                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold py-2.5 rounded-xl transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm">
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}} />
        </div>
    );
};

// Small reusable toggle component
const Toggle = ({ checked, onChange }) => (
    <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></span>
    </button>
);

export default Settings;