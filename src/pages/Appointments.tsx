import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Users, 
  Clock, 
  MapPin, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Stethoscope
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Appointments() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    patientName: '',
    patientId: '',
    patientPhone: '',
    patientAddress: '',
    appointmentDate: '',
    appointmentTime: '',
    clinicType: 'General',
    doctorName: '',
    assignCHW: false,
    chwId: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Scheduling appointment:', formData);
    navigate('/follow-up'); // Redirecting to follow-up list as requested or similar
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
          <h1 className="text-3xl font-bold text-slate-900">Schedule Appointment</h1>
          <p className="text-slate-500">Register a patient for a new clinic visit or home follow-up.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Details */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Patient & Person Details
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Enter patient's full name"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+265..."
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                value={formData.patientPhone}
                onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Home Address / Village</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Mdeka Village, Sector 4"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.patientAddress}
                  onChange={(e) => setFormData({...formData, patientAddress: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} /> Appointment Schedule
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Clinic Type</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                value={formData.clinicType}
                onChange={(e) => setFormData({...formData, clinicType: e.target.value})}
              >
                <option>General Outpatient</option>
                <option>NCD Clinic</option>
                <option>Epilepsy Clinic</option>
                <option>Malaria Positive</option>
                <option>Under Five Clinic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Assigned Doctor</label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                >
                  <option value="">Select a doctor...</option>
                  <option>Dr. Athilo</option>
                  <option>Dr. Jane</option>
                  <option>Nurse Grace</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Time</label>
              <input 
                required
                type="time" 
                className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* CHW Assignment */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600" size={20} /> Community Health Worker Assignment
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.assignCHW}
                onChange={(e) => setFormData({...formData, assignCHW: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <label className="text-sm font-semibold text-slate-700">Select CHW for Follow-up</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full pl-12 pr-4 py-3 bg-white border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all"
                      value={formData.chwId}
                      onChange={(e) => setFormData({...formData, chwId: e.target.value})}
                    >
                      <option value="">Select a CHW...</option>
                      <option value="1">Officer John Mdeka</option>
                      <option value="2">Officer Sarah Phiri</option>
                      <option value="3">Officer Banda</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-blue-100/50 rounded-2xl text-blue-800 text-sm gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>The assigned CHW will be notified to visit the patient at their home address for follow-up.</p>
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
            <CheckCircle2 size={18} /> Confirm Appointment
          </button>
        </div>
      </form>
    </div>
  );
}
