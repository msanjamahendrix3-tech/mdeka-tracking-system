import React from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Database, 
  Lock, 
  Activity,
  Hospital,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
   XCircle,
   UserPlus,
   RefreshCw,
   Copy,
   Check,
   CreditCard,
   DollarSign,
   Trash2
 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth, Clinic } from '../context/AuthContext';

export default function AdminDashboard() {
  const { 
    user, 
    pendingUsers, 
    resetRequests,
    approveUser, 
    rejectUser, 
    deleteUser,
    updateClinicStatus,
    updateClinicSubscription,
    allUsers, 
    allClinics,
    approvePasswordReset,
    rejectPasswordReset,
    getClinicById,
    regenerateClinicCode,
    deleteClinic
  } = useAuth();
  const [userSearch, setUserSearch] = React.useState('');
  const [currentClinic, setCurrentClinic] = React.useState<Clinic | null>(null);
  const [isCopying, setIsCopying] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const enrichedResetRequests = resetRequests
    .filter(req => req.status === 'PENDING')
    .map(req => {
      const userProfile = allUsers.find(u => u.email === req.email);
      return {
        ...req,
        userName: userProfile?.name || 'Unknown User',
        userClinic: userProfile?.clinic || 'Unknown Clinic',
        userClinicId: userProfile?.clinicId || ''
      };
    })
    .filter(req => {
      if (user?.role === 'SUPER_ADMIN') return true;
      return req.userClinicId === user?.clinicId;
    });

  React.useEffect(() => {
    const fetchClinic = async () => {
      if (user?.clinicId && user.role !== 'SUPER_ADMIN') {
        const clinic = await getClinicById(user.clinicId);
        setCurrentClinic(clinic);
      }
    };
    fetchClinic();
  }, [user, getClinicById]);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase());
    
    if (user?.role === 'SUPER_ADMIN') return matchesSearch;
    return matchesSearch && u.clinicId === user?.clinicId;
  });

  const uniqueClinics = Array.from(new Set(allUsers.map(u => u.clinicId).filter(Boolean)));
  
  // Separation of pending users
  const pendingClinicAdmins = pendingUsers.filter(u => u.role === 'ADMIN');
  const pendingStaff = user?.role === 'SUPER_ADMIN' 
    ? pendingUsers.filter(u => u.role !== 'ADMIN')
    : pendingUsers.filter(u => u.role !== 'ADMIN' && u.clinicId === user?.clinicId);

  const pendingCount = (user?.role === 'SUPER_ADMIN' ? pendingClinicAdmins.length : 0) + pendingStaff.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : `${user?.clinic} Admin Dashboard`}
          </h1>
          <p className="text-slate-500">
            {user?.role === 'SUPER_ADMIN' 
              ? 'Global system management and cross-clinic oversight.' 
              : 'Clinic management, staff approvals, and local controls.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentClinic && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Join Code</span>
                <span className="text-lg font-mono font-bold text-blue-600 tracking-widest leading-none">{currentClinic.code}</span>
              </div>
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-100">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(currentClinic.code);
                    setIsCopying(true);
                    setTimeout(() => setIsCopying(false), 2000);
                  }}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                  title="Copy to clipboard"
                >
                  {isCopying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <button 
                  disabled={isRegenerating}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to regenerate the join code? Existing staff will not be affected, but new staff will need the new code.')) {
                      setIsRegenerating(true);
                      const result = await regenerateClinicCode(currentClinic.id);
                      if (result.success) {
                        setCurrentClinic(prev => prev ? { ...prev, code: result.newCode! } : null);
                      }
                      setIsRegenerating(false);
                    }
                  }}
                  className={`p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all ${isRegenerating ? 'animate-spin' : ''}`}
                  title="Regenerate random code"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          )}
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
          { label: 'Total Clinics', value: uniqueClinics.length.toString(), status: 'Active', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Users', value: allUsers.length.toString(), status: `${pendingUsers.length} pending`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'System Health', value: 'Optimal', status: '99.9% Uptime', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Security Status', value: 'Secure', status: 'No threats', icon: Lock, color: 'text-slate-600', bg: 'bg-slate-50' },
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
                <h3 className="text-lg font-bold text-slate-900">
                  {user?.role === 'SUPER_ADMIN' ? 'All Pending Approvals' : 'Pending Staff Approvals'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.role === 'SUPER_ADMIN' 
                    ? 'Approve new Clinic Admins and clinic staff requests.' 
                    : 'Review and approve staff members for your clinic.'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{pendingCount} Pending</span>
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
                {/* Clinic Admin Requests (Only for Super Admin) */}
                {user?.role === 'SUPER_ADMIN' && pendingClinicAdmins.length > 0 && (
                  <>
                    <tr className="bg-blue-50/30">
                      <td colSpan={4} className="px-8 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">Clinic Admin Requests</td>
                    </tr>
                    {pendingClinicAdmins.map((u, i) => (
                      <tr key={`admin-${i}`} className="hover:bg-slate-50 transition-colors border-l-4 border-l-blue-500">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded uppercase">Clinic Admin</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase">
                            {u.clinic}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => approveUser(u.uid)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all uppercase tracking-wider"
                            >
                              Approve Admin
                            </button>
                            <button 
                              onClick={() => rejectUser(u.uid)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all uppercase tracking-wider"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Staff Requests */}
                {pendingStaff.length > 0 && (
                  <>
                    {user?.role === 'SUPER_ADMIN' && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={4} className="px-8 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinic Staff Requests</td>
                      </tr>
                    )}
                    {pendingStaff.map((u, i) => (
                      <tr key={`staff-${i}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-semibold text-slate-600">{u.role}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {u.clinic}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => approveUser(u.uid)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all"
                            >
                              Approve Staff
                            </button>
                            <button 
                              onClick={() => rejectUser(u.uid)}
                              className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-100 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {pendingClinicAdmins.length === 0 && pendingStaff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium italic">
                      No pending registration requests at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Password Reset Requests */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Password Reset Approvals</h3>
                <p className="text-xs text-slate-500 font-medium">Verify user identity before approving password resets.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold">{enrichedResetRequests.length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User / Email</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested At</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrichedResetRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium">
                      No pending password reset requests.
                    </td>
                  </tr>
                ) : (
                  enrichedResetRequests.map((req, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.userName}</p>
                          <p className="text-xs text-slate-500">{req.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {req.userClinic}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs text-slate-500">{new Date(req.requestedAt).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => approvePasswordReset(req.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
                          >
                            Approve & Reset
                          </button>
                          <button 
                            onClick={() => rejectPasswordReset(req.id)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                          >
                            Dismiss
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
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                        u.role === 'CHW' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs text-slate-500">{u.clinic || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={u.status === 'APPROVED' ? "w-2 h-2 bg-emerald-500 rounded-full" : "w-2 h-2 bg-amber-500 rounded-full"}></div>
                        <span className="text-xs font-medium text-slate-600">{u.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u.uid !== user?.uid && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                deleteUser(u.uid);
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                          <MoreVertical size={16} />
                        </button>
                      </div>
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

        {/* Clinic Management (SUPER_ADMIN only) */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                  <Hospital size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Clinic Management</h3>
                  <p className="text-xs text-slate-500 font-medium">Overview of all hospitals and clinics in the system.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">{allClinics.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Name</th>
                    <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Code</th>
                    <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</th>
                    <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allClinics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">
                        No clinics registered in the system yet.
                      </td>
                    </tr>
                  ) : (
                    allClinics.map((clinic, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Hospital size={18} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{clinic.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium uppercase">{clinic.village || 'No Village'} • TA {clinic.ta || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-mono font-bold text-blue-600 tracking-widest bg-blue-50 px-2 py-1 rounded">
                            {clinic.code}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit ${
                              clinic.subscriptionStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {clinic.subscriptionStatus === 'PAID' ? 'Have Paid' : 'Haven\'t Paid'}
                            </span>
                            <button 
                              onClick={() => updateClinicSubscription(clinic.id, clinic.subscriptionStatus === 'PAID' ? 'UNPAID' : 'PAID')}
                              className="text-[9px] font-bold text-blue-600 hover:underline text-left"
                            >
                              Toggle Payment
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit ${
                              clinic.status === 'ACTIVE' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {clinic.status === 'ACTIVE' ? 'System Unlocked' : 'System Locked'}
                            </span>
                            <button 
                              onClick={() => updateClinicStatus(clinic.id, clinic.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                              className="text-[9px] font-bold text-slate-600 hover:underline text-left"
                            >
                              {clinic.status === 'ACTIVE' ? 'Lock System' : 'Unlock System'}
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                              title="Delete Facility"
                              onClick={() => {
                                if(window.confirm(`Are you sure you want to permanently remove ${clinic.name}? This action cannot be undone.`)) {
                                  deleteClinic(clinic.id);
                                }
                              }}
                            >
                              <XCircle size={18} />
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
        )}
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
