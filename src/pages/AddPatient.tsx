import React from 'react';
import { 
  UserPlus, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

export default function AddPatient() {
  const { patients, addPatient } = usePatients();
  const { allUsers, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    age: '',
    gender: 'Male',
    department: 'General',
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

  // Automatically suggest CHW for Malaria cases
  React.useEffect(() => {
    if (formData.department === 'Malaria' && !formData.assignedCHW) {
      // 1. Check if a patient with same phone exists (already assigned CHW)
      const existingPatient = patients.find(p => p.phone === formData.phone && p.assignedCHW);
      if (existingPatient) {
        setFormData(prev => ({ ...prev, assignedCHW: existingPatient.assignedCHW }));
        return;
      }

      // 2. If current user is a CHW, suggest them
      if (user?.role === 'CHW') {
        setFormData(prev => ({ ...prev, assignedCHW: user.name }));
      } else if (formData.sector) {
        // 3. Suggest CHW from same sector
        const suggested = chws.find(c => c.clinic === formData.sector);
        if (suggested) {
          setFormData(prev => ({ ...prev, assignedCHW: suggested.name }));
        }
      }
    }
  }, [formData.department, formData.sector, formData.phone, user?.role, user?.name, chws.length, patients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      addPatient(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        department: 'General',
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
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Patient</h1>
          <p className="text-slate-500">Register a new patient into the Mdeka Health system.</p>
        </div>
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <UserPlus size={24} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
            <User size={16} /> Personal Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Age</label>
              <input 
                required
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="e.g. 25"
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department / Case Type</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              >
                <option value="General">General Clinic</option>
                <option value="NCD">NCD (Non-Communicable Diseases)</option>
                <option value="Epilepsy">Epilepsy Clinic</option>
                <option value="Malaria">Malaria Positive</option>
                <option value="UnderFive">Under Five Vaccinated Children</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sector / Area</label>
              <input 
                type="text" 
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                placeholder="e.g. Sector 4" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {formData.department === 'NCD' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6 mb-8">
                <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-xs">
                  <HeartPulse size={16} /> NCD Specific Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">NCD Registration Number</label>
                    <input 
                      type="text" 
                      value={formData.ncdRegNumber}
                      onChange={(e) => setFormData({...formData, ncdRegNumber: e.target.value})}
                      placeholder="e.g. NCD-2024-001" 
                      className="w-full px-4 py-3 bg-white border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Blood Pressure (BP) Measurement</label>
                    <div className="relative">
                      <HeartPulse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.bpMeasurement}
                        onChange={(e) => setFormData({...formData, bpMeasurement: e.target.value})}
                        placeholder="e.g. 120/80" 
                        className="w-full pl-12 pr-4 py-3 bg-white border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`p-8 rounded-3xl border shadow-sm space-y-6 transition-all duration-500 ${
          formData.department === 'Malaria' 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${
            formData.department === 'Malaria' ? 'text-orange-600' : 'text-blue-600'
          }`}>
            <MapPin size={16} /> {formData.department === 'Malaria' ? 'Home Follow-up Assignment (Malaria Case)' : 'Care Coordination'}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${
                formData.department === 'Malaria' ? 'text-orange-800' : 'text-slate-700'
              }`}>
                Assign Community Health Worker (CHW)
              </label>
              <select 
                value={formData.assignedCHW}
                onChange={(e) => setFormData({...formData, assignedCHW: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl focus:ring-0 transition-all ${
                  formData.department === 'Malaria' 
                    ? 'bg-white border-orange-200 focus:border-orange-500' 
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'
                }`}
              >
                <option value="">Select CHW...</option>
                {chws.map(chw => (
                  <option key={chw.username} value={chw.name}>
                    {chw.name} {chw.clinic === formData.sector ? '(Suggested - Same Sector)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {formData.department === 'Malaria' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-orange-800">Follow-up Priority</label>
                  <select className="w-full px-4 py-3 bg-white border-orange-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all">
                    <option>High (Home visit within 24h)</option>
                    <option>Medium (Home visit within 48h)</option>
                    <option>Routine</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {formData.department === 'Malaria' && (
            <p className="text-xs text-orange-700 italic">
              Note: Malaria positive cases require a mandatory home address verification and follow-up assignment.
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
            <Phone size={16} /> Contact Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Home Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 text-slate-400" size={18} />
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address, City, State, Zip" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs">
            <HeartPulse size={16} /> Medical History & Notes
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Known Allergies</label>
              <input 
                type="text" 
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                placeholder="e.g. Penicillin, Peanuts (leave blank if none)" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Current Medications</label>
              <textarea 
                rows={2}
                value={formData.medications}
                onChange={(e) => setFormData({...formData, medications: e.target.value})}
                placeholder="List any medications the patient is currently taking" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Medical Documents</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (max. 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button 
            type="button"
            className="px-8 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                Register Patient <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Message */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold">Patient Registered!</p>
              <p className="text-sm text-emerald-100">The patient has been added to the system.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
