import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  Users, 
  Calendar, 
  ShieldCheck,
  CheckCircle2,
  Heart,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePatients } from '../context/PatientContext';

const features = [
  {
    title: 'Patient Dashboard',
    description: 'Real-time monitoring of patient health metrics and history.',
    icon: Activity,
    color: 'bg-blue-500',
    path: '/dashboard'
  },
  {
    title: 'Community Health',
    description: 'Connect with other health professionals and share insights.',
    icon: Users,
    color: 'bg-emerald-500',
    path: '/community'
  },
  {
    title: 'Resource Library',
    description: 'Access clinical guidelines, training materials, and toolkits for all staff.',
    icon: BookOpen,
    color: 'bg-orange-500',
    path: '/library'
  },
  {
    title: 'Secure Records',
    description: 'Encrypted and compliant storage for all medical data.',
    icon: ShieldCheck,
    color: 'bg-purple-500',
    path: '/admin'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { patients } = usePatients();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-600 p-12 text-white">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium"
          >
            <Heart size={16} className="text-blue-200" />
            <span>Welcome to Mdeka Demo Tracker</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold tracking-tight leading-tight"
          >
            Modern Healthcare <br />
            <span className="text-blue-200">Simplified for Everyone.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-blue-100 max-w-lg"
          >
            Manage patients, track health metrics, and coordinate care with our all-in-one health tracking system.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link 
              to="/add-patient" 
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link 
              to="/register-ncd" 
              className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-400 transition-colors flex items-center gap-2 shadow-lg shadow-pink-200"
            >
              NCD Registration
            </Link>
            <Link 
              to="/dashboard" 
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-colors"
            >
              View Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Activity className="w-full h-full" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: patients.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/patients' },
          { label: 'Appointments Today', value: '42', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/appointments' },
          { label: 'Active Doctors', value: '18', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', path: '/community' },
          { label: 'Avg. Wait Time', value: '12m', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', path: '/dashboard' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(stat.path)}
          >
            <div className={stat.bg + " w-12 h-12 rounded-xl flex items-center justify-center mb-4"}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Care Management</h2>
          <p className="text-slate-500">Everything you need to run a modern clinic and provide the best patient care experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all hover:shadow-xl"
            >
              <div className={feature.color + " w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform"}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">{feature.description}</p>
              <Link 
                to={feature.path} 
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
              >
                Learn more <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="text-blue-600" /> Recent Updates
          </h3>
          <div className="space-y-6">
            <p className="text-slate-500 text-sm text-center py-8">No recent updates yet.</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" /> Quick Tasks
          </h3>
          <div className="space-y-4">
            {[
              { text: 'Review pending lab results', path: '/dashboard' },
              { text: 'Approve 5 new appointment requests', path: '/appointments' },
              { text: 'Update community health guidelines', path: '/community' },
              { text: 'Check inventory for Clinic A', path: '/admin' }
            ].map((task, i) => (
              <div 
                key={i} 
                onClick={() => navigate(task.path)}
                className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
