import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  ShieldCheck,
  HeartPulse,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePatients } from '../context/PatientContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { patients } = usePatients();

  const healthMetrics = [
    { name: 'Normal', value: patients.filter(p => p.status === 'Normal').length, color: '#3b82f6' },
    { name: 'At Risk', value: patients.filter(p => p.status === 'At Risk').length, color: '#f59e0b' },
    { name: 'Critical', value: patients.filter(p => p.status === 'Critical').length, color: '#ef4444' },
  ];

  const clinicStats = [
    { label: 'NCD Clinic', value: patients.filter(p => (p.department || p.clinic) === 'NCD').length.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Epilepsy Clinic', value: patients.filter(p => (p.department || p.clinic) === 'Epilepsy').length.toString(), icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Malaria Positive', value: patients.filter(p => (p.department || p.clinic) === 'Malaria').length.toString(), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Under Five (Vaccinated)', value: patients.filter(p => (p.department || p.clinic) === 'UnderFive').length.toString(), icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  // Group patients by month for the line chart
  const last7Months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();

  const patientGrowthData = last7Months.map(month => ({
    name: month,
    patients: patients.filter(p => {
      if (!p.registeredAt) return false;
      try {
        return new Date(p.registeredAt).toLocaleString('default', { month: 'short' }) === month;
      } catch (e) {
        return false;
      }
    }).length
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-500">Real-time health analytics and patient monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate('/patients')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} /> +{patients.length > 0 ? '100%' : '0%'}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active Patients</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{patients.length}</p>
        </div>

        <div 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate('/appointments')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Calendar size={24} />
            </div>
            <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} /> +0%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">New Appointments</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Activity size={24} />
            </div>
            <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
              {patients.length > 0 ? '85%' : '0%'}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Health Index</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{patients.length > 0 ? '85%' : '0%'}</p>
        </div>
      </div>

      {/* Clinic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clinicStats.map((clinic, i) => (
          <motion.div 
            key={clinic.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div className={clinic.bg + " w-10 h-10 rounded-xl flex items-center justify-center " + clinic.color}>
              <clinic.icon size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{clinic.label}</p>
              <p className="text-xl font-bold text-slate-900">{clinic.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Patient Growth</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-600 focus:ring-0">
              <option>Last 7 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientGrowthData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPatients)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Health Status Distribution</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <p className="text-3xl font-bold text-slate-900">{patients.length}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {healthMetrics.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Patients</h3>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">
                    No recent patients found.
                  </td>
                </tr>
              ) : (
                patients.slice(0, 5).map((patient, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                          {patient.name[0]}
                        </div>
                        <span className="font-semibold text-slate-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        patient.status === 'Critical' ? 'bg-red-100 text-red-600' :
                        patient.status === 'At Risk' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">{new Date(patient.registeredAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-sm text-slate-500">{patient.clinic}</td>
                    <td className="px-8 py-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
