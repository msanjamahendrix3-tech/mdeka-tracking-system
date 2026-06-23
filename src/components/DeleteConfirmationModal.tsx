import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  patientName: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, patientName }: DeleteConfirmationModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation('');
      setIsAgreed(false);
      setIsDeleting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (typedConfirmation.trim().toLowerCase() !== patientName.trim().toLowerCase()) {
      setError(`Please type "${patientName}" exactly to confirm.`);
      return;
    }
    if (!isAgreed) {
      setError('You must check the confirmation checkbox.');
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete via modal', err);
      let userMsg = 'Failed to delete patient. Please check your permissions and connection.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error && (parsed.error.includes('permission') || parsed.error.includes('PERMISSION_DENIED'))) {
          userMsg = 'Permission denied: You do not have sufficient privileges to delete this patient.';
        }
      } catch (_) {
        if (err.message && err.message.toLowerCase().includes('permission')) {
          userMsg = 'Permission denied: You do not have sufficient privileges to delete this patient.';
        }
      }
      setError(userMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isMatched = typedConfirmation.trim().toLowerCase() === patientName.trim().toLowerCase();
  const canDelete = isAgreed && isMatched && !isDeleting;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh] border border-red-100"
          id="delete-patient-modal-container"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center animate-pulse">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500">Critical security check</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              id="close-delete-modal-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="text-sm text-slate-600 leading-relaxed">
              You are about to permanently delete patient <strong className="text-slate-900 font-bold">{patientName}</strong>. This action is irreversible. All associated:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500 text-xs">
                <li>Follow-up clinic sessions & medical histories</li>
                <li>CHW house-call records & notes</li>
                <li>Local & synchronized cloud reservoirs</li>
              </ul>
              will be permanently removed.
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/55 transition">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => {
                  setIsAgreed(e.target.checked);
                  setError(null);
                }}
                className="mt-0.5 w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                id="delete-understand-checkbox"
              />
              <span className="text-xs font-semibold text-slate-700 select-none">
                I understand that this action is permanent and cannot be undone.
              </span>
            </label>

            {/* Type text confirmation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Type the patient's name to confirm:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => {
                  setTypedConfirmation(e.target.value);
                  setError(null);
                }}
                placeholder={patientName}
                autoComplete="off"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all text-slate-800 placeholder-slate-400 font-medium"
                id="delete-name-confirm-input"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold"
                id="delete-modal-error-msg"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              id="cancel-delete-modal-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canDelete}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:hover:bg-red-600 select-none"
              id="confirm-delete-modal-btn"
            >
              {isDeleting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              Permanently Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
