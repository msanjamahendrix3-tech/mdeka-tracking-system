import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  Hospital, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Building2,
  TreePine,
  Map,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function RegisterClinic() {
  const navigate = useNavigate();
  const { registerWithEmail } = useAuth();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    hospitalName: '',
    village: '',
    ta: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const email = formData.email.trim().toLowerCase();
      
      const clinicDataPayload = {
        name: formData.hospitalName,
        address: `${formData.village}, ${formData.ta}`,
        village: formData.village,
        ta: formData.ta,
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      };

      const result = await registerWithEmail(
        email, 
        formData.password, 
        {
          name: formData.name,
          username: email.split('@')[0],
          role: 'ADMIN' as any,
          clinic: formData.hospitalName,
          clinicId: 'TEMP', // Will be replaced by AuthContext
        },
        clinicDataPayload
      );

      if (result.success) {
        setIsSubmitted(true);
      } else {
        if (result.message?.includes('insufficient permissions')) {
          setError('Security check failed. Please contact HASTINGS MSANJAMA for assistance.');
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Clinic registration error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinic Registered!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your clinic application has been submitted successfully. 
            <strong> Please wait for the system administrator to approve your account.</strong>
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            Go to Login <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Branding Side */}
      <div className="md:w-1/3 bg-blue-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md mb-8">
            <Hospital size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">Mdeka Health</h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-sm">
            Empowering Health Clinics and Hospitals with advanced digital tracking and community outreach tools.
          </p>
        </div>

        <div className="relative z-10 pt-12 md:pt-0">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Owner Access</p>
                <p className="text-xs text-blue-200">Full administrative control over your clinic.</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Powered by</p>
            <p className="text-sm font-bold">HASTINGS MSANJAMA</p>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 p-8 md:p-24 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Clinic Registration</h2>
            <p className="text-slate-500 font-medium">Create a new hospital or health clinic profile.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Personal Details</label>
              
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>

              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Professional Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>

              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Secure Password"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Clinic Information</label>
              
              <div className="relative group">
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="Hospital / Clinic Name"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <input
                    type="text"
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  <TreePine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    name="ta"
                    required
                    value={formData.ta}
                    onChange={handleChange}
                    placeholder="T/A"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                isLoading && "animate-pulse"
              )}
            >
              {isLoading ? 'Processing Request...' : 'Register Clinic'}
              <ArrowRight size={20} />
            </button>

            <div className="flex flex-col gap-4 text-center mt-8">
              <p className="text-sm text-slate-500">
                Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
              </p>
              <div className="pt-8 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-tight">
                  Independent Clinical Environment
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                  By registering, you are establishing a new digital health environment. Each clinic manages its own staff and patient records.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
