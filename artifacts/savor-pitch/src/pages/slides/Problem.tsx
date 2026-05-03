export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute"
        style={{ top: 0, right: 0, width: '45vw', height: '100vh', background: 'linear-gradient(135deg, #162220 0%, #0f1b19 100%)', clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)' }}
      />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        <span
          className="font-body font-medium uppercase tracking-widest"
          style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.16em', marginBottom: '2vh' }}
        >
          The Problem
        </span>

        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '4.5vw', color: '#eef3f2', lineHeight: 1.1, maxWidth: '45vw', textWrap: 'balance', marginBottom: '5vh' }}
        >
          Restaurants run on disconnected, paper-based systems
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2vw' }}>
            <div style={{ width: '0.4vw', height: '4.5vh', background: '#426564', borderRadius: '2px', flexShrink: 0, marginTop: '0.4vh' }} />
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '0.5vh' }}>
                Orders lost in translation
              </div>
              <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
                Handwritten tickets cause kitchen errors and slow service
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2vw' }}>
            <div style={{ width: '0.4vw', height: '4.5vh', background: '#426564', borderRadius: '2px', flexShrink: 0, marginTop: '0.4vh' }} />
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '0.5vh' }}>
                No real-time visibility
              </div>
              <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
                Managers can't track sales, peak hours, or top items live
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2vw' }}>
            <div style={{ width: '0.4vw', height: '4.5vh', background: '#426564', borderRadius: '2px', flexShrink: 0, marginTop: '0.4vh' }} />
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#eef3f2', marginBottom: '0.5vh' }}>
                Menus that can't keep up
              </div>
              <div className="font-body" style={{ fontSize: '1.5vw', color: '#7aacaa', lineHeight: 1.4 }}>
                Printed menus are outdated the moment prices or dishes change
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
