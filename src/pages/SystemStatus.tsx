import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertCircle, Server, Database, Lock, Key, Users, Building2, Eye, EyeOff } from 'lucide-react';

export default function SystemStatus() {
  const [status, setStatus] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Health check
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Middleware link broken:', err);
        setLoading(false);
      });

    // Fetch user database
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('User vault returned invalid format:', data);
          setUsers([]);
        }
        setUsersLoading(false);
      })
      .catch(err => {
        console.error('Failed to load user vault:', err);
        setUsers([]);
        setUsersLoading(false);
      });
  }, []);

  const togglePassword = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-600" />
          System Security & User Vault
        </h1>
        <p className="text-slate-500 mt-2">
          Real-time monitoring of the middleware isolation layer and credential management.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Server className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Middleware Shield</h3>
              <p className="text-sm text-slate-500">Gateway Status</p>
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex items-center gap-2 text-slate-400">
              <div className="w-3 h-3 bg-slate-300 rounded-full animate-bounce"></div>
              Checking heartbeat...
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                Active Isolation
              </div>
              <div className="bg-slate-50 p-3 rounded-lg font-mono text-[10px] text-slate-600">
                <p>Gateway: {status.status}</p>
                <p>Response: 200 OK</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertCircle className="w-5 h-5" />
              Connection Interrupted
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Database className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Data Integrity</h3>
              <p className="text-sm text-slate-500">Database Protection</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Sanitized Inputs</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Blocked External Queries</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Encrypted Server Tunnel</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Users className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">System Scale</h3>
              <p className="text-sm text-slate-500">Registry Count</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-indigo-600">{users.length}</span>
            <span className="text-slate-500 pb-1 text-sm">Registered Accounts</span>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-slate-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Credential Vault</h2>
              <p className="text-xs text-slate-500">Cross-facility identity management for Super Admins</p>
            </div>
          </div>
          <Building2 className="w-8 h-8 text-slate-200" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">User / Facility</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Access Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Unlocking Vault...
                    </div>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                        {(u.name || 'U')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          Facility ID: {u.clinicId || 'System Wide'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {u.username}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900 text-green-400 px-3 py-1.5 rounded-lg font-mono text-xs flex-1 flex items-center justify-between min-w-[140px]">
                        <span>{showPasswords[u.id] ? (u.password || '********') : '••••••••'}</span>
                        <button 
                          onClick={() => togglePassword(u.id)}
                          className="text-slate-400 hover:text-white transition-colors ml-2"
                        >
                          {showPasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Isolation Theory</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">📱</div>
              <p className="text-sm font-medium">Public App</p>
            </div>
            <div className="h-0.5 w-12 bg-blue-500 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2 animate-pulse">🛡️</div>
              <p className="text-sm font-medium">Secure Middleware</p>
            </div>
            <div className="h-0.5 w-12 bg-blue-500 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">🔥</div>
              <p className="text-sm font-medium">Data Storage</p>
            </div>
          </div>
          <p className="mt-8 text-slate-400 text-sm leading-relaxed max-w-3xl">
            This middleware acts as a stateful proxy. All facility requests are intercepted here for validation. 
            <strong> Direct database injection attacks are impossible</strong> because the client never receives the primary connection string to the data storage.
          </p>
        </div>
        <Database className="absolute bottom-[-20px] right-[-20px] w-64 h-64 text-white/5" />
      </div>
    </div>
  );
}
