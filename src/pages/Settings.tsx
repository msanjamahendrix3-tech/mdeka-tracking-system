import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  ExternalLink, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { testSupabaseConnection, isSupabaseDemoMode } from '../lib/supabase';
import { migrateFirestoreToSupabase, MigrationLog } from '../utils/supabaseMigrator';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Supabase states
  const [connStatus, setConnStatus] = useState<{ checked: boolean; success: boolean; message: string }>({
    checked: false,
    success: false,
    message: ''
  });
  const [testingConn, setTestingConn] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'supabase', label: 'Supabase Sync', icon: Database },
  ];

  const checkConnection = async () => {
    setTestingConn(true);
    const res = await testSupabaseConnection();
    setConnStatus({ checked: true, success: res.success, message: res.message });
    setTestingConn(false);
  };

  useEffect(() => {
    if (activeTab === 'supabase') {
      checkConnection();
    }
  }, [activeTab]);

  const handleMigrate = async () => {
    if (migrating) return;
    setMigrating(true);
    setMigrationResult(null);
    try {
      const res = await migrateFirestoreToSupabase((logs) => {
        setMigrationLogs(logs);
      });
      setMigrationResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setMigrationResult({ success: false, message: err.message || 'Unexpected migration failure' });
    } finally {
      setMigrating(false);
    }
  };

  const copySqlSchema = () => {
    const sqlText = `-- Supabase/PostgreSQL schema definitions for MDeka Tracking System
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    subscription_status TEXT NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    clinic_id TEXT REFERENCES clinics(id) ON DELETE SET NULL,
    clinic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL,
    clinic TEXT NOT NULL,
    clinic_id TEXT REFERENCES clinics(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    sector TEXT,
    allergies TEXT,
    medications TEXT,
    ncd_reg_number TEXT,
    bp_measurement TEXT,
    diabetes_reading TEXT,
    status TEXT NOT NULL DEFAULT 'Normal',
    assigned_chw TEXT,
    follow_ups JSONB DEFAULT '[]'::jsonb NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;
    
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500">Manage your account preferences and database migrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {(user?.name || 'User').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{user?.role} - {user?.clinic}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" readOnly />
                  <p className="text-xs text-slate-500 mt-1">Please contact an admin to change your name.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
                  <input type="text" defaultValue={(user?.uid || '').replace(/_/g, '').toLowerCase() + '@mdek.health'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" readOnly />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <h3 className="font-medium text-slate-800">Email Notifications</h3>
                    <p className="text-xs text-slate-500">Receive alerts via email</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <h3 className="font-medium text-slate-800">Push Notifications</h3>
                    <p className="text-xs text-slate-500">Receive alerts in the browser</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <h3 className="font-medium text-slate-800">Patient Fall-behind Alerts</h3>
                    <p className="text-xs text-slate-500">Notify when a patient misses follow-ups</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Appearance</h2>
               <p className="text-sm text-slate-600">Appearance settings will be implemented in a future update.</p>
            </motion.div>
          )}
          
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Security Settings</h2>
               <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                 <h3 className="font-medium text-amber-800 mb-1">Password Management</h3>
                 <p className="text-sm text-amber-700 mb-3">To change your password, please contact your system administrator.</p>
                 <button className="px-4 py-2 bg-white text-slate-700 font-medium border border-slate-200 rounded-lg text-sm shadow-sm hover:bg-slate-50">
                   Request Password Reset
                 </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'supabase' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-slate-700">
               <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                 <h2 className="text-lg font-bold text-slate-800">Supabase Migration Hub</h2>
                 <button 
                   onClick={checkConnection} 
                   disabled={testingConn}
                   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg transition"
                 >
                   {testingConn && <Loader2 size={13} className="animate-spin" />}
                   Test Connection
                 </button>
               </div>

               {/* 1. Connection status card */}
               <div className={`p-4 rounded-xl border flex gap-3 ${
                 !connStatus.checked 
                   ? 'bg-slate-50 border-slate-200 text-slate-600'
                   : connStatus.success 
                     ? 'bg-green-50 border-green-200 text-green-800'
                     : 'bg-red-50 border-red-200 text-red-800'
               }`}>
                 {!connStatus.checked ? (
                   <>
                     <Loader2 size={20} className="text-slate-500 animate-spin flex-shrink-0 mt-0.5" />
                     <div>
                       <h3 className="font-semibold text-slate-800">Checking Setup...</h3>
                       <p className="text-xs text-slate-500 mt-0.5">Contacting Supabase API configurations...</p>
                     </div>
                   </>
                 ) : connStatus.success ? (
                   <>
                     <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                     <div>
                       <h3 className="font-semibold text-green-900">Supabase Connected Successfully</h3>
                       <p className="text-xs text-green-700 mt-0.5">{connStatus.message}</p>
                     </div>
                   </>
                 ) : (
                   <>
                     <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                     <div>
                       <h3 className="font-semibold text-red-900">Supabase URL & Key Missing</h3>
                       <p className="text-xs text-red-700 mt-0.5">Please add your production Supabase keys in local `.env` or settings. Proceed below to get the setup details.</p>
                     </div>
                   </>
                 )}
               </div>

               {/* 2. Step by Step Guide */}
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800">Migration Pipeline Instructions</h3>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                       <h4 className="font-semibold text-sm text-slate-800">Get Supabase Link</h4>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                       Create a free project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink size={10} /></a>. Once built, go to Database settings to find your API URL and Anon token.
                     </p>
                   </div>

                   <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                       <h4 className="font-semibold text-sm text-slate-800">Build DB Schema</h4>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                       Copy the compiled schema using the copying button below. Open the <strong>SQL Editor</strong> tab inside Supabase, paste and press <strong>Run</strong>.
                     </p>
                   </div>

                   <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                       <h4 className="font-semibold text-sm text-slate-800">Deploy Changes</h4>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                       Specify keys inside <strong>.env</strong> file (<code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code>), restart server, and tap below.
                     </p>
                   </div>
                 </div>

                 {/* SQL copy segment */}
                 <div className="bg-slate-900 text-slate-300 p-4 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                     <Database className="text-blue-400" size={18} />
                     <div>
                       <h4 className="font-semibold text-sm text-white">Interactive PostgreSQL SQL Schema</h4>
                       <p className="text-[10px] text-slate-400">Pre-built constraints, indexes, tables, and row level permissions rules</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={copySqlSchema}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white transition"
                     >
                       {copiedSql ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} />}
                       {copiedSql ? 'Copied!' : 'Copy Schema'}
                     </button>
                     <a 
                       href="/supabase-schema.sql" 
                       download="supabase-schema.sql"
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white transition"
                     >
                       Download Schema
                     </a>
                   </div>
                 </div>

                 {/* Migration action region */}
                 <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
                   <div className="max-w-xl">
                     <h3 className="font-bold text-blue-900 text-base">Transfer Firestore to Supabase</h3>
                     <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                       Our automatic migration tool extracts all clinics, health providers, registered patient records, community threads, follow-ups, and notifications from Google Firebase and populates them into your Supabase database.
                     </p>
                   </div>
                   <button 
                     onClick={handleMigrate}
                     disabled={migrating || !connStatus.success}
                     className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm font-bold text-white rounded-xl shadow-md transition whitespace-nowrap self-stretch md:self-auto justify-center"
                   >
                     {migrating ? (
                       <Loader2 size={16} className="animate-spin" />
                     ) : (
                       <UploadCloud size={16} />
                     )}
                     {migrating ? 'Migrating Records...' : 'Start Migration Now'}
                   </button>
                 </div>

                 {/* Warnings about missing configurations */}
                 {!connStatus.success && !isSupabaseDemoMode() && (
                   <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                     <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                     <p>
                       The automatic migration tool is disabled because your <strong>.env</strong> file is not configured. Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> keys to migrate with 1-click. In the meantime, you can copy/download the Postgres schema code above!
                     </p>
                   </div>
                 )}

                 {/* Logs list */}
                 {(migrationLogs.length > 0 || migrationResult) && (
                   <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                     <h4 className="font-bold text-sm text-slate-800">Current Progress Logs</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {migrationLogs.map(log => (
                         <div key={log.table} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                           <div>
                             <span className="text-xs font-mono font-semibold text-slate-800 block capitalize">{log.table.replace(/_/g, ' ')}</span>
                             <span className="text-[10px] text-slate-400 mt-0.5 block">{log.count} synced</span>
                           </div>
                           <div>
                             {log.status === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" title="Pending" />}
                             {log.status === 'syncing' && <Loader2 size={14} className="text-blue-500 animate-spin" />}
                             {log.status === 'completed' && <CheckCircle2 size={14} className="text-green-500" />}
                             {log.status === 'failed' && <XCircle size={14} className="text-red-500" />}
                           </div>
                         </div>
                       ))}
                     </div>

                     {migrationResult && (
                       <div className={`p-3 rounded-lg text-xs mt-3 ${migrationResult.success ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                         <span className="font-semibold block">{migrationResult.success ? 'Success' : 'Error'}</span>
                         <p className="mt-0.5 text-[11px] font-medium leading-relaxed">{migrationResult.message}</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
