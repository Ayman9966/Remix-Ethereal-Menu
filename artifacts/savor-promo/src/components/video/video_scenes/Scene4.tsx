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

  const stats = [
    { value: '$8,912', label: 'This week' },
    { value: '200', label: 'Total orders' },
    { value: '#1', label: 'Lava Cake' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left copy */}
      <div className="relative z-10 flex flex-col justify-center" style={{ width: '42%', paddingLeft: '8vw', flexShrink: 0 }}>
        <motion.span
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.1vw', color: '#5d918f', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.5vh' }}
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Analytics
        </motion.span>

        <motion.h2
          style={{ fontFamily: 'var(--font-display)', fontSize: '5.2vw', fontWeight: 900, color: '#eef3f2', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '4vh' }}
          initial={{ opacity: 0, y: 35 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          Data that<br />drives decisions.
        </motion.h2>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.12 }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3vw', fontWeight: 800, color: '#5d918f', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.2vw', color: 'rgba(122,172,170,0.7)', marginTop: '0.4vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right: real screenshot bleed */}
      <motion.div
        className="absolute"
        style={{ top: '6vh', bottom: '6vh', right: 0, left: '40%', borderRadius: '1.5vw 0 0 1.5vw', overflow: 'hidden', border: '1px solid rgba(93,145,143,0.2)', borderRight: 'none', boxShadow: '-2vw 0 5vw rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0, x: 80 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <img src="/ss-admin.jpg" alt="Analytics" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12,20,18,0.25) 0%, transparent 25%)', pointerEvents: 'none' }} />
      </motion.div>
    </motion.div>
  );
}
