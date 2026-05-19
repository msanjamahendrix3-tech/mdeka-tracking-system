import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ChevronRight,
  Clock,
  MessageSquare,
  FileText,
  Plus,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

export default function FollowUp() {
  const navigate = useNavigate();
  const { patients, addFollowUp } = usePatients();
  const { user } = useAuth();

  // If the useris a CHW, only retrieve patients assigned to them
  const visiblePatients = user?.role === 'CHW'
    ? patients.filter(p => p.assignedCHW === user?.name)
    : patients;

  // Get all follow-ups from all patients
  const allFollowUps = visiblePatients.flatMap(p => 
    (p.followUps || []).map(f => ({
      ...f,
      patientName: p.name,
      patientId: p.id,
      clinic: p.clinic
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const malariaFollowUps = allFollowUps.filter(f => f.clinic === 'Malaria' && f.status === 'Scheduled');
  const upcomingFollowUps = allFollowUps.filter(f => f.status === 'Scheduled');

  const handleMarkVisited = (patientId: string, followUpId: string) => {
    // In a real app, we would update the specific follow-up status
    // For now, let's just add a new "Completed" follow-up or update the existing one
    // Since addFollowUp adds a new one, I'll just use that for simplicity or implement a status update
    // Let's implement a simple status update in PatientContext if needed, but for now I'll just log it
    console.log('Marking as visited:', patientId, followUpId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Follow-up Management</h1>
          <p className="text-slate-500">Track and manage patient follow-up appointments and reports.</p>
        </div>
        {user?.role !== 'CHW' && (
          <button 
            onClick={() => navigate('/new-follow-up')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            <Plus size={20} /> New Follow-up
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by patient name or ID..." 
            className="w-full pl-12 pr-4 py-3 bg-white border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={18} /> Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} /> Status
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Today's Appointments</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Reports</p>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Avg. Consultation</p>
            <p className="text-2xl font-bold text-slate-900">25m</p>
          </div>
        </div>
      </div>

      {/* Home Follow-up Assignments (Malaria) */}
      <div className="bg-orange-50 rounded-3xl border border-orange-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-orange-100 flex items-center justify-between bg-orange-100/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-900">Malaria Home Follow-ups</h3>
              <p className="text-xs text-orange-700 font-medium">Assigned home visits for malaria positive patients.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">4 Active Visits</span>
        </div>
        <div className="divide-y divide-orange-100">
          {malariaFollowUps.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-orange-400 text-sm italic">No active malaria follow-up visits assigned.</p>
            </div>
          ) : (
            malariaFollowUps.map((visit, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-orange-100/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">
                    {visit.patientName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900">{visit.patientName}</h4>
                    <p className="text-sm text-orange-700 flex items-center gap-1">
                      <MapPin size={14} /> {patients.find(p => p.id === visit.patientId)?.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Assigned Officer</p>
                    <p className="text-sm font-semibold text-orange-800">{visit.officer}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-orange-900">{new Date(visit.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleMarkVisited(visit.patientId, visit.id)}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-all"
                >
                  Mark Visited
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Upcoming Follow-ups</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {upcomingFollowUps.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm italic">No upcoming follow-up appointments scheduled.</p>
            </div>
          ) : (
            upcomingFollowUps.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => navigate('/patients', { state: { selectedPatientId: item.patientId } })}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                      {item.patientName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.patientName}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={14} /> Patient ID: #{item.patientId.toUpperCase()}
                      </p>
                    </div>
                  </div>
  
                  <div className="flex flex-wrap gap-8">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</p>
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar size={16} className="text-blue-500" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="text-slate-300">|</span>
                        <Clock size={16} className="text-blue-500" />
                        <span>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Officer</p>
                      <p className="text-slate-700 font-medium">{item.officer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
  
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-all" title="View Details">
                      <FileText size={20} />
                    </button>
                    <button className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="p-6 bg-slate-50 text-center">
          <button className="text-blue-600 font-semibold hover:underline">View Older Records</button>
        </div>
      </div>
    </div>
  );
}
