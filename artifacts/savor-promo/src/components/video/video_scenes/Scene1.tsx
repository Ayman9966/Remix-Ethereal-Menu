import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      {/* Radial glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(66,101,100,0.18) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Horizontal lines */}
      {phase >= 2 && (
        <>
          <motion.div
            className="absolute"
            style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(93,145,143,0.4), transparent)', width: '100%', top: '38%' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'circOut' }}
          />
          <motion.div
            className="absolute"
            style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(93,145,143,0.2), transparent)', width: '100%', top: '62%' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'circOut', delay: 0.1 }}
          />
        </>
      )}

      <div className="relative z-10 text-center">
        {/* Logo mark */}
        <motion.div
          className="mx-auto mb-8 flex items-center justify-center rounded-2xl"
          style={{ width: '5.5vw', height: '5.5vw', background: '#426564', boxShadow: '0 0 3vw rgba(66,101,100,0.5)' }}
          initial={{ scale: 0, rotate: -20 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
          </svg>
        </motion.div>

        {/* Brand name */}
        <div style={{ perspective: '900px', overflow: 'hidden' }}>
          <motion.h1
            style={{ fontFamily: 'var(--font-display)', fontSize: '14vw', fontWeight: 900, color: '#eef3f2', lineHeight: 0.9, letterSpacing: '-0.04em' }}
            initial={{ opacity: 0, y: '60%', rotateX: -25 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            Savor
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          style={{ fontFamily: 'var(--font-body)', fontSize: '2vw', color: '#7aacaa', marginTop: '2.5vh', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Restaurant management, reimagined
        </motion.p>

        {/* Accent bar */}
        <motion.div
          className="mx-auto mt-6"
          style={{ height: '2px', background: '#426564', borderRadius: '2px' }}
          initial={{ width: 0 }}
          animate={phase >= 4 ? { width: '6vw' } : {}}
          transition={{ duration: 0.6, ease: 'circOut' }}
        />
      </div>
    </motion.div>
  );
}
