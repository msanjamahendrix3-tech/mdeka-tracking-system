import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold border ${
            isOnline 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : 'bg-slate-800 text-white border-slate-700'
          }`}>
            {isOnline ? (
              <>
                <Wifi size={16} />
                <span>Back Online</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span>Working Offline</span>
              </>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Permanent indicator if offline */}
      {!isOnline && !showStatus && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="w-10 h-10 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center border border-slate-700">
            <CloudOff size={20} />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
