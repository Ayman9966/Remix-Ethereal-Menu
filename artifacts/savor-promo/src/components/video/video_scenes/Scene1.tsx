import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="relative z-10 text-center">
        <motion.div 
          className="w-16 h-16 mb-8 mx-auto rounded-xl bg-[var(--color-primary)] flex items-center justify-center"
          initial={{ scale: 0, rotate: -15 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
          </svg>
        </motion.div>
        
        <div style={{ perspective: '1000px' }}>
          <motion.h1 
            className="text-[6vw] font-bold tracking-tight text-[var(--color-text-primary)] leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, rotateX: -30, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: -30, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            Savor
          </motion.h1>
        </div>
        
        <motion.p 
          className="mt-6 text-[2vw] text-[var(--color-text-secondary)] font-medium tracking-wide uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Run your restaurant beautifully
        </motion.p>
      </div>
    </motion.div>
  );
}
