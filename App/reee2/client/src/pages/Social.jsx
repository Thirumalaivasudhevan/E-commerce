import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Image as ImageIcon, Video as VideoIcon, Smile, Send,
  UserPlus, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Social() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/social');
      setPosts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await api.post('/social', { content: newPost });
      setNewPost('');
      fetchPosts();
    } catch (err) { alert("Failed to post"); }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Main Feed */}
      <div className="flex-1 space-y-6">
        {/* Create Post */}
        <div className="riho-card">
           <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-primary">Me</div>
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?" 
                className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none h-24"
              />
           </div>
           <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex gap-2">
                 <button className="p-2 hover:bg-red-50 rounded-full transition-colors"><ImageIcon size={20} /></button>
                 <button className="p-2 hover:bg-red-50 rounded-full transition-colors"><Smile size={20} /></button>
              </div>
              <button 
                onClick={handleCreatePost}
                className="btn btn-primary px-6 shadow-md shadow-red-500/20"
              >
                 Post
              </button>
           </div>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-6">
            {[1,2].map(i => <div key={i} className="riho-card h-64 animate-pulse bg-gray-50" />)}
          </div>
        ) : (
          posts.map(post => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={post.id} 
              className="riho-card overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/100?u=${post.userId}`} className="w-10 h-10 rounded-full" />
                    <div>
                       <div className="text-sm font-bold text-text-main">Developer #{post.userId.slice(-4)}</div>
                       <div className="text-[10px] text-text-muted">2 hours ago</div>
                    </div>
                 </div>
                 <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><MoreHorizontal size={20} /></button>
              </div>

              <div className="text-sm text-text-main leading-relaxed mb-6">
                 {post.content}
              </div>

              {/* Feed Image Simulation */}
              <div className="aspect-video bg-gray-100 rounded-xl mb-6 overflow-hidden">
                 <img src={`https://picsum.photos/seed/${post.id}/800/450`} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                 <button className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider">
                    <Heart size={18} /> {post.likes} Likes
                 </button>
                 <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider">
                    <MessageCircle size={18} /> {post.comments?.length || 0} Comments
                 </button>
                 <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider ml-auto">
                    <Share2 size={18} /> Share
                 </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Widgets / Sidebar */}
      <div className="w-full lg:w-72 space-y-6">
         <div className="riho-card">
            <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider">Who to follow</h3>
            <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                       <img src={`https://i.pravatar.cc/100?img=${i+5}`} className="w-8 h-8 rounded-full" />
                       <span className="text-xs font-bold text-text-main truncate">User {i}</span>
                    </div>
                    <button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-primary hover:text-white transition-all">
                       <UserPlus size={14} />
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
