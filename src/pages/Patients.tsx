import React from 'react';
import { usePatients, Patient, FollowUpRecord } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  MoreVertical,
  UserPlus,
  Calendar,
  MapPin,
  Phone,
  X,
  History,
  Stethoscope,
  Activity,
  HeartPulse,
  User,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const { patients, exportPatients, deletePatient } = usePatients();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const navigate = useNavigate();

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      (p.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                    {selectedPatient.name?.[0] || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-sm text-slate-500">Patient ID: #{selectedPatient.id.toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <Phone size={18} className="text-blue-500" />
                          <span className="text-sm font-medium">{selectedPatient.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <MapPin size={18} className="text-blue-500" />
                          <span className="text-sm font-medium">{selectedPatient.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <Calendar size={18} className="text-blue-500" />
                          <span className="text-sm font-medium">Age: {selectedPatient.age} • {selectedPatient.gender}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <Stethoscope size={18} className="text-purple-500" />
                          <span className="text-sm font-medium">{selectedPatient.department} ({selectedPatient.clinic})</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <Activity size={18} className="text-emerald-500" />
                          <span className="text-sm font-medium">Status: {selectedPatient.status}</span>
                        </div>
                        {selectedPatient.department === 'NCD' && (
                          <>
                            <div className="flex items-center gap-3 text-slate-600">
                              <HeartPulse size={18} className="text-pink-500" />
                              <span className="text-sm font-medium">BP: {selectedPatient.bpMeasurement || 'Not recorded'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                              <User size={18} className="text-indigo-500" />
                              <span className="text-sm font-medium">NCD ID: {selectedPatient.ncdRegNumber || 'Not recorded'}</span>
                            </div>
                          </>
                        )}
                        {selectedPatient.assignedCHW && (
                          <div className="flex items-center gap-3 text-slate-600">
                            <Users size={18} className="text-orange-500" />
                            <span className="text-sm font-medium">Assigned CHW: {selectedPatient.assignedCHW}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <History size={18} className="text-blue-600" /> Follow-up History
                      </h3>
                      <div className="space-y-4">
                        {!selectedPatient.followUps || selectedPatient.followUps.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-slate-400 text-sm italic">No follow-up records found for this patient.</p>
                          </div>
                        ) : (
                          selectedPatient.followUps.map((record) => (
                            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                  record.status === 'Missed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium">{record.notes}</p>
                              <p className="text-[10px] text-slate-400">Officer: {record.officer}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Allergies</p>
                        <p className="text-sm font-semibold text-red-900">{selectedPatient.allergies || 'None reported'}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Medications</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedPatient.medications || 'None reported'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center gap-3">
                <div className="flex-1">
                  {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                    <button 
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to permanently delete patient ${selectedPatient.name}?`)) {
                          await deletePatient(selectedPatient.id);
                          setSelectedPatient(null);
                        }
                      }}
                      className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Trash2 size={18} /> Delete Patient
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setSelectedPatient(null);
                    navigate('/new-follow-up', { state: { patientId: selectedPatient.id } });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Schedule Follow-up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-slate-500">Manage and view all registered patients in the system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportPatients}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => navigate('/add-patient')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <UserPlus size={18} /> Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone, or clinic..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              {['All', 'Normal', 'At Risk', 'Critical'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === status 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-400 font-medium ml-2">
              Showing {filteredPatients.length} patients
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No patients found matching your search.</p>
                      <button 
                        onClick={() => navigate('/add-patient')}
                        className="text-blue-600 text-sm font-bold hover:underline"
                      >
                        Register a new patient
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, i) => (
                  <motion.tr 
                    key={patient.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-lg">
                          {patient.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> Age: {patient.age}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                          {patient.department}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium ml-1">
                          {patient.clinic}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {patient.phone}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                          <MapPin size={14} className="text-slate-300" /> {patient.address.substring(0, 20)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          patient.status === 'Critical' ? 'bg-red-500' :
                          patient.status === 'At Risk' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                        <span className="text-xs font-bold text-slate-600">{patient.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete patient ${patient.name}?`)) {
                                deletePatient(patient.id);
                              }
                            }}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                            title="Delete Patient"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Download size={24} />
          </div>
          <div>
            <p className="font-bold text-blue-900">Need a physical copy of your data?</p>
            <p className="text-sm text-blue-700">You can export your entire patient directory to a CSV file at any time.</p>
          </div>
        </div>
        <button 
          onClick={exportPatients}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Download Data File
        </button>
      </div>
    </div>
  );
}
