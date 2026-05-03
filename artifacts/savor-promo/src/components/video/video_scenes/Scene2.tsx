import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1300),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Right panel bg */}
      <div className="absolute inset-y-0 right-0" style={{ width: '52%', background: '#162220' }} />

      {/* Left: copy */}
      <div className="relative z-10 flex flex-col justify-center" style={{ width: '48%', paddingLeft: '8vw', paddingRight: '4vw' }}>
        <motion.span
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: '#5d918f', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.5vh' }}
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Digital Menu
        </motion.span>

        <motion.h2
          style={{ fontFamily: 'var(--font-display)', fontSize: '5vw', fontWeight: 800, color: '#eef3f2', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '3vh' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          Scan.<br />Order.<br />Done.
        </motion.h2>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.4vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {['No app download', 'Live updates instantly', 'Any device, any table'].map((txt, i) => (
            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
              <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#426564', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.5vw', color: '#7aacaa' }}>{txt}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: phone with real screenshot */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: '52%' }}>
        <motion.div
          style={{
            width: '22vw',
            aspectRatio: '9/19.5',
            background: '#111d1b',
            borderRadius: '2.8vw',
            overflow: 'hidden',
            border: '0.25vw solid rgba(93,145,143,0.3)',
            boxShadow: '0 2vw 6vw rgba(0,0,0,0.6), 0 0 0 0.08vw rgba(93,145,143,0.15)',
            position: 'relative',
          }}
          initial={{ opacity: 0, y: 80, rotate: 4 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, rotate: -1.5 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          {/* Notch */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3vh', background: '#111d1b', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '5vw', height: '0.5vh', background: 'rgba(93,145,143,0.25)', borderRadius: '1vw' }} />
          </div>
          <img src="/ss-menu.jpg" alt="Digital Menu" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '2.8vw', boxShadow: 'inset 0 0 0 0.25vw rgba(93,145,143,0.15)', pointerEvents: 'none' }} />
        </motion.div>
      </div>
    </motion.div>
  );
}
