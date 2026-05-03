export default function HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ bottom: '-8vh', right: '-5vw', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.1) 0%, transparent 65%)', pointerEvents: 'none' }}
      />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        <span
          className="font-body font-medium uppercase tracking-widest"
          style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '2vh' }}
        >
          How It Works
        </span>

        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '4vw', color: '#eef3f2', lineHeight: 1.1, marginBottom: '6vh' }}
        >
          From scan to kitchen in under 10 seconds
        </h2>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18vw' }}>
            <div style={{ width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: '#426564', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vh' }}>
              <span className="font-display font-extrabold" style={{ fontSize: '2vw', color: '#eef3f2' }}>1</span>
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '1vh', textAlign: 'center' }}>
              Guest scans QR
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', textAlign: 'center', lineHeight: 1.4 }}>
              No app. Menu opens in browser instantly.
            </div>
          </div>

          <div style={{ flex: 1, height: '1px', background: 'rgba(93,145,143,0.3)', marginTop: '2.2vw', alignSelf: 'flex-start' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18vw' }}>
            <div style={{ width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: '#426564', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vh' }}>
              <span className="font-display font-extrabold" style={{ fontSize: '2vw', color: '#eef3f2' }}>2</span>
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '1vh', textAlign: 'center' }}>
              Order placed
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', textAlign: 'center', lineHeight: 1.4 }}>
              Items added to cart, submitted with one tap.
            </div>
          </div>

          <div style={{ flex: 1, height: '1px', background: 'rgba(93,145,143,0.3)', marginTop: '2.2vw', alignSelf: 'flex-start' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18vw' }}>
            <div style={{ width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: '#426564', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vh' }}>
              <span className="font-display font-extrabold" style={{ fontSize: '2vw', color: '#eef3f2' }}>3</span>
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '1vh', textAlign: 'center' }}>
              Kitchen notified
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', textAlign: 'center', lineHeight: 1.4 }}>
              Ticket appears on KDS instantly. Status updates live.
            </div>
          </div>

          <div style={{ flex: 1, height: '1px', background: 'rgba(93,145,143,0.3)', marginTop: '2.2vw', alignSelf: 'flex-start' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18vw' }}>
            <div style={{ width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: '#426564', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vh' }}>
              <span className="font-display font-extrabold" style={{ fontSize: '2vw', color: '#eef3f2' }}>4</span>
            </div>
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '1vh', textAlign: 'center' }}>
              Data recorded
            </div>
            <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', textAlign: 'center', lineHeight: 1.4 }}>
              Revenue, items, timing — logged for analytics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
