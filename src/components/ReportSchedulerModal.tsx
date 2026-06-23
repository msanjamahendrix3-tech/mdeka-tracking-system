import React, { useState } from 'react';
import { X, CalendarClock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReportSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportSchedulerModal({ isOpen, onClose }: ReportSchedulerModalProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!emails) return;

    setIsScheduling(true);
    // Simulate API call to register CRON job/email task
    setTimeout(() => {
      setIsScheduling(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setEmails('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Schedule Reports</h3>
              <p className="text-xs text-slate-500 font-medium">Automated weekly health status emails</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 flex items-center justify-center rounded-full mb-2">
              <CheckCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Successfully Scheduled!</h4>
            <p className="text-sm text-slate-500">Weekly automated emails will be dispatched to the provided list.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Recipient Emails</label>
              <p className="text-xs text-slate-500 mb-2">Enter clinical staff emails separated by commas.</p>
              <textarea 
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="e.g. staff1@clinic.com, staff2@clinic.com"
                className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Delivery Schedule (Weekly)</label>
              <select 
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Monday">Every Monday morning (08:00 AM)</option>
                <option value="Friday">Every Friday afternoon (16:00 PM)</option>
                <option value="Sunday">Every Sunday evening (20:00 PM)</option>
              </select>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <CalendarClock size={18} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                The automated report will extract and summarize regional recovery trends from Firestore and dispatch it securely as a PDF attachment.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
            <button 
              onClick={onClose}
              disabled={isScheduling}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSchedule}
              disabled={isScheduling || !emails.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all"
            >
              {isScheduling ? 'Scheduling...' : 'Save Schedule'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
