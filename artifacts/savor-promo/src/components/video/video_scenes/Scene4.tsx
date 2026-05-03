import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const bars = [
    { label: 'Mon', height: '55%', value: '$1.2k' },
    { label: 'Tue', height: '70%', value: '$1.6k' },
    { label: 'Wed', height: '48%', value: '$1.1k' },
    { label: 'Thu', height: '82%', value: '$1.9k' },
    { label: 'Fri', height: '95%', value: '$2.2k' },
    { label: 'Sat', height: '88%', value: '$2.0k' },
    { label: 'Sun', height: '60%', value: '$1.4k' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center px-24 bg-[var(--color-bg-light)]"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-1/2 pr-16">
        <motion.div
          className="text-sm font-bold tracking-widest text-[var(--color-primary)] uppercase mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          Admin Analytics
        </motion.div>
        <motion.h2
          className="text-[4.5vw] font-bold text-[var(--color-text-primary)] leading-[1.1] text-balance"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          Revenue insights at a glance
        </motion.h2>
        <motion.div
          className="flex gap-8 mt-10"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {[
            { label: 'This Week', value: '$11.4k' },
            { label: 'Avg Cover', value: '$28' },
            { label: 'Top Item', value: 'Risotto' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-[2.2vw] font-bold text-[var(--color-primary)]">{stat.value}</div>
              <div className="text-[1vw] text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="w-1/2 flex flex-col">
        <motion.div
          className="bg-white rounded-2xl border border-[var(--color-bg-muted)] p-8 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-6">Weekly Revenue</div>
          <div className="flex items-end gap-3 h-[180px]">
            {bars.map((bar, i) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-t-lg bg-[var(--color-primary)]"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 2 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: 'circOut' }}
                  style={{ originY: 1, height: bar.height }}
                />
                <div className="text-[0.7vw] text-[var(--color-text-muted)]">{bar.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
