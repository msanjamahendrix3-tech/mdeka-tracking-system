import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Heart, 
  Search, 
  TrendingUp, 
  Award,
  BookOpen,
  Plus,
  MoreVertical,
  ThumbsUp,
  Image as ImageIcon,
  Video,
  X,
  Play,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  author: string;
  authorUsername: string;
  role: string;
  initial: string;
  content: string;
  time: string;
  timestamp: number;
  tags: string[];
  likes: number;
  comments: number;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<Post[]>(() => {
    const saved = localStorage.getItem('mdeka_community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newPostContent, setNewPostContent] = React.useState('');
  const [selectedMedia, setSelectedMedia] = React.useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isPosting, setIsPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    localStorage.setItem('mdeka_community_posts', JSON.stringify(posts));
  }, [posts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file.');
      return;
    }

    // For videos, check duration (approximate check via metadata)
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 31) { // Allowing a small buffer
          setError('Videos must be 30 seconds or shorter.');
          setSelectedMedia(null);
        }
      };
      video.src = URL.createObjectURL(file);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia({
        type: isImage ? 'image' : 'video',
        url: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    
    setIsPosting(true);
    
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: user?.name || 'Anonymous',
      authorUsername: user?.username || 'anonymous',
      role: user?.role || 'User',
      initial: (user?.name || 'A').split(' ').map(n => n[0]).join(''),
      content: newPostContent,
      time: 'Just now',
      timestamp: Date.now(),
      tags: [],
      likes: 0,
      comments: 0,
      media: selectedMedia || undefined
    };

    // Simulate network delay
    setTimeout(() => {
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setSelectedMedia(null);
      setIsPosting(false);
    }, 800);
  };

  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Dashboard</h1>
            <p className="text-slate-500">Connect, share, and collaborate with health professionals.</p>
          </div>
        </div>

        {/* Create Post Input */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 border-2 border-white shadow-sm">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user?.name.split(' ')[0]}?`} 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-slate-700"
                rows={3}
              ></textarea>
              
              <AnimatePresence>
                {selectedMedia && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                  >
                    <button 
                      onClick={() => setSelectedMedia(null)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <X size={16} />
                    </button>
                    {selectedMedia.type === 'image' ? (
                      <img src={selectedMedia.url} alt="Selected" className="w-full max-h-96 object-cover" />
                    ) : (
                      <div className="relative aspect-video bg-black flex items-center justify-center">
                        <video src={selectedMedia.url} className="w-full h-full" controls />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded flex items-center gap-1">
                          <Clock size={10} /> 30s Max
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ImageIcon size={18} className="text-blue-500" /> Photo
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Video size={18} className="text-purple-500" /> Video
              </button>
            </div>
            <button 
              disabled={isPosting || (!newPostContent.trim() && !selectedMedia)}
              onClick={handleCreatePost}
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {sortedPosts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
              <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            sortedPosts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                    {post.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{post.author}</h4>
                    <p className="text-xs text-slate-500 font-medium">{post.role} • {post.time}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {post.content && (
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {post.content}
                  </p>
                )}
                
                {post.media && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                    {post.media.type === 'image' ? (
                      <img src={post.media.url} alt="Post media" className="w-full max-h-[500px] object-cover" />
                    ) : (
                      <div className="aspect-video bg-black flex items-center justify-center">
                        <video src={post.media.url} className="w-full h-full" controls />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                    <ThumbsUp size={20} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                    <MessageSquare size={20} /> {post.comments}
                  </button>
                </div>
                <button className="text-slate-500 hover:text-blue-600 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </motion.div>
          )))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Trending Topics */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Trending Topics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between group cursor-pointer">
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">#MalariaPrevention</p>
                <p className="text-xs text-slate-500">24 posts this week</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="flex items-center justify-between group cursor-pointer">
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">#CommunityHealth</p>
                <p className="text-xs text-slate-500">18 posts this week</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-amber-500" /> Top Contributors
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                GA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Grace Athilo</p>
                <p className="text-xs text-slate-500">42 contributions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                HB
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Hastings Banda</p>
                <p className="text-xs text-slate-500">38 contributions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-blue-600 p-8 rounded-3xl text-white">
          <BookOpen size={32} className="mb-4 text-blue-200" />
          <h3 className="text-xl font-bold mb-2">Medical Resources</h3>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Access our library of medical guides, research papers, and community protocols.
          </p>
          <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Browse Library
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function AlertCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
