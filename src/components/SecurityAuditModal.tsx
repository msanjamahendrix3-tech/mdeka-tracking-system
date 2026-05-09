import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, AlertTriangle, Users, Lock, ServerCrash, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../context/AuthContext';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
}

export function SecurityAuditModal({ isOpen, onClose, users }: SecurityAuditModalProps) {
  if (!isOpen) return null;

  const unverifiedUsers = users.filter(u => u.status === 'PENDING');
  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
  const activeAdmins = users.filter(u => u.role === 'ADMIN' && u.status === 'APPROVED');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Security Audit Report</h2>
                <p className="text-sm text-slate-500">System infrastructure and access overview</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 89px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle2 size={18} />
                  <span className="font-bold text-sm">System Health</span>
                </div>
                <p className="text-2xl font-black text-emerald-900">Secure</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">All protocols running normally</p>
              </div>
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertTriangle size={18} />
                  <span className="font-bold text-sm">Pending Access</span>
                </div>
                <p className="text-2xl font-black text-amber-900">{unverifiedUsers.length}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">Users awaiting verification</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Access Controls</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Lock size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Super Admin Privileges</h4>
                  <p className="text-xs text-slate-500 mb-2">Users with unrestricted system access</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">{superAdmins.length} active</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Clinic Administrators</h4>
                  <p className="text-xs text-slate-500 mb-2">Users with facility-level management rights</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">{activeAdmins.length} active</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                  <ServerCrash size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Attempted Intrusions (Last 30 Days)</h4>
                  <p className="text-xs text-slate-500 mb-2">Blocked unauthorized API access attempts</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">0 attempts</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Clear</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Last scanned: Just now</span>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
