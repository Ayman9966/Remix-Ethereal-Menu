import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Browser chrome frame — correct 16:9 landscape container for all 1280x720 screenshots
function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{
      borderRadius: '0.8vw',
      overflow: 'hidden',
      border: '1px solid rgba(93,145,143,0.3)',
      boxShadow: '0 2vw 6vw rgba(0,0,0,0.7)',
      background: '#1a2b29',
    }}>
      {/* Chrome bar */}
      <div style={{
        height: '2.8vh',
        background: '#1e3330',
        borderBottom: '1px solid rgba(93,145,143,0.15)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1vw',
        gap: '0.5vw',
        flexShrink: 0,
      }}>
        <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#426564', opacity: 0.7 }} />
        <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#5d918f', opacity: 0.5 }} />
        <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#7aacaa', opacity: 0.3 }} />
        <div style={{
          flex: 1,
          marginLeft: '0.8vw',
          height: '1.4vh',
          background: 'rgba(93,145,143,0.12)',
          borderRadius: '0.4vw',
        }} />
      </div>
      {/* Screenshot — 16:9 ratio */}
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', width: '100%' }}>
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
        />
      </div>
    </div>
  );
}

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
      <div className="absolute inset-y-0 right-0" style={{ width: '56%', background: '#162220' }} />

      {/* Left: copy */}
      <div className="relative z-10 flex flex-col justify-center" style={{ width: '44%', paddingLeft: '8vw', paddingRight: '3vw' }}>
        <motion.span
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: '#5d918f', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.5vh' }}
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Digital Menu
        </motion.span>

        <motion.h2
          style={{ fontFamily: 'var(--font-display)', fontSize: '5vw', fontWeight: 900, color: '#eef3f2', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '3.5vh' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          Scan.<br />Order.<br />Done.
        </motion.h2>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.6vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {['No app download required', 'Live menu updates instantly', 'Works on any device'].map((txt) => (
            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
              <div style={{ width: '0.45vw', height: '0.45vw', borderRadius: '50%', background: '#426564', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.5vw', color: '#7aacaa' }}>{txt}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: browser frame with real 16:9 screenshot */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: '56%', padding: '4vh 4vw 4vh 2vw' }}>
        <motion.div
          style={{ width: '100%' }}
          initial={{ opacity: 0, y: 50, rotate: 1.5 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, rotate: -0.5 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <BrowserFrame src="/ss-menu.jpg" alt="Digital Menu" />
        </motion.div>
      </div>
    </motion.div>
  );
}
