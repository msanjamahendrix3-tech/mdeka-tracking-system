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
  ThumbsUp
} from 'lucide-react';
import { motion } from 'motion/react';

const posts = [
  {
    id: 1,
    author: 'Dr. Athilo',
    role: 'Chief Medical Officer',
    content: 'Just published a new guide on managing hypertension in rural communities. Check it out in the resources section!',
    time: '2 hours ago',
    likes: 24,
    comments: 5,
    tags: ['Hypertension', 'CommunityHealth'],
    initial: 'AT'
  },
  {
    id: 2,
    author: 'Sarah Jenkins',
    role: 'Health Coordinator',
    content: 'The community outreach program in Clinic B was a huge success today. We reached over 50 families!',
    time: '5 hours ago',
    likes: 42,
    comments: 12,
    tags: ['Outreach', 'Success'],
    initial: 'SJ'
  },
  {
    id: 3,
    author: 'Dr. Jane Smith',
    role: 'Pediatrician',
    content: 'Reminder: The annual vaccination drive starts next Monday. Please ensure all staff are briefed on the new protocols.',
    time: '1 day ago',
    likes: 18,
    comments: 3,
    tags: ['Vaccination', 'StaffNotice'],
    initial: 'JS'
  }
];

export default function Community() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Dashboard</h1>
            <p className="text-slate-500">Connect, share, and collaborate with health professionals.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <Plus size={20} /> Create Post
          </button>
        </div>

        {/* Create Post Input */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              AT
            </div>
            <textarea 
              placeholder="What's on your mind, Dr. Athilo?" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              rows={3}
            ></textarea>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium">
                <Share2 size={18} className="text-blue-500" /> Photo/Video
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium">
                <Award size={18} className="text-amber-500" /> Achievement
              </button>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
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

              <p className="text-slate-700 leading-relaxed text-lg">
                {post.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>

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
          ))}
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
            {[
              { tag: 'COVID-19 Updates', posts: '1.2k' },
              { tag: 'Rural Healthcare', posts: '850' },
              { tag: 'Mental Health Awareness', posts: '640' },
              { tag: 'Vaccination Drive', posts: '420' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">#{item.tag}</p>
                  <p className="text-xs text-slate-500">{item.posts} posts this week</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-amber-500" /> Top Contributors
          </h3>
          <div className="space-y-6">
            {[
              { name: 'Dr. Athilo', points: '2,480', initial: 'AT' },
              { name: 'Sarah Jenkins', points: '1,920', initial: 'SJ' },
              { name: 'Dr. Jane Smith', points: '1,540', initial: 'JS' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                  {item.initial}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.points} points</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xs font-bold">
                  {i + 1}
                </div>
              </div>
            ))}
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
