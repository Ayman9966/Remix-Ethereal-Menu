export default function Analytics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(145deg, #162220 0%, #0c1412 60%)' }}
      />

      <div className="absolute inset-0 flex" style={{ paddingLeft: '8vw', paddingRight: '0', paddingTop: '8vh', paddingBottom: '6vh' }}>
        <div style={{ width: '38vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '4vw' }}>
          <span
            className="font-body font-medium uppercase tracking-widest"
            style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '1.5vh' }}
          >
            Analytics
          </span>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: '3.8vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '4vh' }}
          >
            Decisions backed by live data.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>Revenue trends</div>
                <div className="font-body" style={{ fontSize: '1.45vw', color: '#7aacaa', lineHeight: 1.4 }}>Daily and weekly totals updated in real time</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>Top-selling items</div>
                <div className="font-body" style={{ fontSize: '1.45vw', color: '#7aacaa', lineHeight: 1.4 }}>Know what sells and what to cut from the menu</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>Peak hour mapping</div>
                <div className="font-body" style={{ fontSize: '1.45vw', color: '#7aacaa', lineHeight: 1.4 }}>Staff schedules to the minute your rush hits</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 0, top: '6vh', bottom: '6vh', right: 0,
            borderRadius: '1.5vw 0 0 1.5vw',
            overflow: 'hidden',
            border: '1px solid rgba(93,145,143,0.2)',
            borderRight: 'none',
            boxShadow: '-2vw 0 4vw rgba(0,0,0,0.4)',
          }}>
            <img
              src="/ss-admin.jpg"
              alt="Analytics dashboard"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(12,20,18,0.15) 0%, transparent 30%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
