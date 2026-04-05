import React from 'react';
import { usePatients } from '../context/PatientContext';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  MoreVertical,
  UserPlus,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const { patients, exportPatients } = usePatients();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.clinic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
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
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-lg">
                          {patient.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> DOB: {patient.dob}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {patient.clinic}
                      </span>
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
                      <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 transition-all">
                        <MoreVertical size={18} />
                      </button>
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
