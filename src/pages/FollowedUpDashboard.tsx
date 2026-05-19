import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Image as ImageIcon, 
  FileText, 
  Pill, 
  ClipboardCheck, 
  Search, 
  Calendar, 
  X, 
  Activity, 
  Filter,
  User,
  Eye,
  Thermometer,
  ShieldAlert,
  MapPin,
  ClipboardList,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePatients, Patient, FollowUpRecord } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FlattenedFollowUp {
  patientId: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientAddress: string;
  patientClinic: string;
  patientStatus: 'Normal' | 'At Risk' | 'Critical';
  followUp: FollowUpRecord;
}

export default function FollowedUpDashboard() {
  const { patients } = usePatients();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedChw, setSelectedChw] = React.useState('All');
  const [selectedStatus, setSelectedStatus] = React.useState('All');
  const [selectedFollowUp, setSelectedFollowUp] = React.useState<FlattenedFollowUp | null>(null);

  // Flatten all completed followups with patient context
  const allFollowUps: FlattenedFollowUp[] = React.useMemo(() => {
    const list: FlattenedFollowUp[] = [];
    patients.forEach(p => {
      if (p.followUps) {
        p.followUps.forEach(f => {
          if (f.status === 'Completed') {
            list.push({
              patientId: p.id,
              patientName: p.name,
              patientAge: p.age,
              patientGender: p.gender,
              patientAddress: p.address,
              patientClinic: p.clinic,
              patientStatus: p.status,
              followUp: f
            });
          }
        });
      }
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.followUp.date).getTime() - new Date(a.followUp.date).getTime());
  }, [patients]);

  // Filter based on user's role:
  // - If CHW: Only see their own follow-ups
  // - If ADMIN / SUPER_ADMIN / CLINICAL: See all
  const roleFilteredFollowUps = React.useMemo(() => {
    if (user?.role === 'CHW') {
      return allFollowUps.filter(item => item.followUp.officer === user?.name);
    }
    return allFollowUps;
  }, [allFollowUps, user]);

  // List of unique CHWs for the filter drop-down (only relevant for Admins/Clinicians)
  const uniqueChws = React.useMemo(() => {
    const set = new Set<string>();
    allFollowUps.forEach(item => {
      if (item.followUp.officer) set.add(item.followUp.officer);
    });
    return Array.from(set);
  }, [allFollowUps]);

  // Final filtered list based on search and filters
  const filteredFollowUps = React.useMemo(() => {
    return roleFilteredFollowUps.filter(item => {
      const matchSearch = 
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.followUp.opdNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.followUp.medications?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.followUp.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchChw = selectedChw === 'All' || item.followUp.officer === selectedChw;
      const matchStatus = selectedStatus === 'All' || item.patientStatus === selectedStatus;

      return matchSearch && matchChw && matchStatus;
    });
  }, [roleFilteredFollowUps, searchTerm, selectedChw, selectedStatus]);

  const exportAssessments = () => {
    if (filteredFollowUps.length === 0) return;
    
    const headers = [
      'Patient ID', 'Patient Name', 'Age', 'Gender', 'Address', 'Clinic', 'Status',
      'Assigned Officer (CHW)', 'Visit Date', 'OPD Number', 'Temperature', 'Blood Pressure',
      'Medications', 'Symptoms', 'Clinical Notes', 'Photo URL'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredFollowUps.map(item => [
        item.patientId,
        `"${item.patientName}"`,
        item.patientAge,
        item.patientGender,
        `"${item.patientAddress}"`,
        item.patientClinic,
        item.patientStatus,
        `"${item.followUp.officer}"`,
        item.followUp.date,
        `"${item.followUp.opdNumber || ''}"`,
        `"${item.followUp.temperature || ''}"`,
        `"${item.followUp.bloodPressure || ''}"`,
        `"${(item.followUp.medications || '').replace(/"/g, '""')}"`,
        `"${(item.followUp.symptoms || '').replace(/"/g, '""')}"`,
        `"${item.followUp.notes.replace(/"/g, '""')}"`,
        item.followUp.photoUrl || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Key stats
  const stats = React.useMemo(() => {
    const total = roleFilteredFollowUps.length;
    const withPhotos = roleFilteredFollowUps.filter(item => !!item.followUp.photoUrl).length;
    const atRisk = roleFilteredFollowUps.filter(item => item.patientStatus === 'At Risk' || item.patientStatus === 'Critical').length;
    
    // Average body temperature
    const temps = roleFilteredFollowUps
      .map(item => parseFloat(item.followUp.temperature || ''))
      .filter(t => !isNaN(t));
    const avgTemp = temps.length > 0 ? (temps.reduce((sum, val) => sum + val, 0) / temps.length).toFixed(1) : '—';

    return { total, withPhotos, atRisk, avgTemp };
  }, [roleFilteredFollowUps]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Follow-Up Dashboard</h1>
          <p className="text-slate-500">
            {user?.role === 'CHW' 
              ? `Review your completed field visits and recorded assessments, ${user?.name}.` 
              : 'Monitor completed home health visits, view recorded medications, OPD clinical logs, and CHW attachments.'}
          </p>
        </div>
        {filteredFollowUps.length > 0 && (
          <button 
            onClick={exportAssessments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
          >
            <Download size={18} /> Export Assessments CSV
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Completed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">With Attachments</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.withPhotos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">At Risk/Critical</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.atRisk}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Temperature</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.avgTemp === '—' ? '—' : `${stats.avgTemp}°C`}</p>
          </div>
        </div>
      </div>

      {/* Filters and search panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by patient, OPD, medications or clinical notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="All">All Health Status</option>
                <option value="Normal">Normal</option>
                <option value="At Risk">At Risk</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* CHW filter - hide from CHWs since they only see themselves */}
            {user?.role !== 'CHW' && (
              <select
                value={selectedChw}
                onChange={(e) => setSelectedChw(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="All">All Health Workers</option>
                {uniqueChws.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> Finished Assessments
          </h3>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100/60">
            {filteredFollowUps.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Visit Date</th>
                <th className="py-4 px-6">OPD Number</th>
                <th className="py-4 px-6">Vitals</th>
                <th className="py-4 px-6">Medications</th>
                <th className="py-4 px-6">Assigned Officer</th>
                <th className="py-4 px-6">Attachment</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFollowUps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-2 opacity-20" size={40} />
                    <p className="text-sm font-semibold">No finished follow-up assessments found.</p>
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600 text-sm">
                          {item.patientName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.patientName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.patientAge} yrs • {item.patientGender}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              item.patientStatus === 'Normal' 
                                ? 'bg-blue-50 text-blue-700' 
                                : item.patientStatus === 'At Risk' 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {item.patientStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                      {new Date(item.followUp.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-sm font-mono text-slate-700">
                      {item.followUp.opdNumber || <span className="text-slate-300 font-sans text-xs">—</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                          <Thermometer size={12} className="text-orange-500" /> {item.followUp.temperature ? `${item.followUp.temperature}°C` : '—'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Activity size={12} className="text-blue-500" /> {item.followUp.bloodPressure || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-700 font-semibold max-w-[150px] truncate leading-normal flex items-center gap-1">
                        <Pill size={12} className="text-teal-600 inline shrink-0" />
                        <span>{item.followUp.medications || <span className="text-slate-300">—</span>}</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-700 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        <span>{item.followUp.officer}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.followUp.photoUrl ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <div className="w-6 h-6 rounded-lg overflow-hidden border border-emerald-200">
                            <img 
                              src={item.followUp.photoUrl} 
                              alt="Attachment preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span>Photo</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedFollowUp(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-out / Modal Drawer */}
      <AnimatePresence>
        {selectedFollowUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg h-full rounded-l-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Visit Record Detail</h4>
                  <p className="text-xs text-slate-500">Conducted, completed & archived</p>
                </div>
                <button
                  onClick={() => setSelectedFollowUp(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Patient Overview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white">
                      {selectedFollowUp.patientName[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">{selectedFollowUp.patientName}</h5>
                      <p className="text-xs text-slate-500">{selectedFollowUp.patientAge} years old • {selectedFollowUp.patientGender}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200/60 text-slate-600">
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">CLINIC / DEPT</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedFollowUp.patientClinic}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">PATIENT STATUS</p>
                      <span className={`inline-block font-bold mt-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        selectedFollowUp.patientStatus === 'Normal' 
                          ? 'bg-blue-100 text-blue-700' 
                          : selectedFollowUp.patientStatus === 'At Risk' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {selectedFollowUp.patientStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs pt-1 flex items-start gap-1">
                    <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600">{selectedFollowUp.patientAddress}</span>
                  </div>
                </div>

                {/* Visit Metadata */}
                <div className="grid grid-cols-2 gap-4 text-slate-700">
                  <div className="p-4 rounded-2xl border border-slate-150 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OPD Number</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">
                      {selectedFollowUp.followUp.opdNumber || 'Not recorded'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-150 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visit Officer</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {selectedFollowUp.followUp.officer}
                    </p>
                  </div>
                </div>

                {/* Vitals Detail */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Vitals</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-orange-600 font-bold">Temperature</span>
                        <p className="text-lg font-extrabold text-orange-950 mt-1">
                          {selectedFollowUp.followUp.temperature ? `${selectedFollowUp.followUp.temperature}°C` : '—'}
                        </p>
                      </div>
                      <Thermometer className="text-orange-500" size={24} />
                    </div>
                    <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-blue-600 font-bold">Blood Pressure</span>
                        <p className="text-lg font-extrabold text-blue-950 mt-1">
                          {selectedFollowUp.followUp.bloodPressure || '—'}
                        </p>
                      </div>
                      <Activity className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className="p-4 rounded-2xl border border-slate-150 bg-white shadow-sm space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-teal-700">
                    <Pill size={11} /> Current or Previous Medications
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {selectedFollowUp.followUp.medications || 'No specific medication reported.'}
                  </p>
                </div>

                {/* Symptoms & Notes */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Symptoms</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-normal">
                      {selectedFollowUp.followUp.symptoms || 'No active symptoms reported during home assessment.'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes & Comments</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-normal">
                      {selectedFollowUp.followUp.notes || 'No general notes recorded.'}
                    </p>
                  </div>
                </div>

                {/* Captured Photo Attachment (Optional) */}
                {selectedFollowUp.followUp.photoUrl && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon size={14} className="text-slate-500" /> Patient / Assessment Photo Attachment
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-slate-200">
                      <img 
                        src={selectedFollowUp.followUp.photoUrl} 
                        alt="Evidence Assessment" 
                        className="w-full h-48 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {selectedFollowUp.followUp.photoComment && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs italic text-slate-600">
                        <span className="font-bold text-slate-700 not-italic block mb-0.5">Photo Comment:</span>
                        "{selectedFollowUp.followUp.photoComment}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
