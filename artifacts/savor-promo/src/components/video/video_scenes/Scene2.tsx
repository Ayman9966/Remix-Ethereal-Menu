import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center px-24 bg-[var(--color-bg-light)]"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-1/2 pr-12">
        <motion.div
          className="text-sm font-bold tracking-widest text-[var(--color-primary)] uppercase mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          Digital Menu
        </motion.div>
        <motion.h2 
          className="text-[4.5vw] font-bold text-[var(--color-text-primary)] leading-[1.1] text-balance"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          An elegant experience for your guests
        </motion.h2>
        <motion.div 
          className="mt-8 h-[2px] bg-[var(--color-primary)] origin-left"
          initial={{ scaleX: 0 }}
          animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          style={{ width: '60px' }}
        />
      </div>

      <div className="w-1/2 flex justify-center relative">
        <motion.div 
          className="w-[280px] h-[580px] bg-white rounded-[40px] shadow-2xl border-8 border-[var(--color-bg-muted)] overflow-hidden relative flex flex-col"
          initial={{ opacity: 0, y: 100, rotate: 5 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, rotate: -2 } : { opacity: 0, y: 100, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="h-40 bg-[var(--color-primary)] opacity-10 absolute top-0 left-0 right-0"></div>
          <div className="p-6 pt-12 relative z-10">
            <div className="w-24 h-4 bg-[var(--color-text-primary)] rounded-full mb-8"></div>
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                className="flex gap-4 mb-6 items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.5 }}
              >
                <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-muted)]"></div>
                <div className="flex-1">
                  <div className="w-full h-3 bg-[var(--color-text-secondary)] rounded mb-2"></div>
                  <div className="w-1/2 h-2 bg-[var(--color-text-muted)] rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
