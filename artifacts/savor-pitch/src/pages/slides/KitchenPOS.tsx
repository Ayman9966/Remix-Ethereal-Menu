export default function KitchenPOS() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ bottom: '-12vh', left: '-8vw', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.07) 0%, transparent 65%)', pointerEvents: 'none' }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ paddingLeft: '8vw', paddingRight: '8vw', paddingTop: '8vh', paddingBottom: '6vh' }}>
        <span
          className="font-body font-medium uppercase tracking-widest"
          style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '1.5vh' }}
        >
          Kitchen + Point of Sale
        </span>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '3.8vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '5vh' }}
        >
          Back-of-house runs itself.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3vw', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.5vw', border: '1px solid rgba(93,145,143,0.12)', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2vh' }}>
                <div style={{ width: '3vw', height: '3vw', background: 'rgba(66,101,100,0.2)', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '1.2vw', height: '1.2vw', background: '#5d918f', borderRadius: '0.2vw' }} />
                </div>
                <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2' }}>Kitchen Display</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>Live ticket queue — new orders appear instantly</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>Urgency color states: new, in progress, ready</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>One tap to mark complete — no verbal handoff</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.5vw', border: '1px solid rgba(93,145,143,0.12)', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2vh' }}>
                <div style={{ width: '3vw', height: '3vw', background: 'rgba(66,101,100,0.2)', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '1.2vw', height: '0.8vw', background: '#5d918f', borderRadius: '0.2vw' }} />
                </div>
                <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#eef3f2' }}>Point of Sale</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>Tableside or counter ordering on any device</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>Auto receipt printing — 80mm and 58mm support</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa' }}>Orders sync to kitchen display in real time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
