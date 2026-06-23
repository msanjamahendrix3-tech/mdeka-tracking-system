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
   Trash2,
   BookOpen,
   FileText,
   X,
   AlertTriangle
 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, Clinic } from '../context/AuthContext';
import { SecurityAuditModal } from '../components/SecurityAuditModal';
import { ReportGeneratorModal } from '../components/ReportGeneratorModal';
import { ReportSchedulerModal } from '../components/ReportSchedulerModal';

export default function AdminDashboard() {
  const { 
    user, 
    pendingUsers, 
    resetRequests,
    resourceRequests = [],
    resolveResourceRequest,
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
  const [clinicFilter, setClinicFilter] = React.useState('ALL');
  const [currentClinic, setCurrentClinic] = React.useState<Clinic | null>(null);
  const [isCopying, setIsCopying] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const pendingResourceRequests = resourceRequests.filter(req => req.status === 'PENDING').filter(req => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return req.clinicId === user?.clinicId;
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
    const matchesSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(userSearch.toLowerCase());
    
    if (user?.role === 'SUPER_ADMIN') {
      const matchesClinic = clinicFilter === 'ALL' || u.clinicId === clinicFilter;
      return matchesSearch && matchesClinic;
    }
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
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'Regenerate Join Code',
                      message: 'Are you sure you want to regenerate the join code? Existing staff will not be affected, but new staff will need the new code.',
                      confirmText: 'Regenerate',
                      isDanger: false,
                      onConfirm: async () => {
                        setIsRegenerating(true);
                        try {
                          const result = await regenerateClinicCode(currentClinic.id);
                          if (result.success) {
                            setCurrentClinic(prev => prev ? { ...prev, code: result.newCode! } : null);
                            setToast({ message: 'Successfully regenerated join code.', type: 'success' });
                          }
                        } catch (err: any) {
                          console.error(err);
                          setToast({ message: `Failed to regenerate code: ${err?.message || String(err)}`, type: 'error' });
                        } finally {
                          setIsRegenerating(false);
                        }
                      }
                    });
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
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition-all"
          >
            <FileText size={20} /> PDF Report
          </button>
          <button 
            onClick={() => setIsSecurityAuditOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-lg transition-all"
          >
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
          <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
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
                              {u.name?.[0] || '?'}
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
                              onClick={async () => {
                                try {
                                  await approveUser(u.uid);
                                  setToast({ message: `Successfully approved admin ${u.name}.`, type: 'success' });
                                } catch (err: any) {
                                  console.error(err);
                                  setToast({ message: `Failed to approve user: ${err?.message || String(err)}`, type: 'error' });
                                }
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all uppercase tracking-wider"
                            >
                              Approve Admin
                            </button>
                            <button 
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Reject Booking/Admin Request',
                                  message: `Are you sure you want to reject and remove registration request for ${u.name}?`,
                                  confirmText: 'Reject Request',
                                  isDanger: true,
                                  onConfirm: async () => {
                                    try {
                                      await rejectUser(u.uid);
                                      setToast({ message: `Successfully rejected ${u.name}.`, type: 'success' });
                                    } catch (err: any) {
                                      console.error(err);
                                      setToast({ message: `Failed to reject user: ${err?.message || String(err)}`, type: 'error' });
                                    }
                                  }
                                });
                              }}
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
                              {u.name?.[0] || '?'}
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
                              onClick={async () => {
                                try {
                                  await approveUser(u.uid);
                                  setToast({ message: `Successfully approved staff ${u.name}.`, type: 'success' });
                                } catch (err: any) {
                                  console.error(err);
                                  setToast({ message: `Failed to approve user: ${err?.message || String(err)}`, type: 'error' });
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all"
                            >
                              Approve Staff
                            </button>
                            <button 
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Reject Facility Registration',
                                  message: `Are you sure you want to reject and remove registration request for ${u.name}?`,
                                  confirmText: 'Reject Request',
                                  isDanger: true,
                                  onConfirm: async () => {
                                    try {
                                      await rejectUser(u.uid);
                                      setToast({ message: `Successfully rejected ${u.name}.`, type: 'success' });
                                    } catch (err: any) {
                                      console.error(err);
                                      setToast({ message: `Failed to reject user: ${err?.message || String(err)}`, type: 'error' });
                                    }
                                  }
                                });
                              }}
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
          <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
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

        {/* Resource Requests */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-emerald-500" size={24} />
              Resource Requests
              {pendingResourceRequests.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingResourceRequests.length} Pending
                </span>
              )}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested By</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested At</th>
                  <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingResourceRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">
                      No pending resource requests.
                    </td>
                  </tr>
                ) : (
                  pendingResourceRequests.map((req, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.userName}</p>
                          <p className="text-xs text-slate-500">{req.clinicName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-semibold text-slate-700">{req.topic}</span>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs text-slate-600 line-clamp-2 max-w-xs" title={req.message}>{req.message}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs text-slate-500">{new Date(req.requestedAt).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => resolveResourceRequest(req.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                          >
                            Mark as Handled
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
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="user-management-panel">
          <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500 font-medium">Manage and delete workspace staff permissions.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {user?.role === 'SUPER_ADMIN' && (
                <select
                  value={clinicFilter}
                  onChange={(e) => setClinicFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  id="admin-clinic-filter-select"
                >
                  <option value="ALL">All Facilities</option>
                  {allClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              )}
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
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p 
                            className="text-xs text-slate-500 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(u.email);
                              setToast({ message: 'Email copied to clipboard', type: 'success' });
                            }}
                            title="Click to copy email"
                          >
                            @{u.username} <span className="opacity-50">({u.email})</span>
                          </p>
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
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Delete User Profile',
                                message: `Are you sure you want to permanently delete user ${u.name} from their registered facility?`,
                                confirmText: 'Permanently Delete',
                                isDanger: true,
                                onConfirm: async () => {
                                  try {
                                    await deleteUser(u.uid);
                                    setToast({ message: `Successfully deleted user ${u.name}.`, type: 'success' });
                                  } catch (err: any) {
                                    console.error('Failed to delete user:', err);
                                    const errMsg = err?.message || String(err);
                                    let userMsg = `Failed to delete user: ${errMsg}`;
                                    if (errMsg.toLowerCase().includes('permission')) {
                                      userMsg = 'Permission denied: You do not have sufficient privileges to delete this user.';
                                    }
                                    setToast({ message: userMsg, type: 'error' });
                                  }
                                }
                              });
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete User"
                            id={`user-delete-btn-${u.uid}`}
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
        <div className="bg-slate-900 rounded-3xl p-4 md:p-8 text-white space-y-6">
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
            <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
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
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-medium uppercase">{clinic.village || 'No Village'} • TA {clinic.ta || 'N/A'}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setClinicFilter(clinic.id);
                                    const userEl = document.getElementById('user-management-panel');
                                    if (userEl) {
                                      userEl.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer inline-block"
                                  title="Filter user list to this clinic"
                                >
                                  (View Users)
                                </button>
                              </div>
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
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Delete Registered Facility',
                                  message: `Are you sure you want to permanently remove ${clinic.name}? This action cannot be undone.`,
                                  confirmText: 'Remove Facility',
                                  isDanger: true,
                                  onConfirm: async () => {
                                    try {
                                      await deleteClinic(clinic.id);
                                      setToast({ message: `Successfully deleted facility ${clinic.name}.`, type: 'success' });
                                    } catch (err: any) {
                                      console.error('Failed to delete clinic:', err);
                                      setToast({ message: `Failed to delete facility: ${err?.message || String(err)}`, type: 'error' });
                                    }
                                  }
                                });
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
      <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900">System Automation & Security Settings</h3>
          <button 
            onClick={() => setIsSchedulerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Settings size={18} /> Configure Automated Reports
          </button>
        </div>
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

      <SecurityAuditModal 
        isOpen={isSecurityAuditOpen} 
        onClose={() => setIsSecurityAuditOpen(false)} 
        users={allUsers}
      />
      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <ReportSchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
      />

      {/* Reusable Admin Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col border border-slate-100"
              id="admin-confirm-dialog-container"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confirmDialog.isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{confirmDialog.title}</h3>
                    <p className="text-xs text-slate-500">System modification check</p>
                  </div>
                </div>
                <button
                  onClick={() => !isConfirmLoading && setConfirmDialog(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                  id="close-admin-confirm-btn"
                  disabled={isConfirmLoading}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                  {confirmDialog.message}
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
                <button
                  onClick={() => !isConfirmLoading && setConfirmDialog(null)}
                  disabled={isConfirmLoading}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
                  id="cancel-admin-confirm-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsConfirmLoading(true);
                    try {
                      await confirmDialog.onConfirm();
                      setConfirmDialog(null);
                    } catch (err) {
                      console.error('Confirm operation fail', err);
                    } finally {
                      setIsConfirmLoading(false);
                    }
                  }}
                  disabled={isConfirmLoading}
                  className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-xl transition ${
                    confirmDialog.isDanger 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  id="submit-admin-confirm-btn"
                >
                  {isConfirmLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmDialog.confirmText || 'Confirm'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold select-none ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : toast.type === 'error'
                ? 'bg-red-50 border-red-100 text-red-800'
                : 'bg-blue-50 border-blue-100 text-blue-800'
            }`}
            id="admin-dashboard-toast"
          >
            <div className={`w-2 h-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
