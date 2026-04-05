import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function CHWDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CHW Field Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.name}. Here are your assigned home visits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Active in Field
          </div>
        </div>
      </div>

      {/* CHW Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <MapPin size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Assigned Visits</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">8</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Completed Today</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">3</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">High Priority</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">2</p>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Today's Home Visits</h3>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View Map</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { name: 'John Doe', address: '123 Mdeka Village, Sector 4', priority: 'High', time: '10:30 AM', status: 'Pending' },
            { name: 'Mary Phiri', address: '45 Hillside Road, Sector 2', priority: 'Medium', time: '01:00 PM', status: 'Pending' },
            { name: 'Samuel Banda', address: 'Sector 1, Near Market', priority: 'Routine', time: '03:30 PM', status: 'Pending' },
          ].map((visit, i) => (
            <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                  {visit.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{visit.name}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={14} /> {visit.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Time</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-blue-500" /> {visit.time}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                  <span className={
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase " +
                    (visit.priority === 'High' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")
                  }>
                    {visit.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                  Start Visit
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" /> Community Trends
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm font-bold text-emerald-400">Malaria Alert</p>
              <p className="text-xs text-slate-400 mt-1">Increased cases reported in Sector 4. Advise use of bed nets.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm font-bold text-blue-400">Vaccination Drive</p>
              <p className="text-xs text-slate-400 mt-1">Under-five clinic scheduled for this Friday at the community center.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="text-blue-600" /> Team Communication
          </h3>
          <div className="space-y-4">
            {[
              { from: 'Dr. Athilo', msg: 'Please verify the home address for John Doe.', time: '10m ago' },
              { from: 'Nurse Grace', msg: 'New follow-up assigned for Sector 2.', time: '1h ago' },
            ].map((msg, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                  {msg.from[0]}
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none flex-1">
                  <p className="text-xs font-bold text-slate-900">{msg.from}</p>
                  <p className="text-xs text-slate-600 mt-1">{msg.msg}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
