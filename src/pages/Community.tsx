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
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  Play,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  where,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, handleFirestoreError } from '../context/AuthContext';

interface Post {
  id: string;
  author: string;
  authorUsername: string;
  authorUid: string;
  clinicId: string;
  role: string;
  initial: string;
  content: string;
  timestamp: number;
  tags: string[];
  likes: number;
  comments: number;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function formatTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = React.useState('');
  const [selectedMedia, setSelectedMedia] = React.useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isPosting, setIsPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user || user.status !== 'APPROVED') {
      setPosts([]);
      return;
    }

    const postsRef = collection(db, 'posts');
    const q = user.role === 'SUPER_ADMIN'
      ? query(postsRef, orderBy('timestamp', 'desc'))
      : query(postsRef, where('clinicId', '==', user.clinicId), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsList);
    }, (error) => {
      if (error.message.includes('insufficient permissions')) {
        console.warn('Community posts subscription: Insufficient permissions.');
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file.');
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 31) {
          setError('Videos must be 30 seconds or shorter.');
          setSelectedMedia(null);
        }
      };
      video.src = URL.createObjectURL(file);
    }

    // Image compression/size check
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Check if still too large (Firestore limit is 1MB, but let's stay safe at 500KB)
          if (dataUrl.length > 800000) {
            setError('The image is too large. Please try a smaller file.');
            setSelectedMedia(null);
          } else {
            setSelectedMedia({
              type: 'image',
              url: dataUrl
            });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else if (isVideo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia({
          type: 'video',
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    if (!user) return;
    
    if (user.status !== 'APPROVED') {
      setError('Your account is pending approval. You cannot post yet.');
      return;
    }
    
    setIsPosting(true);
    setError(null);
    
    const newPostData = {
      author: user.name,
      authorUsername: user.username,
      authorUid: user.uid,
      clinicId: user.clinicId,
      role: user.role,
      initial: user.name.split(' ').map(n => n[0]).join(''),
      content: newPostContent,
      timestamp: Date.now(),
      tags: [],
      likes: 0,
      comments: 0,
      media: selectedMedia || null
    };

    try {
      await addDoc(collection(db, 'posts'), newPostData);
      setNewPostContent('');
      setSelectedMedia(null);
    } catch (error: any) {
      setError(`Failed to post: ${error.message || 'Unknown error'}`);
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

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
          {user?.status === 'PENDING' ? (
            <div className="bg-amber-50 p-12 rounded-3xl border border-amber-200 shadow-sm text-center">
              <Clock className="mx-auto text-amber-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Account Pending Approval</h3>
              <p className="text-amber-700">Your account is currently being reviewed by an administrator. You will be able to see and share posts once your account is approved.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
              <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                    {post.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{post.author}</h4>
                    <p className="text-xs text-slate-500 font-medium">{post.role} • {formatTime(post.timestamp)}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.uid === post.authorUid) && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>
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
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
                  >
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
        <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
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
        <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
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
        <div className="bg-blue-600 p-4 md:p-8 rounded-3xl text-white">
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
