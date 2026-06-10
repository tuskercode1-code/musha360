'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const statuses = [
    "ACQUIRING POINT CLOUD DATA",
    "GENERATING 3D MESH",
    "MAPPING TEXTURE DATA",
    "OPTIMIZING SPATIAL GEOMETRY",
    "SYNCING MUSHA360 ASSETS"
  ];

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 800);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 700);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            clipPath: 'inset(0 0 100% 0)',
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Blueprint Background */}
          <div className="absolute inset-0 opacity-[0.05]" 
               style={{ 
                 backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`, 
                 backgroundSize: '40px 40px' 
               }} 
          />

          <div className="relative z-10 text-center flex flex-col items-center">
            
            {/* THE 3D STRUCTURE: Rotating Wireframe Building */}
            <div className="relative w-48 h-48 mb-16" style={{ perspective: '1000px' }}>
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Building Base Wireframe */}
                {[0, 90, 180, 270].map((rotation) => (
                  <div
                    key={rotation}
                    className="absolute inset-0 border-2 border-blue-500/40"
                    style={{ transform: `rotateY(${rotation}deg) translateZ(60px)` }}
                  />
                ))}

                {/* Building Roof Slants */}
                {[0, 180].map((rotation) => (
                  <div
                    key={`roof-${rotation}`}
                    className="absolute bottom-full left-0 w-full h-32 border-2 border-blue-500/20"
                    style={{ 
                        transformOrigin: 'bottom',
                        transform: `rotateY(${rotation}deg) rotateX(45deg) translateZ(0px)` 
                    }}
                  />
                ))}

                {/* Floor Grid inside the structure */}
                <div 
                  className="absolute inset-0 border border-blue-500/10"
                  style={{ transform: 'rotateX(90deg) translateZ(0px)' }}
                />

                {/* Point Cloud Particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                      transform: `translateX(${Math.random() * 100 - 50}px) translateY(${Math.random() * 100 - 50}px) translateZ(${Math.random() * 100 - 50}px)`
                    }}
                  />
                ))}
              </motion.div>
              
              {/* Outer Scanning Ring */}
              <motion.div 
                animate={{ rotateZ: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20%] border border-white/5 rounded-full"
              />
            </div>

            {/* BRANDING */}
            <div className="space-y-3">
              <h1 className="text-white text-4xl font-black tracking-[0.3em] uppercase italic drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                MUSHA<span className="text-blue-600">360</span>
              </h1>
              <div className="flex items-center justify-center gap-3 overflow-hidden h-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-blue-500/80 text-[10px] font-black uppercase tracking-[0.5em]"
                  >
                    {statuses[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-16 w-72 space-y-3">
              <div className="h-[2px] w-full bg-white/5 relative">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,1)]"
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-white/20 uppercase tracking-widest">
                <span>Rendering Space</span>
                <span className="text-white/40 tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* VERTICAL SCANNING LINE */}
          <motion.div 
            initial={{ left: '-10%' }}
            animate={{ left: '110%' }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent z-20 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}