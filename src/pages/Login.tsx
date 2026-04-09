import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, AlertCircle, User, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { loginWithEmail, isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 bg-blue-600 text-white text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
              <Stethoscope size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mdeka Health Tracker</h1>
              <p className="text-blue-100 text-sm">Secure access for health professionals</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
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
                <label className="text-sm font-semibold text-slate-700">Email / Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                  />
                </div>
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

            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                New user? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up for an account</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
