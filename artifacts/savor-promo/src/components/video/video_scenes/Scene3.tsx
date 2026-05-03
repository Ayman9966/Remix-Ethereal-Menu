import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center z-10 mb-16">
        <motion.div
          className="text-sm font-bold tracking-widest text-[var(--color-primary)] uppercase mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Kitchen Display
        </motion.div>
        <motion.h2 
          className="text-[4.5vw] font-bold text-white leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        >
          Real-time kitchen flow
        </motion.h2>
      </div>

      <div className="flex gap-6 relative z-10">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`w-[18vw] bg-white/5 border border-white/10 rounded-2xl p-5 ${i === 2 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : ''}`}
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.15 }}
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <div className="text-white/80 font-mono text-sm">Table {i * 2 + 1}</div>
              <div className="text-xs text-[var(--color-primary)] font-bold">12m</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-white/20"></div>
                <div className="h-3 w-3/4 bg-white/60 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-white/20"></div>
                <div className="h-3 w-1/2 bg-white/60 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-white/20"></div>
                <div className="h-3 w-2/3 bg-white/60 rounded"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
