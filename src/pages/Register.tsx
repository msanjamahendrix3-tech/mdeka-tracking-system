import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole, Clinic } from '../context/AuthContext';
import { Stethoscope, User, UserPlus, Building2, ArrowLeft, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    username: '',
    name: '',
    role: 'CLINICAL' as UserRole,
    clinic: '',
    clinicId: '',
    clinicCode: '',
    clinicAddress: ''
  });
  const [error, setError] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [availableClinics, setAvailableClinics] = React.useState<Clinic[]>([]);
  const { registerWithEmail, getPublicClinics, isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchClinics = async () => {
      try {
        const clinics = await getPublicClinics();
        setAvailableClinics(clinics || []);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        setError('Could not connect to Health Center list. Please check your internet.');
      }
    };
    fetchClinics();
  }, [getPublicClinics]);

  React.useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isAuthReady, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { email: rawEmail, password, ...profileData } = formData;
      const email = rawEmail.trim().toLowerCase();
      
      let clinicDataPayload = undefined;
      
      if (formData.role === 'ADMIN') {
        if (!formData.clinic) {
          setError('Clinic name is required.');
          setIsLoading(false);
          return;
        }
        // Generate a reliable 6-digit numeric code
        const charset = '0123456789';
        let clinicCode = '';
        for (let i = 0; i < 6; i++) {
          clinicCode += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        clinicDataPayload = {
          name: formData.clinic,
          address: formData.clinicAddress,
          code: clinicCode
        };
      } else {
        // Staff joining clinic
        if (!formData.clinicId) {
          setError('Please select your Health Center/Clinic from the menu.');
          setIsLoading(false);
          return;
        }
        if (!formData.clinicCode) {
          setError('Staff Join Code is required.');
          setIsLoading(false);
          return;
        }

        const selectedClinic = availableClinics.find(c => c.id === formData.clinicId);
        if (!selectedClinic) {
          setError('Selected clinic not found. Please refresh and try again.');
          setIsLoading(false);
          return;
        }

        // Verify the code matches exactly for THIS clinic
        if (selectedClinic.code !== formData.clinicCode) {
          setError('Invalid Join Code for the selected Health Center. Please check with your administrator.');
          setIsLoading(false);
          return;
        }

        profileData.clinicId = selectedClinic.id;
        profileData.clinic = selectedClinic.name;
      }

      const result = await registerWithEmail(email, password, profileData, clinicDataPayload);
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        // Specifically check for permission denied errors which might indicate rules or config issues
        if (result.message?.includes('insufficient permissions')) {
          setError('Security check failed. Please ensure your clinic configuration is correct or contact HASTINGS MSANJAMA.');
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Submit handle error:', err);
      setError(err.message || 'An unexpected error occurred. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500">Your account for <span className="font-bold text-slate-700">{formData.name}</span> has been sent for admin approval.</p>
          </div>
          <p className="text-sm text-slate-400">You will be able to log in once an administrator approves your request. This usually takes less than 24 hours.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 bg-blue-600 text-white space-y-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> Back to Login
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <UserPlus size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                <p className="text-blue-100 text-sm">Join the Mdeka Health network</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com" 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="johndoe123" 
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Role / Position</label>
                <select 
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                >
                  <option value="CLINICAL">Nurse / Clinician / Doctor</option>
                  <option value="CHW">Community Health Worker</option>
                  <option value="ADMIN">Clinic Owner / Manager (New Clinic)</option>
                </select>
              </div>

              {formData.role === 'ADMIN' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New Clinic Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.clinic}
                        onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                        placeholder="e.g. Mdeka Health Centre" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Location / Address</label>
                    <input 
                      required
                      type="text" 
                      value={formData.clinicAddress}
                      onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                      placeholder="e.g. Blantyre, Malawi" 
                      className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Select Health Center</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        required
                        value={formData.clinicId}
                        onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-medium appearance-none"
                      >
                        <option value="">Choose a Facility...</option>
                        {availableClinics.map(clinic => (
                          <option key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {availableClinics.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-medium">
                        No facilities found. Please wait or register a new one.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Staff Join Code</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.clinicCode}
                        onChange={(e) => setFormData({...formData, clinicCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                        placeholder="Enter 6-digit number" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-mono tracking-widest text-lg"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic">Enter the 6-digit numeric code provided by your Health Center admin.</p>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <Stethoscope className="text-blue-600 shrink-0" size={20} />
              <p className="text-xs text-blue-800 leading-relaxed">
                By creating an account, you are requesting access to the Mdeka Health Tracker. Your account will be secured with your email and password.
              </p>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
            </p>
            <p className="text-xs text-slate-400">
              Need to register a new facility? <Link to="/register-clinic" className="text-blue-600 font-bold hover:underline">Register Clinic/Hospital</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
