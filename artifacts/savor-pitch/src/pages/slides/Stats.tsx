export default function Stats() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #162220 0%, #0c1412 55%)' }}
      />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        <span
          className="font-body font-medium uppercase tracking-widest"
          style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '2vh' }}
        >
          Built for scale
        </span>

        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '4vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '6vh' }}
        >
          Everything syncs. Nothing waits.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3vw' }}>
          <div>
            <div className="font-display font-extrabold" style={{ fontSize: '9vw', color: '#426564', lineHeight: 1 }}>
              6
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginTop: '1vh', marginBottom: '0.8vh' }}>
              Connected modules
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
              Menu, POS, kitchen, board, analytics, admin
            </div>
          </div>

          <div>
            <div className="font-display font-extrabold" style={{ fontSize: '9vw', color: '#426564', lineHeight: 1 }}>
              &lt;1s
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginTop: '1vh', marginBottom: '0.8vh' }}>
              Cross-device sync
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
              Order placed on mobile, kitchen sees it instantly
            </div>
          </div>

          <div>
            <div className="font-display font-extrabold" style={{ fontSize: '9vw', color: '#426564', lineHeight: 1 }}>
              0
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginTop: '1vh', marginBottom: '0.8vh' }}>
              Minutes to set up
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
              Scan a QR, your menu is live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
