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

export default function AddPatient() {
  const { addPatient } = usePatients();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    dob: '',
    gender: 'Male',
    clinic: 'General',
    phone: '',
    email: '',
    address: '',
    allergies: '',
    medications: ''
  });

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
        dob: '',
        gender: 'Male',
        clinic: 'General',
        phone: '',
        email: '',
        address: '',
        allergies: '',
        medications: ''
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
              <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
              <input 
                required
                type="date" 
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
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
              <label className="text-sm font-semibold text-slate-700">Clinic / Department</label>
              <select 
                value={formData.clinic}
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
              >
                <option value="General">General Clinic</option>
                <option value="NCD">NCD (Non-Communicable Diseases)</option>
                <option value="Epilepsy">Epilepsy Clinic</option>
                <option value="Malaria">Malaria Positive</option>
                <option value="UnderFive">Under Five Vaccinated Children</option>
              </select>
            </div>
          </div>
        </div>

        {/* Malaria Follow-up Assignment */}
        <AnimatePresence>
          {formData.clinic === 'Malaria' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-orange-50 p-8 rounded-3xl border border-orange-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-wider text-xs">
                  <MapPin size={16} /> Home Follow-up Assignment (Malaria Case)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-orange-800">Assign Follow-up Officer</label>
                    <select className="w-full px-4 py-3 bg-white border-orange-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all">
                      <option>Select Officer...</option>
                      <option>Officer John Mdeka</option>
                      <option>Officer Sarah Phiri</option>
                      <option>Officer Mike Banda</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-orange-800">Follow-up Priority</label>
                    <select className="w-full px-4 py-3 bg-white border-orange-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all">
                      <option>High (Home visit within 24h)</option>
                      <option>Medium (Home visit within 48h)</option>
                      <option>Routine</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-orange-700 italic">
                  Note: Malaria positive cases require a mandatory home address verification and follow-up assignment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
