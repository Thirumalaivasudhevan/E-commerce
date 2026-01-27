import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
    MapPin, Heart, MessageSquare, Share2, MoreHorizontal,
    ThumbsUp, UserPlus, Image as ImageIcon, Smile, Briefcase,
    Globe, Phone, Mail, Calendar, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

const Post = ({ author, time, content, images, likes, comments }) => (
    <div className="nexus-card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <img src={author.img} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h4 className="font-bold text-text-main text-sm">{author.name}</h4>
                    <span className="text-xs text-text-muted">{time}</span>
                </div>
            </div>
            <MoreHorizontal className="text-text-muted" size={20} />
        </div>

        <p className="text-text-main text-sm mb-4 leading-relaxed">
            {content}
        </p>

        {images && images.length > 0 && (
            <div className={clsx("grid gap-4 mb-4 rounded-xl overflow-hidden", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                {images.map((img, i) => (
                    <img key={i} src={img} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" />
                ))}
            </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-border">
            <button className="flex items-center gap-2 text-text-muted hover:text-red-500 text-sm font-medium transition-colors">
                <Heart size={18} /> {likes}
            </button>
            <button className="flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium transition-colors">
                <MessageSquare size={18} /> {comments}
            </button>
            <button className="flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium transition-colors ml-auto">
                <Share2 size={18} /> Share
            </button>
        </div>
    </div>
);

import { useToast } from '../../../components/ui/Toast';

export default function Social() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchPosts = async () => {
        try {
            const res = await api.get('/social');
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostSubmit = async () => {
        if (!newPostContent.trim()) return;
        try {
            await api.post('/social', { content: newPostContent });
            setNewPostContent('');
            fetchPosts();
            addToast('Post shared successfully!', 'success');
        } catch (err) {
            addToast('Failed to share post', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Banner & Profile Header (Static for now) */}
            <div className="nexus-card overflow-hidden">
                <div className="h-64 bg-surface relative">
                    <img
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-end -mt-12 gap-6">
                        <div className="w-32 h-32 rounded-full p-1 bg-surface shadow-lg relative z-10">
                            <img src="https://ui-avatars.com/api/?name=User&background=random" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                                Current User <CheckCircle size={20} className="text-primary fill-primary/10" />
                            </h1>
                            <p className="text-text-muted text-sm">Nexus Member</p>
                        </div>
                        <div className="flex gap-3 mb-4">
                            <div className="text-center px-4 md:border-r border-border">
                                <div className="font-bold text-text-main text-lg">0</div>
                                <div className="text-xs text-text-muted font-bold uppercase tracking-wider">Follower</div>
                            </div>
                            <div className="text-center px-4 md:border-r border-border">
                                <div className="font-bold text-text-main text-lg">0</div>
                                <div className="text-xs text-text-muted font-bold uppercase tracking-wider">Following</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="font-bold text-text-main text-lg">0</div>
                                <div className="text-xs text-text-muted font-bold uppercase tracking-wider">Likes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Intro */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="nexus-card p-6">
                        <h3 className="font-bold text-text-main mb-4 pb-4 border-b border-border">My Profile</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                <Briefcase size={18} className="text-text-muted" />
                                <span>Works at <span className="font-bold text-text-main">Nexus</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                <Globe size={18} className="text-text-muted" />
                                <span>Native in <span className="font-bold text-text-main">English</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Column - Feed */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Create Post */}
                    <div className="nexus-card p-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                                <Smile size={20} className="text-text-muted" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="What's on your mind?"
                                    className="w-full bg-surface-highlight border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all text-white placeholder-text-muted"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex gap-2 text-text-muted">
                                        <button className="p-2 hover:bg-white/5 rounded-lg"><ImageIcon size={18} /></button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg"><Smile size={18} /></button>
                                    </div>
                                    <button
                                        onClick={handlePostSubmit}
                                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-hover"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-text-muted py-10">Loading posts...</div>
                    ) : (
                        posts.length > 0 ? posts.map(post => (
                            <Post
                                key={post.id}
                                author={{ name: post.user?.name || 'Unknown', img: post.user?.avatar || "https://ui-avatars.com/api/?name=User" }}
                                time={new Date(post.createdAt).toLocaleDateString()}
                                content={post.content}
                                images={post.image ? [post.image] : []}
                                likes={post.likes || 0}
                                comments={post.comments?.length || 0}
                            />
                        )) : (
                            <div className="text-center text-text-muted py-10">No posts yet. Be the first to share something!</div>
                        )
                    )}
                </div>

                {/* Right Column - Photos/Friends */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="nexus-card p-6">
                        <h3 className="font-bold text-text-main mb-4 pb-4 border-b border-border">Suggestions</h3>
                        <div className="text-sm text-text-muted">No suggestions available.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
