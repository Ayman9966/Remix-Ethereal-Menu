import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 750),
      setTimeout(() => setPhase(3), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: copy area */}
      <div className="relative z-10 flex flex-col justify-center" style={{ width: '40%', paddingLeft: '8vw', flexShrink: 0 }}>
        <motion.span
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: '#5d918f', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.5vh' }}
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Analytics
        </motion.span>

        <motion.h2
          style={{ fontFamily: 'var(--font-display)', fontSize: '5vw', fontWeight: 900, color: '#eef3f2', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '4vh' }}
          initial={{ opacity: 0, y: 35 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          Data that<br />drives<br />decisions.
        </motion.h2>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {[
            { value: '$8,912', label: 'This week' },
            { value: '200', label: 'Orders' },
            { value: '#1', label: 'Top item' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8vw', fontWeight: 800, color: '#5d918f', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: 'rgba(122,172,170,0.65)', marginTop: '0.3vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right: real 16:9 screenshot in a browser frame sliding in */}
      <motion.div
        style={{ position: 'absolute', top: '6vh', bottom: '6vh', right: 0, left: '38%' }}
        initial={{ opacity: 0, x: 100 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      >
        <div style={{
          height: '100%',
          borderRadius: '1.2vw 0 0 1.2vw',
          overflow: 'hidden',
          border: '1px solid rgba(93,145,143,0.22)',
          borderRight: 'none',
          boxShadow: '-2vw 0 6vw rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a2b29',
        }}>
          {/* Browser chrome */}
          <div style={{ height: '2.8vh', background: '#1e3330', borderBottom: '1px solid rgba(93,145,143,0.15)', display: 'flex', alignItems: 'center', padding: '0 1vw', gap: '0.5vw', flexShrink: 0 }}>
            <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#426564', opacity: 0.7 }} />
            <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#5d918f', opacity: 0.5 }} />
            <div style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#7aacaa', opacity: 0.3 }} />
            <div style={{ flex: 1, marginLeft: '0.8vw', height: '1.4vh', background: 'rgba(93,145,143,0.1)', borderRadius: '0.4vw' }} />
          </div>
          {/* Screenshot fills remaining height */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <img
              src="/ss-admin.jpg"
              alt="Analytics Dashboard"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12,20,18,0.2) 0%, transparent 20%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
