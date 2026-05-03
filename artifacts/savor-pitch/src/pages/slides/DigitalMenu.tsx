export default function DigitalMenu() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ top: 0, right: 0, width: '50vw', height: '100vh', background: '#162220' }}
      />

      <div className="absolute inset-0 flex" style={{ paddingLeft: '8vw', paddingRight: '8vw', paddingTop: '8vh', paddingBottom: '8vh' }}>
        <div style={{ width: '45vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '4vw' }}>
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

        <div style={{ width: '38vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '22vw', background: '#0c1412', borderRadius: '2vw', overflow: 'hidden', border: '1px solid rgba(93,145,143,0.2)', boxShadow: '0 2vw 4vw rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#426564', padding: '2.5vh 2vw', textAlign: 'center' }}>
              <div className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#eef3f2' }}>Savor1</div>
              <div className="font-body" style={{ fontSize: '1.2vw', color: 'rgba(238,243,242,0.65)' }}>Modern Dining</div>
            </div>
            <div style={{ padding: '1.5vh 1.5vw', background: '#111d1b' }}>
              <div className="font-body" style={{ fontSize: '1.2vw', color: '#7aacaa', background: 'rgba(93,145,143,0.1)', padding: '0.8vh 1vw', borderRadius: '0.8vw', marginBottom: '1.5vh' }}>
                Search menu...
              </div>
              <div style={{ display: 'flex', gap: '0.6vw', marginBottom: '1.5vh' }}>
                <div style={{ background: '#426564', borderRadius: '2vw', padding: '0.4vh 1vw' }}>
                  <span className="font-body font-medium" style={{ fontSize: '1.1vw', color: '#eef3f2' }}>All</span>
                </div>
                <div style={{ background: 'rgba(93,145,143,0.12)', borderRadius: '2vw', padding: '0.4vh 1vw' }}>
                  <span className="font-body" style={{ fontSize: '1.1vw', color: '#7aacaa' }}>Starters</span>
                </div>
                <div style={{ background: 'rgba(93,145,143,0.12)', borderRadius: '2vw', padding: '0.4vh 1vw' }}>
                  <span className="font-body" style={{ fontSize: '1.1vw', color: '#7aacaa' }}>Mains</span>
                </div>
              </div>
              <div style={{ background: 'rgba(93,145,143,0.07)', borderRadius: '1vw', padding: '1.2vh 1vw', marginBottom: '0.8vh', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="font-display font-semibold" style={{ fontSize: '1.3vw', color: '#eef3f2' }}>Grilled Octopus</div>
                  <div className="font-body" style={{ fontSize: '1.1vw', color: '#7aacaa' }}>18.00</div>
                </div>
                <div style={{ width: '2.2vw', height: '2.2vw', background: '#426564', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-display font-bold" style={{ fontSize: '1.5vw', color: '#eef3f2', lineHeight: 1 }}>+</span>
                </div>
              </div>
              <div style={{ background: 'rgba(93,145,143,0.07)', borderRadius: '1vw', padding: '1.2vh 1vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="font-display font-semibold" style={{ fontSize: '1.3vw', color: '#eef3f2' }}>Crispy Calamari</div>
                  <div className="font-body" style={{ fontSize: '1.1vw', color: '#7aacaa' }}>14.00</div>
                </div>
                <div style={{ width: '2.2vw', height: '2.2vw', background: '#426564', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-display font-bold" style={{ fontSize: '1.5vw', color: '#eef3f2', lineHeight: 1 }}>+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
