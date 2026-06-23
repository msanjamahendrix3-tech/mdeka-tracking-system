import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, AlertCircle, User, Lock, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import hospitalLogo from '../assets/images/hospital_logo_1779218652866.png';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showForgotModal, setShowForgotModal] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetStatus, setResetStatus] = React.useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const { loginWithEmail, requestPasswordReset, isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const handleSuperAdminLogin = () => {
    setEmail('msanjamahendrix3@gmail.com');
    setPassword('');
    // Focus password field
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) passwordInput.focus();
  };

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
      const result = await loginWithEmail(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(resetEmail);
      if (result.success) {
        setResetStatus({ type: 'success', msg: result.message || 'Request submitted successfully.' });
      } else {
        setResetStatus({ type: 'error', msg: result.message || 'Failed to submit request.' });
      }
    } catch (err) {
      setResetStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-8 bg-blue-600 text-white text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto bg-slate-900 shadow-lg border border-slate-800">
              <img 
                src={hospitalLogo} 
                alt="Hospital Tracking System Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HOSPITAL TRACKING SYSTEM</h1>
              <p className="text-blue-100 text-sm">Secure access for health professionals</p>
            </div>
          </div>

          <div className="p-4 md:p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      id="email"
                      name="email"
                      required
                      type="email" 
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      id="password"
                      name="password"
                      required
                      type={showPassword ? "text" : "password"} 
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
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

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">Remember me</label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <button 
              type="button"
              onClick={handleSuperAdminLogin}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
            >
              <Lock size={18} />
              Super Admin Quick Login
            </button>

            <div className="text-center pt-4 border-t border-slate-100 space-y-4">
              <p className="text-sm text-slate-500">
                New user? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up for an account</Link>
              </p>
              <p className="text-xs text-slate-500">
                Hospital or Clinic? <Link to="/register-clinic" className="text-blue-600 font-bold hover:underline">Register your facility</Link>
              </p>
              
              <div className="pt-4 mt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 mb-2 font-medium">FIX CONNECTION ISSUES</p>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        for (let name of names) caches.delete(name);
                      });
                    }
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(regs => {
                        for (let reg of regs) reg.unregister();
                      });
                    }
                    window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
                  }}
                  className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors font-bold"
                >
                  NUCLEAR RESET (FIX WHITE SCREEN/AUTH)
                </button>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by</p>
                <p className="text-xs font-bold text-slate-600">HASTINGS MSANJAMA</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-4 md:p-8 relative"
            >
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setResetStatus(null);
                  setResetEmail('');
                }}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Forgot Password?</h3>
                  <p className="text-sm text-slate-500">
                    Enter your email to request a password reset approval from your clinic administrator.
                  </p>
                </div>

                {resetStatus && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                    resetStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {resetStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {resetStatus.msg}
                  </div>
                )}

                {!resetStatus?.type || resetStatus.type === 'error' ? (
                  <form onSubmit={handleResetRequest} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Work Email</label>
                      <input 
                        required
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Submitting...' : 'Request Reset Approval'}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Got it
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
