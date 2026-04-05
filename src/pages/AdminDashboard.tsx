import React from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Database, 
  Lock, 
  Activity,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { pendingUsers, approveUser, rejectUser, allUsers } = useAuth();
  const [userSearch, setUserSearch] = React.useState('');

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">System management, security, and administrative controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white border border-slate-200 rounded-xl text-slate-500 transition-colors shadow-sm">
            <Settings size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-lg transition-all">
            <ShieldCheck size={20} /> Security Audit
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'System Uptime', value: '99.9%', status: 'Healthy', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Users', value: '42', status: '+4 today', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Database Load', value: '24%', status: 'Optimal', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Security Alerts', value: '0', status: 'Secure', icon: Lock, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={stat.bg + " w-10 h-10 rounded-lg flex items-center justify-center " + stat.color}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded-md text-slate-500">Live</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-emerald-600">{stat.status}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Approvals */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending User Approvals</h3>
                <p className="text-xs text-slate-500 font-medium">New staff members waiting for system access.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{pendingUsers.length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested Role</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinic Assignment</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium">
                      No pending registration requests.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-semibold text-slate-600">{user.role}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {user.clinic}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => approveUser(user.username)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectUser(user.username)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">User Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-48 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'CHW' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs text-slate-500">{user.clinic || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={user.status === 'APPROVED' ? "w-2 h-2 bg-emerald-500 rounded-full" : "w-2 h-2 bg-amber-500 rounded-full"}></div>
                        <span className="text-xs font-medium text-slate-600">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-emerald-400" size={20} /> System Logs
            </h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">View All</button>
          </div>
          <div className="space-y-4 font-mono text-xs">
            {[
              { type: 'info', msg: 'Database backup completed successfully', time: '12:45:02' },
              { type: 'warn', msg: 'High latency detected in Clinic A node', time: '12:42:15' },
              { type: 'info', msg: 'New admin user registered: Mike Ross', time: '12:38:44' },
              { type: 'error', msg: 'Failed login attempt from IP 192.168.1.1', time: '12:35:10' },
              { type: 'info', msg: 'System update v2.4.1 deployed', time: '12:30:00' },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-500">[{log.time}]</span>
                <span className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warn' ? 'text-amber-400' : 
                  'text-emerald-400'
                }>{log.type.toUpperCase()}</span>
                <span className="text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <p className="text-sm font-medium text-emerald-100">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-8">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Two-Factor Auth', desc: 'Require 2FA for all administrative accounts.', enabled: true },
            { title: 'Session Timeout', desc: 'Automatically log out users after 30 mins of inactivity.', enabled: true },
            { title: 'IP Whitelisting', desc: 'Restrict access to known clinic IP addresses.', enabled: false },
            { title: 'Data Encryption', desc: 'AES-256 encryption for all patient records.', enabled: true },
            { title: 'Audit Logging', desc: 'Detailed logs for every data access event.', enabled: true },
            { title: 'Automatic Backups', desc: 'Daily encrypted backups to secure cloud storage.', enabled: true },
          ].map((setting, i) => (
            <div key={i} className="flex items-start justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">{setting.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{setting.desc}</p>
              </div>
              <button className={
                "w-12 h-6 rounded-full transition-all relative shrink-0 " +
                (setting.enabled ? "bg-blue-600" : "bg-slate-200")
              }>
                <div className={
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all " +
                  (setting.enabled ? "right-1" : "left-1")
                }></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
