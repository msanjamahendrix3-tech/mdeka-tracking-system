import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  ClipboardCheck,
  Thermometer,
  Activity,
  Save,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

export default function StartVisit() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, addFollowUp } = usePatients();
  const { user } = useAuth();
  
  const patient = patients.find(p => p.id === patientId);
  
  const [formData, setFormData] = React.useState({
    temperature: '',
    bloodPressure: '',
    symptoms: '',
    notes: '',
    status: 'Completed' as const
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!patient) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <AlertCircle size={48} className="text-slate-300" />
        <p className="text-slate-500 font-medium">Patient not found.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 font-bold hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const visitNotes = `Vitals: Temp: ${formData.temperature}°C, BP: ${formData.bloodPressure}. Symptoms: ${formData.symptoms}. Notes: ${formData.notes}`;
    
    addFollowUp(patient.id, {
      date: new Date().toISOString(),
      officer: user?.name || 'Unknown CHW',
      notes: visitNotes,
      status: 'Completed'
    });
    
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Home Visit Session</h1>
          <p className="text-slate-500">Recording visit for <span className="font-bold text-slate-700">{patient.name}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Session Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xl">
                {patient.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-500">{patient.age} years • {patient.gender}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Home Address</p>
                  <p className="text-sm text-slate-700">{patient.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allergies</p>
                  <p className="text-sm text-slate-700">{patient.allergies || 'None reported'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClipboardCheck size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Medications</p>
                  <p className="text-sm text-slate-700">{patient.medications || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Activity size={18} /> Visit Protocol
            </h4>
            <ul className="text-xs space-y-2 text-blue-100 list-disc pl-4">
              <li>Introduce yourself and verify patient identity</li>
              <li>Wash hands before any physical assessment</li>
              <li>Check temperature and record vitals</li>
              <li>Inquire about current symptoms and medication adherence</li>
              <li>Provide health education based on clinic type</li>
            </ul>
          </div>
        </div>

        {/* Visit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" /> Visit Assessment
              </h3>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" /> Body Temperature (°C)
                  </label>
                  <input 
                    required
                    type="number" 
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    placeholder="e.g. 36.5" 
                    className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> Blood Pressure
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                    placeholder="e.g. 120/80" 
                    className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Reported Symptoms</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe any symptoms the patient is experiencing..." 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>

              {/* General Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">General Observations & Notes</label>
                <textarea 
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional observations, advice given, or follow-up needs..." 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>

              {/* Status */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Visit Status</p>
                    <p className="text-xs text-emerald-700">Marking this visit as completed</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-full">
                  Completed
                </span>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                disabled={isSubmitting}
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Visit...
                  </>
                ) : (
                  <>
                    Complete Home Visit <Save size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
