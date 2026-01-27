import { useState, useEffect } from 'react';
import { Bell, Lock, User, Globe, Moon, Shield, Save } from 'lucide-react';
import clsx from 'clsx';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('Account');
    const [formData, setFormData] = useState({});
    const { theme, setTheme } = useTheme();

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (activeTab === 'Account' || activeTab === 'Notifications') {
            fetchProfile();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setFormData(res.data.user);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.put('/auth/profile', formData);
            toast.success("Settings updated!");
        } catch (err) {
            toast.error("Failed to update settings");
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        try {
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password updated successfully");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        }
    };

    const toggleNotification = async (key) => {
        const newData = { ...formData, [key]: !formData[key] };
        setFormData(newData);
        try {
            await api.put('/auth/profile', newData);
            toast.success("Preference saved");
        } catch (err) {
            toast.error("Failed to save preference");
            // revert
            setFormData(formData);
        }
    };

    const tabs = [
        { id: 'Account', icon: User },
        { id: 'Security', icon: Lock },
        { id: 'Notifications', icon: Bell },
        { id: 'Appearance', icon: Moon },
    ];

    return (
        <div className="nexus-card min-h-[calc(100vh-8rem)] flex flex-col md:flex-row overflow-hidden p-0">

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border p-6">
                <h2 className="text-xl font-bold text-text-main mb-8">Settings</h2>
                <div className="space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-text-muted hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'Account' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-lg font-bold text-text-main mb-1">Account Information</h3>
                            <p className="text-sm text-text-muted">Update your account details and profile.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-text-muted mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        className="nexus-input"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-text-muted mb-1 block">Phone</label>
                                    <input
                                        type="text"
                                        className="nexus-input"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        placeholder="+1..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    className="nexus-input opacity-70 cursor-not-allowed"
                                    value={formData.email || ''}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Bio</label>
                                <textarea
                                    className="nexus-input h-24"
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Location</label>
                                <input
                                    type="text"
                                    className="nexus-input"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Website</label>
                                <input
                                    type="text"
                                    className="nexus-input"
                                    name="website"
                                    value={formData.website || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end">
                            <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'Security' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-lg font-bold text-text-main mb-1">Security Settings</h3>
                            <p className="text-sm text-text-muted">Manage your password and security preferences.</p>
                        </div>

                        <div className="bg-surface-highlight p-6 rounded-xl border border-border">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-1">Two-Factor Authentication</h4>
                                    <p className="text-sm text-text-muted mb-4">Add an extra layer of security to your account.</p>
                                    <button
                                        onClick={() => toast('Coming soon!', { icon: '🚧' })}
                                        className="text-xs font-bold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-text-main border-b border-border pb-2">Change Password</h4>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Current Password</label>
                                <input
                                    name="currentPassword"
                                    type="password"
                                    className="nexus-input"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">New Password</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    className="nexus-input"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-muted mb-1 block">Confirm New Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    className="nexus-input"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end">
                            <button onClick={handleUpdatePassword} className="btn btn-primary flex items-center gap-2">
                                <Save size={18} /> Update Password
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'Appearance' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-lg font-bold text-text-main mb-1">Appearance Settings</h3>
                            <p className="text-sm text-text-muted">Customize how Nexus looks on your device.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="nexus-card p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-text-main">Theme Preference</h4>
                                    <p className="text-sm text-text-muted">Switch between dark and light mode.</p>
                                </div>
                                <div className="flex bg-surface border border-border rounded-lg p-1">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={clsx(
                                            "px-4 py-2 rounded-md text-sm font-bold transition-all",
                                            theme === 'light' ? "bg-white text-black shadow-sm" : "text-text-muted hover:text-white"
                                        )}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={clsx(
                                            "px-4 py-2 rounded-md text-sm font-bold transition-all",
                                            theme === 'dark' ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-white"
                                        )}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Notifications' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-lg font-bold text-text-main mb-1">Notification Preferences</h3>
                            <p className="text-sm text-text-muted">Manage how we contact you.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="nexus-card p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-text-main">Email Notifications</h4>
                                    <p className="text-sm text-text-muted">Receive emails about your account activity.</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification('emailNotifications')}
                                    className={clsx("w-12 h-6 rounded-full p-1 transition-colors", formData.emailNotifications ? "bg-primary" : "bg-gray-600")}
                                >
                                    <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", formData.emailNotifications ? "translate-x-6" : "translate-x-0")} />
                                </button>
                            </div>

                            <div className="nexus-card p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-text-main">Push Notifications</h4>
                                    <p className="text-sm text-text-muted">Receive push notifications on your device.</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification('pushNotifications')}
                                    className={clsx("w-12 h-6 rounded-full p-1 transition-colors", formData.pushNotifications ? "bg-primary" : "bg-gray-600")}
                                >
                                    <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", formData.pushNotifications ? "translate-x-6" : "translate-x-0")} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
