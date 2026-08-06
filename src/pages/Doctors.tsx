import React from 'react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { 
  Stethoscope, 
  Search, 
  Mail, 
  MapPin, 
  Shield, 
  PhoneCall, 
  User, 
  MessageSquare,
  Building,
  Activity,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Doctors() {
  const { allUsers, user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = React.useState<UserProfile | null>(null);

  // Filter users to get only Clinical/Doctors and system Admins
  const allStaff = allUsers.filter(u => u.status === 'APPROVED' && (u.role === 'CLINICAL' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'));
  
  // Refine filter for "Doctors" which are primarily of role CLINICAL (or administrators)
  const doctors = allStaff.filter(doc => {
    // Search filter
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.clinic.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = selectedRoleFilter === 'ALL' || doc.role === selectedRoleFilter;
    
    return matchesSearch && matchesRole;
  });

  const clinicalStaffCount = allStaff.filter(u => u.role === 'CLINICAL').length;
  const adminStaffCount = allStaff.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;

  return (
    <div className="space-y-8" id="doctors-page-root">
      {/* Banner / Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-md text-white">
        <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
            <Stethoscope size={14} className="animate-pulse" />
            Healthcare Directory
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Consult Available Clinical Officers & Doctors
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Connect with certified clinicians, medical specialists, and administrative facility leads registered at the <span className="font-semibold text-white">{user?.clinic || 'MDEKA'} Facility network</span>. Enable rapid, multi-disciplinary patient referrals and secure consultations.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Stethoscope size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Clinical Officers</span>
            <span className="text-2xl font-extrabold text-slate-900">{clinicalStaffCount}</span>
            <span className="text-xs text-slate-500 block">Available for consultations</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Facility Admins</span>
            <span className="text-2xl font-extrabold text-slate-900">{adminStaffCount}</span>
            <span className="text-xs text-slate-500 block">Managing facility operations</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Your Connected Clinic</span>
            <span className="text-base font-extrabold text-slate-900 truncate block max-w-[200px]">{user?.clinic || 'Not Specified'}</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Directory Filters & Tools */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400"
            id="doctor-directory-search-input"
          />
        </div>

        {/* Filter Radio Buttons */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto shrink-0 justify-start md:justify-end items-center">
          {[
            { id: 'ALL', label: 'All Staff' },
            { id: 'CLINICAL', label: 'Clinicians' },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'SUPER_ADMIN', label: 'Super Admins' }
          ].map((tab) => (
            <label
              key={tab.id}
              className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <input
                type="radio"
                name="roleFilter"
                value={tab.id}
                checked={selectedRoleFilter === tab.id}
                onChange={() => setSelectedRoleFilter(tab.id)}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              {tab.label}
            </label>
          ))}
        </div>
      </div>

      {/* Grid of Clinicians */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No practitioners found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search criteria, clearing search text, or choosing a different staff filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRoleFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc, idx) => {
            const initials = doc.name.split(' ').map(n => n[0]).join('');
            const isSelf = doc.uid === user?.uid;
            
            return (
              <motion.div
                key={doc.uid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between group"
                id={`doctor-card-${doc.uid}`}
              >
                {/* Visual Top Decorative Accent */}
                <div className={`h-1.5 w-full ${
                  doc.role === 'CLINICAL' 
                    ? 'bg-emerald-500' 
                    : doc.role === 'SUPER_ADMIN' 
                      ? 'bg-indigo-600' 
                      : 'bg-blue-600'
                }`} />

                {/* Profile Header Block */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Rounded Initial Circle */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 border uppercase shadow-sm ${
                      doc.role === 'CLINICAL' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : doc.role === 'SUPER_ADMIN' 
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm md:text-base tracking-tight truncate block group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-extrabold rounded-md uppercase tracking-wider shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs text-slate-400 block tracking-tight truncate mt-0.5">
                        @{doc.username}
                      </span>
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        {doc.clinic || 'Malawi Community Facility'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs truncate text-slate-500 hover:text-blue-600 cursor-pointer">
                        {doc.email || 'no-email@mdeka.org'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Badge and Action Buttons footer */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-100 mt-auto">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider truncate shrink-0 ${
                    doc.role === 'CLINICAL' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : doc.role === 'SUPER_ADMIN' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {doc.role === 'CLINICAL' ? 'Clinician' : doc.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                  </span>

                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 duration-200 transition-transform"
                    id={`view-profile-btn-${doc.uid}`}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Practitioner Consulting Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
              id="clinical-profile-modal-container"
            >
              {/* Modal Cover Header Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />

              {/* Close button */}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                id="close-profile-modal-btn"
              >
                <X Icon={selectedDoctor} size={16} />
              </button>

              <div className="p-8">
                {/* Profile Overview Card */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm flex items-center justify-center text-xl font-extrabold">
                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{selectedDoctor.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">@{selectedDoctor.username}</p>
                    
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-lg mt-3 uppercase tracking-wider">
                      {selectedDoctor.role === 'CLINICAL' ? 'Clinician / Practitioner' : selectedDoctor.role === 'SUPER_ADMIN' ? 'Super Facility Administrator' : 'Facility Administrator'}
                    </span>
                  </div>
                </div>

                {/* Practitioner Details Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 p-4 rounded-2xl flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Center</span>
                    <span className="text-xs font-bold text-slate-800 mt-1.5 truncate">
                      {selectedDoctor.clinic || 'Malawi Health Facility'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Contact</span>
                    <span className="text-xs font-bold text-slate-800 mt-1.5 truncate">
                      {selectedDoctor.email || 'no-email@mdeka.org'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex flex-col col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practice Scope</span>
                    <span className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                      {selectedDoctor.role === 'CLINICAL' 
                        ? 'Authorized community health visits, NCD clinical screening, blood pressure monitoring, diabetes therapeutics, and hospital intake referrals.' 
                        : 'System wide facilities governance, clinic registry validations, administrative auditing logs, security policy declarations, and staff onboarding check.'
                      }
                    </span>
                  </div>
                </div>

                {/* Contact Actions Footer */}
                <div className="flex gap-3 mt-8">
                  <a
                    href={`mailto:${selectedDoctor.email || 'no-email@mdeka.org'}?subject=Clinical consultation request&body=Hi ${selectedDoctor.name}, I would like to consult on a patient.`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-sm"
                    id="email-clinical-consult-btn"
                  >
                    <Mail size={16} />
                    Send Email Referral
                  </a>

                  <button
                    onClick={() => {
                      alert(`Consultation session initiated with ${selectedDoctor.name}. Standard notification ping sent to facilities inbox.`);
                      setSelectedDoctor(null);
                    }}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition shadow-sm"
                    id="ping-clinical-consult-btn"
                  >
                    <MessageSquare size={16} />
                    Consult
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// X icon workaround as Close icon
function X({ Icon, size }: { Icon: any; size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
