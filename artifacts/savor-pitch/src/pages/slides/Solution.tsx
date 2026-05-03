export default function Solution() {
  const modules = [
    { label: 'Digital Menu', desc: 'QR-based, no app. Guests scan and order from any device.', img: '/ss-menu.jpg' },
    { label: 'Kitchen Display', desc: 'Live ticket queue with urgency states. No paper, no missed orders.', img: '/ss-kitchen.jpg' },
    { label: 'Point of Sale', desc: 'Tableside or counter orders with auto receipt printing.', img: '/ss-pos.jpg' },
    { label: 'Board Display', desc: 'Live signage showing order status — visible to waiting guests.', img: '/ss-board.jpg' },
    { label: 'Analytics', desc: 'Revenue trends, top items, peak hours — updated in real time.', img: '/ss-admin.jpg' },
    { label: 'Admin Panel', desc: 'Full menu management, branding, table config, and staff access.', img: '/ss-admin.jpg' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ top: '-10vh', left: '-10vw', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.08) 0%, transparent 65%)', pointerEvents: 'none' }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ paddingLeft: '8vw', paddingRight: '8vw', paddingTop: '8vh', paddingBottom: '6vh' }}>
        <span
          className="font-body font-medium uppercase tracking-widest"
          style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '1.5vh' }}
        >
          The Platform
        </span>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '4vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '4vh' }}
        >
          Six views. One live system.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vw', flex: 1 }}>
          {modules.map((m) => (
            <div key={m.label} style={{ background: '#162220', borderRadius: '1.2vw', border: '1px solid rgba(93,145,143,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '12vh', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={m.img}
                  alt={m.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                />
              </div>
              <div style={{ padding: '1.8vh 1.8vw', flex: 1 }}>
                <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.8vh' }}>
                  {m.label}
                </div>
                <div className="font-body" style={{ fontSize: '1.3vw', color: '#7aacaa', lineHeight: 1.5 }}>
                  {m.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
