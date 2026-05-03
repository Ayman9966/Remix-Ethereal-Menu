import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.5 }}
    >
      {/* Full-bleed kitchen screenshot — 16:9 fills full frame naturally */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <img
          src="/ss-kitchen.jpg"
          alt="Kitchen Display"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
        {/* Heavy left gradient so text pops */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12,20,18,0.95) 0%, rgba(12,20,18,0.7) 50%, rgba(12,20,18,0.2) 100%)' }} />
        {/* Bottom vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,20,18,0.6) 0%, transparent 40%)' }} />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center" style={{ paddingLeft: '8vw' }}>
        <div style={{ maxWidth: '48vw' }}>
          <motion.span
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: '#5d918f', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '1.5vh' }}
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Kitchen Display
          </motion.span>

          <motion.h2
            style={{ fontFamily: 'var(--font-display)', fontSize: '6.5vw', fontWeight: 900, color: '#eef3f2', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: '4vh' }}
            initial={{ opacity: 0, y: 35 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            Zero tickets<br />missed. Ever.
          </motion.h2>

          <motion.div
            style={{ display: 'flex', gap: '3.5vw' }}
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { label: 'Live queue', sub: 'New orders instantly' },
              { label: 'Color states', sub: 'New · Progress · Ready' },
              { label: '1-tap done', sub: 'No verbal handoff' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5vw', fontWeight: 700, color: '#eef3f2', marginBottom: '0.4vh' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.2vw', color: '#7aacaa' }}>{item.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Accent left edge */}
      <motion.div
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.3vw', background: 'linear-gradient(to bottom, transparent, #426564, transparent)' }}
        initial={{ scaleY: 0 }}
        animate={phase >= 1 ? { scaleY: 1 } : {}}
        transition={{ duration: 0.8, ease: 'circOut' }}
      />
    </motion.div>
  );
}
