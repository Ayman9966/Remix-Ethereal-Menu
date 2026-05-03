import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const tagline = 'Run your restaurant beautifully.';

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative z-10 text-center px-16">
        <motion.div
          className="w-20 h-20 mb-10 mx-auto rounded-2xl bg-[var(--color-primary)] flex items-center justify-center"
          initial={{ scale: 0, rotate: -20 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
          </svg>
        </motion.div>

        <div style={{ perspective: '1200px' }}>
          <motion.h1
            className="text-[8vw] font-black tracking-tight text-[var(--color-text-primary)] leading-none mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, rotateX: -40, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: -40, y: 50 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            Savor
          </motion.h1>
        </div>

        <div className="overflow-hidden">
          <motion.p
            className="text-[2vw] text-[var(--color-text-secondary)] font-medium tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {tagline}
          </motion.p>
        </div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <motion.div
            className="h-[2px] bg-[var(--color-primary)]"
            initial={{ width: 0 }}
            animate={phase >= 4 ? { width: '80px' } : { width: 0 }}
            transition={{ duration: 0.8, ease: 'circOut' }}
          />
          <span
            className="text-[1.2vw] text-[var(--color-primary)] font-bold tracking-widest uppercase"
          >
            Restaurant Management
          </span>
          <motion.div
            className="h-[2px] bg-[var(--color-primary)]"
            initial={{ width: 0 }}
            animate={phase >= 4 ? { width: '80px' } : { width: 0 }}
            transition={{ duration: 0.8, ease: 'circOut' }}
          />
        </motion.div>
      </div>

      {/* Ambient floating orbs for continuous motion */}
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full opacity-10 blur-[60px] pointer-events-none"
        style={{ background: 'var(--color-primary)', top: '-5%', right: '-5%' }}
        animate={{ scale: [1, 1.1, 1], x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[20vw] h-[20vw] rounded-full opacity-10 blur-[50px] pointer-events-none"
        style={{ background: 'var(--color-accent)', bottom: '5%', left: '5%' }}
        animate={{ scale: [1, 1.15, 1], x: [0, -8, 0], y: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
