import React from 'react';
import { motion } from 'motion/react';

export const MalawiBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Deep flag colors */}
      <div className="absolute inset-0 flex flex-col">
        {/* Black Stripe */}
        <div className="flex-1 bg-black relative flex justify-center">
          {/* Animated Rising Sun */}
          <motion.div 
            className="absolute bottom-0 translate-y-[35%]"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              rotate: { duration: 120, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <svg width="600" height="600" viewBox="0 0 200 200" className="opacity-90">
               {/* Center circle of sun */}
               <circle cx="100" cy="100" r="45" fill="#CE1126" />
               {/* 31 Rays for Malawi flag */}
               {[...Array(31)].map((_, i) => (
                  <path 
                    key={i} 
                    d="M95,45 L100,5 L105,45 Z" 
                    fill="#CE1126" 
                    transform={`rotate(${(i * 360) / 31} 100 100)`} 
                  />
               ))}
            </svg>
          </motion.div>
        </div>
        {/* Red Stripe */}
        <div className="flex-1 bg-[#CE1126]"></div>
        {/* Green Stripe */}
        <div className="flex-1 bg-[#007A3D]"></div>
      </div>

      {/* Gentle Wave Animation Overlay */}
      <motion.div
         className="absolute inset-0 opacity-30 mix-blend-overlay"
         style={{
           background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)',
           backgroundSize: '300% 300%'
         }}
         animate={{ backgroundPosition: ['100% 0%', '0% 100%', '100% 0%'] }}
         transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Light glass overlay so the app remains legible but the colors shine through */}
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[64px]"></div>
    </div>
  );
};
