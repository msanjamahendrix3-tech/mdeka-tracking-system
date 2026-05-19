import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function NewFollowUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patients, addFollowUp } = usePatients();
  const { allUsers } = useAuth();
  
  const initialPatientId = location.state?.patientId || '';
  const initialPatient = patients.find(p => p.id === initialPatientId);

  const [formData, setFormData] = React.useState({
    patientId: initialPatientId,
    patientName: initialPatient?.name || '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:00',
    reason: '',
    priority: 'Medium',
    notes: '',
    assignCHW: !!initialPatient?.assignedCHW,
    chwName: initialPatient?.assignedCHW || ''
  });

  const chws = allUsers.filter(u => u.role === 'CHW' && u.status === 'APPROVED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetPatientId = formData.patientId;
    if (!targetPatientId) {
      // Find patient by name if ID not set
      const patient = patients.find(p => (p.name || '').toLowerCase() === (formData.patientName || '').toLowerCase());
      if (patient) {
        targetPatientId = patient.id;
      } else {
        alert('Patient not found. Please select a valid patient.');
        return;
      }
    }

    addFollowUp(
      targetPatientId, 
      {
        date: `${formData.followUpDate}T${formData.followUpTime}:00Z`,
        officer: formData.chwName || 'Clinic Staff',
        status: 'Scheduled',
        notes: formData.reason + (formData.notes ? ': ' + formData.notes : '')
      },
      formData.assignCHW ? formData.chwName : undefined
    );

    navigate('/follow-up');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Follow-up</h1>
          <p className="text-slate-500">Schedule a post-consultation checkup for a patient.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Patient Information
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Patient Name / ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Search or enter patient name"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Priority Level</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} /> Schedule Details
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Follow-up Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preferred Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="time" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.followUpTime}
                  onChange={(e) => setFormData({...formData, followUpTime: e.target.value})}
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reason for Follow-up</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  required
                  rows={3}
                  placeholder="e.g., Post-malaria recovery check, medication adjustment..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-blue-600" size={20} /> Community Assignment
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.assignCHW}
                onChange={(e) => setFormData({...formData, assignCHW: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-slate-700">Assign CHW</span>
            </label>
          </div>
          {formData.assignCHW && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-8 bg-blue-50/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Community Health Worker</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full pl-12 pr-4 py-3 bg-white border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all"
                      value={formData.chwName}
                      onChange={(e) => setFormData({...formData, chwName: e.target.value})}
                    >
                      <option value="">Select an officer...</option>
                      {chws.map(chw => (
                        <option key={chw.username} value={chw.name}>{chw.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-blue-100/50 rounded-2xl text-blue-800 text-sm gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>Assigning a CHW will automatically notify them and add this visit to their field dashboard.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={18} /> Schedule Follow-up
          </button>
        </div>
      </form>
    </div>
  );
}
