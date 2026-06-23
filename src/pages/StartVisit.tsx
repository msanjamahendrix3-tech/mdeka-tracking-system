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
  User,
  Camera,
  Upload,
  Pill,
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

const FIELD_PHOTO_PRESETS = [
  'https://picsum.photos/seed/clinicconsult/600/400',
  'https://picsum.photos/seed/medicinebox/600/400',
  'https://picsum.photos/seed/patientvitals/600/400'
];

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
    opdNumber: '',
    medications: '',
    photoUrl: '',
    photoComment: '',
    status: 'Completed' as const
  });

  const [isCapturing, setIsCapturing] = React.useState(false);
  const [shutterFlash, setShutterFlash] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Prefill medications from existing patient records on load
  React.useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        medications: patient.medications || ''
      }));
    }
  }, [patient]);

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

  // Handle mock camera shutter trigger
  const handleSimulateCapture = () => {
    setIsCapturing(true);
    
    // Simulate shutter sound/flash
    setTimeout(() => {
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 200);
      
      // Select a random high-quality healthcare scene
      const randomIndex = Math.floor(Math.random() * FIELD_PHOTO_PRESETS.length);
      const url = `${FIELD_PHOTO_PRESETS[randomIndex]}?t=${Date.now()}`;
      
      setFormData(prev => ({
        ...prev,
        photoUrl: url
      }));
      setIsCapturing(false);
    }, 1000);
  };

  // Handle manual file upload (base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await addFollowUp(patient.id, {
      date: new Date().toISOString(),
      officer: user?.name || 'Unknown CHW',
      notes: formData.notes,
      status: 'Completed',
      opdNumber: formData.opdNumber || undefined,
      medications: formData.medications || undefined,
      symptoms: formData.symptoms || undefined,
      temperature: formData.temperature || undefined,
      bloodPressure: formData.bloodPressure || undefined,
      photoUrl: formData.photoUrl || undefined,
      photoComment: formData.photoComment || undefined
    });
    
    setIsSubmitting(false);
    navigate('/followed-up-dashboard'); // Redirect user to the followed up patients dashboard!
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      {/* Shutter flash screen overlay */}
      <AnimatePresence>
        {shutterFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Home Visit Session</h1>
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
              {patient.allergies && (
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allergies</p>
                    <p className="text-sm text-slate-700">{patient.allergies}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <ClipboardCheck size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Medications</p>
                  <p className="text-sm text-slate-700">{patient.medications || 'None specified'}</p>
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
              <li>Verify OPD registration and enter medication logs</li>
              <li>Provide health advice based on patient diagnosis</li>
            </ul>
          </div>
        </div>

        {/* Visit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" /> Visit Assessment
              </h3>
            </div>
            
            <div className="p-4 md:p-8 space-y-8">
              {/* OPD Number Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> Patient OPD Number
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.opdNumber}
                  onChange={(e) => setFormData({...formData, opdNumber: e.target.value})}
                  placeholder="e.g. OPD-2026-984A" 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-mono"
                />
                <p className="text-xs text-slate-400">Please provide the clinic Out-Patient Department register number.</p>
              </div>

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
                  rows={2}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe any active symptoms the patient is complaining about..." 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>

              {/* Currently or previous medications */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Pill size={16} className="text-teal-600" /> Current or Previous Medications
                </label>
                <textarea 
                  required
                  rows={2}
                  value={formData.medications}
                  onChange={(e) => setFormData({...formData, medications: e.target.value})}
                  placeholder="Record patient prescribed medication regimens, active dosages, or past meds..." 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>

              {/* General Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={16} className="text-slate-500" /> General Observations & Advice Given
                </label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional health worker observations, clinical counsel, or referrals etc..." 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                ></textarea>
              </div>

              {/* Camera & Photograph Section (Optional) */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={16} className="text-purple-600" /> Field Assessment Media <span className="text-[10px] text-slate-400 font-normal uppercase italic bg-slate-100 px-2 py-0.5 rounded">(Optional)</span>
                  </label>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photoUrl: '', photoComment: '' }))}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {!formData.photoUrl ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleSimulateCapture}
                      className="p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 transition-all flex flex-col items-center justify-center text-center gap-2 group bg-slate-50/50 hover:bg-blue-50/20"
                    >
                      <Camera size={28} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Simulate Visit Camera</p>
                        <p className="text-xs text-slate-500 mt-0.5">Mock high-resolution photo shutter</p>
                      </div>
                    </button>

                    <label className="p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group bg-slate-50/50 hover:bg-blue-50/20">
                      <Upload size={28} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Upload Clinical Photo</p>
                        <p className="text-xs text-slate-500 mt-0.5">Select a digital asset locally</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 flex bg-slate-900 justify-center">
                      <img 
                        src={formData.photoUrl} 
                        alt="Captured field context" 
                        className="max-h-64 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm">
                        Assessment Image Saved
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Photo Description / Comments (Optional)</label>
                      <input 
                        type="text"
                        value={formData.photoComment}
                        onChange={(e) => setFormData({...formData, photoComment: e.target.value})}
                        placeholder="e.g. Taking photo of the patient regimen tracker or prescription bottle..."
                        className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 text-xs transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status information footer */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Visit Status</p>
                    <p className="text-xs text-emerald-700">Form completion shifts patient to completed ledger.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-full">
                  Ready
                </span>
              </div>
            </div>

            <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                disabled={isSubmitting || isCapturing}
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-heavy rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Archiving Assessment...
                  </>
                ) : (
                  <>
                    Follow Up Done 📋
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
