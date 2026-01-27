import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Globe, Calendar, Camera, Edit, Save } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Profile() {
    const { user, setUser } = useAuth(); // Update global auth context too if needed
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        name: '',
        role: 'Member',
        email: '',
        location: '',
        bio: '',
        website: '',
        joined: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const u = res.data.user;
            setProfile({
                name: u.name || '',
                role: u.role || 'Member',
                email: u.email || '',
                location: u.location || '',
                bio: u.bio || '',
                website: u.website || '',
                phone: u.phone || '',
                joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/auth/profile', {
                name: profile.name,
                bio: profile.bio,
                location: profile.location,
                website: profile.website,
                phone: profile.phone
            });

            // Update local state if needed
            toast.success("Profile updated successfully!");
            setIsEditing(false);

            // Optionally update global auth user context if name changed
            if (setUser && res.data.user) {
                // We might need to merge or refetch, but let's assume valid
                // This depends on how AuthContext is built
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <div className="space-y-6">
            {/* Banner & Header */}
            <div className="nexus-card overflow-hidden">
                <div className="h-64 bg-surface relative">
                    <img src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover opacity-60" />
                    <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                        <Camera size={20} />
                    </button>
                </div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
                    <div className="w-32 h-32 rounded-full p-1 bg-black shadow-2xl relative group cursor-pointer">
                        <img src={`https://ui-avatars.com/api/?name=${profile.name}&background=random`} className="w-full h-full rounded-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Camera size={24} />
                        </div>
                    </div>
                    <div className="flex-1 mb-2">
                        {isEditing ? (
                            <input
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="nexus-input text-2xl font-bold mb-1"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-text-main">{profile.name}</h1>
                        )}
                        <p className="text-text-muted text-lg">{profile.role}</p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                    >
                        {isEditing ? <Save size={18} /> : <Edit size={18} />}
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Column */}
                <div className="nexus-card p-6 h-fit">
                    <h3 className="font-bold text-text-main mb-6 pb-4 border-b border-border">About Me</h3>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Bio</label>
                            {isEditing ? (
                                <textarea name="bio" value={profile.bio} onChange={handleChange} className="nexus-input h-32" placeholder="Tell us about yourself..." />
                            ) : (
                                <p className="text-sm text-text-main leading-relaxed">{profile.bio || "No bio yet."}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-primary" />
                            <div className="flex-1">
                                <div className="text-xs text-text-muted">Email</div>
                                <div className="text-sm font-bold text-text-main">{profile.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-primary" />
                            <div className="flex-1">
                                <div className="text-xs text-text-muted">Location</div>
                                {isEditing ? (
                                    <input name="location" value={profile.location} onChange={handleChange} className="nexus-input py-1" placeholder="City, Country" />
                                ) : (
                                    <div className="text-sm font-bold text-text-main">{profile.location || "Not set"}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-primary" />
                            <div className="flex-1">
                                <div className="text-xs text-text-muted">Website</div>
                                {isEditing ? (
                                    <input name="website" value={profile.website} onChange={handleChange} className="nexus-input py-1" placeholder="https://..." />
                                ) : (
                                    <a href={profile.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : '#'} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline">{profile.website || "Not set"}</a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-[18px] text-center text-primary">📞</div>
                            <div className="flex-1">
                                <div className="text-xs text-text-muted">Phone</div>
                                {isEditing ? (
                                    <input name="phone" value={profile.phone} onChange={handleChange} className="nexus-input py-1" placeholder="+1..." />
                                ) : (
                                    <div className="text-sm font-bold text-text-main">{profile.phone || "Not set"}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-primary" />
                            <div className="flex-1">
                                <div className="text-xs text-text-muted">Joined</div>
                                <div className="text-sm font-bold text-text-main">{profile.joined}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity / Stats Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats (Mock for now, but could be real later) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="nexus-card p-6 bg-surface-highlight border-l-4 border-primary">
                            <div className="text-3xl font-extrabold text-white mb-1">0</div>
                            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Projects Completed</div>
                        </div>
                        <div className="nexus-card p-6 bg-surface-highlight border-l-4 border-green-500">
                            <div className="text-3xl font-extrabold text-white mb-1">0</div>
                            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Followers</div>
                        </div>
                        <div className="nexus-card p-6 bg-surface-highlight border-l-4 border-purple-500">
                            <div className="text-3xl font-extrabold text-white mb-1">0</div>
                            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Likes</div>
                        </div>
                    </div>

                    {/* Recent Activity Mock */}
                    <div className="nexus-card p-6">
                        <h3 className="font-bold text-text-main mb-6">Recent Activity</h3>
                        <p className="text-text-muted italic">No recent activity.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
