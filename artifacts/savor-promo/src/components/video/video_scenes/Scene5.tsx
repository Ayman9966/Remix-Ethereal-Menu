import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const screenshots = [
    { src: '/ss-menu.jpg', rotate: -4, x: '-28vw', y: '-12vh', scale: 0.72 },
    { src: '/ss-kitchen.jpg', rotate: 3, x: '28vw', y: '-10vh', scale: 0.78 },
    { src: '/ss-pos.jpg', rotate: -2, x: '-32vw', y: '18vh', scale: 0.68 },
    { src: '/ss-admin.jpg', rotate: 2.5, x: '30vw', y: '20vh', scale: 0.76 },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: '#0c1412' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Radial centre glow */}
      <div style={{ position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.22) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

      {/* Background screenshot tiles */}
      {screenshots.map((s, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', borderRadius: '1.2vw', overflow: 'hidden', border: '1px solid rgba(93,145,143,0.18)', boxShadow: '0 1.5vw 4vw rgba(0,0,0,0.5)', top: '50%', left: '50%', width: '36vw', aspectRatio: '16/10', transform: `translate(-50%,-50%) translateX(${s.x}) translateY(${s.y}) rotate(${s.rotate}deg) scale(${s.scale})` }}
          initial={{ opacity: 0, scale: s.scale * 0.85 }}
          animate={phase >= 1 ? { opacity: 0.55, scale: s.scale } : {}}
          transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
        >
          <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </motion.div>
      ))}

      {/* Frosted centre card */}
      <motion.div
        style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '4vh 5vw', borderRadius: '2vw', background: 'rgba(12,20,18,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(93,145,143,0.25)', boxShadow: '0 2vw 6vw rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* Logo */}
        <motion.div
          style={{ width: '4.5vw', height: '4.5vw', borderRadius: '1.2vw', background: '#426564', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2vh', boxShadow: '0 0 2.5vw rgba(66,101,100,0.5)' }}
          initial={{ scale: 0, rotate: -15 }}
          animate={phase >= 2 ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
          </svg>
        </motion.div>

        {/* Big wordmark */}
        <div style={{ perspective: '800px', overflow: 'hidden' }}>
          <motion.h1
            style={{ fontFamily: 'var(--font-display)', fontSize: '10vw', fontWeight: 900, color: '#eef3f2', lineHeight: 0.9, letterSpacing: '-0.04em' }}
            initial={{ opacity: 0, y: '40%', rotateX: -20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            Savor
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.6vw', color: '#7aacaa', marginTop: '1.5vh', letterSpacing: '0.04em' }}
          initial={{ opacity: 0, y: 15 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Run your restaurant beautifully.
        </motion.p>

        {/* Divider line */}
        <motion.div
          className="mx-auto mt-5"
          style={{ height: '2px', background: 'linear-gradient(to right, transparent, #426564, transparent)', borderRadius: '2px' }}
          initial={{ width: 0 }}
          animate={phase >= 4 ? { width: '12vw' } : {}}
          transition={{ duration: 0.7, ease: 'circOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
