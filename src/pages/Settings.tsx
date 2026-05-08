import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500">Manage your account preferences</p>
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
                  {user?.name.split(' ').map(n => n[0]).join('')}
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
                  <input type="text" defaultValue={user?.uid.replace(/_/g, '').toLowerCase() + '@mdek.health'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" readOnly />
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
        </div>
      </div>
    </div>
  );
}
