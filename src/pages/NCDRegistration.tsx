import React from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  HeartPulse,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

export default function NCDRegistration() {
  const { addPatient } = usePatients();
  const { allUsers } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    age: '',
    gender: 'Male',
    department: 'NCD',
    phone: '',
    email: '',
    address: '',
    sector: '',
    allergies: '',
    medications: '',
    assignedCHW: '',
    ncdRegNumber: '',
    bpMeasurement: ''
  });

  const chws = allUsers.filter(u => u.role === 'CHW' && u.status === 'APPROVED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await addPatient(formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        department: 'NCD',
        phone: '',
        email: '',
        address: '',
        sector: '',
        allergies: '',
        medications: '',
        assignedCHW: '',
        ncdRegNumber: '',
        bpMeasurement: ''
      });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to register NCD patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">NCD Registration</h1>
          <p className="text-slate-500 mt-1">Register a new patient for the Non-Communicable Diseases clinic.</p>
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
          <HeartPulse size={32} />
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-medium"
          >
            <CheckCircle2 size={20} />
            Patient successfully registered for NCD clinic!
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-medium"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-pink-600 font-bold uppercase tracking-wider text-xs">
            <User size={16} /> Basic Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Patient Name" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-0 transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Age" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-0 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-0 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* NCD Specific Details */}
        <div className="bg-pink-50 p-8 rounded-3xl border border-pink-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-pink-700 font-bold uppercase tracking-wider text-xs">
            <HeartPulse size={16} /> Heart & Chronic Metrics
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">NCD Registration Number</label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={formData.ncdRegNumber}
                  onChange={(e) => setFormData({...formData, ncdRegNumber: e.target.value})}
                  placeholder="e.g. NCD-BL-1234" 
                  className="w-full pl-12 pr-4 py-3 bg-white border-pink-200 rounded-xl focus:border-pink-500 focus:ring-0 transition-all font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Current BP Measurement</label>
              <div className="relative">
                <HeartPulse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={formData.bpMeasurement}
                  onChange={(e) => setFormData({...formData, bpMeasurement: e.target.value})}
                  placeholder="e.g. 130/85" 
                  className="w-full pl-12 pr-4 py-3 bg-white border-pink-200 rounded-xl focus:border-pink-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
            <Phone size={16} /> Contact & Demographics
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Contact Number" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Residential Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street, Village, Area" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className={`flex-1 py-4 px-8 rounded-2xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
              isLoading ? 'bg-pink-400 cursor-wait' : 'bg-pink-600 hover:bg-pink-700 active:scale-95 shadow-pink-200'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <UserPlus size={24} />
            )}
            Complete NCD Registration
          </button>
        </div>
      </form>
    </div>
  );
}
