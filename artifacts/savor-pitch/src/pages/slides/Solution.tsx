export default function Solution() {
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
          style={{ fontSize: '4vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '5vh' }}
        >
          Six views. One live system.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vw', flex: 1 }}>
          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Digital Menu
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              QR-based, no app download. Guests scan and order from any device.
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Kitchen Display
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              Live ticket queue with urgency states. No paper. No missed orders.
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Point of Sale
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              Tableside or counter orders with auto receipt printing.
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Board Display
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              Live signage showing order status — visible to waiting guests.
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Analytics
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              Revenue trends, top items, peak hours — updated in real time.
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.2vw', border: '1px solid rgba(93,145,143,0.15)' }}>
            <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2', marginBottom: '1.2vh' }}>
              Admin Panel
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.5 }}>
              Full menu management, branding, table config, and staff access.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
