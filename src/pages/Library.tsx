import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  Search, 
  Stethoscope, 
  Users, 
  HeartPulse,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'Video' | 'Guide' | 'Link';
  category: 'Nurse' | 'Clinician' | 'CHW' | 'General';
  tags: string[];
  url: string;
}

const resources: Resource[] = [
  // Clinician Resources
  {
    id: 'clin-1',
    title: 'Malaria Treatment Guidelines 2024',
    description: 'Updated protocols for treating uncomplicated and severe malaria in adults and children.',
    type: 'PDF',
    category: 'Clinician',
    tags: ['Malaria', 'Treatment', 'Protocol'],
    url: 'https://www.who.int/publications/i/item/9789240045125'
  },
  {
    id: 'clin-2',
    title: 'NCD Management Handbook',
    description: 'Comprehensive guide for managing hypertension, diabetes, and other non-communicable diseases.',
    type: 'Guide',
    category: 'Clinician',
    tags: ['NCD', 'Chronic Care', 'Hypertension'],
    url: 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases'
  },
  {
    id: 'clin-3',
    title: 'Clinical Decision Support: Epilepsy',
    description: 'Diagnostic criteria and medication management for epilepsy patients.',
    type: 'Guide',
    category: 'Clinician',
    tags: ['Epilepsy', 'Neurology', 'Diagnosis'],
    url: 'https://www.who.int/news-room/fact-sheets/detail/epilepsy'
  },
  
  // Nurse Resources
  {
    id: 'nurse-1',
    title: 'Advanced Wound Care Techniques',
    description: 'Step-by-step guide on managing chronic wounds and surgical incisions.',
    type: 'Video',
    category: 'Nurse',
    tags: ['Wound Care', 'Nursing', 'Procedure'],
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK470193/'
  },
  {
    id: 'nurse-2',
    title: 'Medication Administration Safety',
    description: 'Best practices for safe drug delivery and avoiding medication errors.',
    type: 'PDF',
    category: 'Nurse',
    tags: ['Safety', 'Medication', 'Nursing'],
    url: 'https://www.who.int/teams/integrated-health-services/patient-safety/research/medication-safety'
  },
  {
    id: 'nurse-3',
    title: 'Pediatric Vital Signs Chart',
    description: 'Quick reference for normal vital sign ranges by age group.',
    type: 'PDF',
    category: 'Nurse',
    tags: ['Pediatrics', 'Vitals', 'Reference'],
    url: 'https://www.unicef.org/health'
  },

  // CHW Resources
  {
    id: 'chw-1',
    title: 'Community Outreach Toolkit',
    description: 'Strategies for effective health education and community engagement.',
    type: 'Guide',
    category: 'CHW',
    tags: ['Outreach', 'Education', 'Community'],
    url: 'https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/quality-of-care/community-engagement'
  },
  {
    id: 'chw-2',
    title: 'Home Visit Checklist',
    description: 'Standardized checklist for conducting effective home health visits.',
    type: 'PDF',
    category: 'CHW',
    tags: ['Home Visit', 'Checklist', 'Reporting'],
    url: 'https://chwcentral.org/resources/'
  },
  {
    id: 'chw-3',
    title: 'Recognizing Danger Signs in Pregnancy',
    description: 'Visual guide for CHWs to identify and refer high-risk pregnancies.',
    type: 'Video',
    category: 'CHW',
    tags: ['Maternal Health', 'Pregnancy', 'Emergency'],
    url: 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality'
  },

  // General Resources
  {
    id: 'gen-1',
    title: 'Mdeka Health App User Manual',
    description: 'Complete guide on how to use all features of the health tracker application.',
    type: 'Guide',
    category: 'General',
    tags: ['App', 'Manual', 'Help'],
    url: 'https://github.com/hastings-msanjama/mdeka-health'
  },
  {
    id: 'gen-2',
    title: 'Infection Prevention & Control',
    description: 'Standard precautions for all healthcare workers to prevent hospital-acquired infections.',
    type: 'PDF',
    category: 'General',
    tags: ['IPC', 'Safety', 'Hygiene'],
    url: 'https://www.who.int/teams/integrated-health-services/infection-prevention-control'
  }
];

export default function Library() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<'All' | 'Nurse' | 'Clinician' | 'CHW' | 'General'>('All');

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { name: 'All', icon: BookOpen },
    { name: 'Clinician', icon: Stethoscope },
    { name: 'Nurse', icon: HeartPulse },
    { name: 'CHW', icon: Users },
    { name: 'General', icon: Info },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Library</h1>
          <p className="text-slate-500">Access clinical guidelines, training materials, and toolkits.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resources, tags, or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeCategory === cat.name 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <cat.icon size={18} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    resource.type === 'PDF' ? 'bg-red-50 text-red-600' :
                    resource.type === 'Video' ? 'bg-blue-50 text-blue-600' :
                    resource.type === 'Guide' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {resource.type === 'PDF' ? <FileText size={24} /> :
                     resource.type === 'Video' ? <Video size={24} /> :
                     resource.type === 'Guide' ? <BookOpen size={24} /> :
                     <ExternalLink size={24} />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                    {resource.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {resource.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  resource.category === 'Clinician' ? 'bg-blue-100 text-blue-700' :
                  resource.category === 'Nurse' ? 'bg-purple-100 text-purple-700' :
                  resource.category === 'CHW' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {resource.category}
                </span>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:gap-2 transition-all cursor-pointer"
                >
                  View Resource <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>

      {/* Suggested for You Section */}
      <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">Need specific training?</h2>
            <p className="text-blue-100 opacity-90">
              We are constantly updating our library. If you need specific resources or training materials for your clinic, let your administrator know.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg">
            Request Resource
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
}
