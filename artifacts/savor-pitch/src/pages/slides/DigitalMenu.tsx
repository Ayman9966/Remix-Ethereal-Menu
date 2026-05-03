export default function DigitalMenu() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ top: 0, right: 0, width: '50vw', height: '100vh', background: '#162220' }}
      />

      <div className="absolute inset-0 flex" style={{ paddingLeft: '8vw', paddingRight: '6vw', paddingTop: '8vh', paddingBottom: '8vh' }}>
        <div style={{ width: '44vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '4vw' }}>
          <span
            className="font-body font-medium uppercase tracking-widest"
            style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '2vh' }}
          >
            Digital Menu
          </span>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: '3.8vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '4vh', textWrap: 'balance' }}
          >
            Guests scan once. Order from any device.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>No app download required</div>
                <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>QR code opens the menu directly in the browser</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>Live menu updates</div>
                <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>Price or item changes appear instantly — no reprint</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(66,101,100,0.25)', border: '1px solid #426564', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#5d918f' }} />
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#eef3f2', marginBottom: '0.4vh' }}>Category filtering</div>
                <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>Guests browse by section, search, and add to cart</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: '42vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '21vw' }}>
            <div style={{
              width: '21vw',
              aspectRatio: '9/19',
              background: '#111d1b',
              borderRadius: '2.5vw',
              overflow: 'hidden',
              border: '0.25vw solid rgba(93,145,143,0.35)',
              boxShadow: '0 2vw 5vw rgba(0,0,0,0.55), 0 0 0 0.1vw rgba(93,145,143,0.1)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '2.8vh',
                background: '#111d1b',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: '5vw', height: '0.6vh', background: 'rgba(93,145,143,0.3)', borderRadius: '1vw' }} />
              </div>
              <img
                src="/ss-menu.jpg"
                alt="Digital Menu"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '2.5vw',
                boxShadow: 'inset 0 0 0 0.25vw rgba(93,145,143,0.2)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
