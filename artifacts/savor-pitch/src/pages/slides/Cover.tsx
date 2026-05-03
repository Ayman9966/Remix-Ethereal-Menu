const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <img
        src={`${base}hero-restaurant.png`}
        crossOrigin="anonymous"
        alt="Restaurant interior"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(120deg, rgba(12,20,18,0.97) 40%, rgba(12,20,18,0.6) 100%)' }}
      />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        <div style={{ marginBottom: '2.5vh' }}>
          <span
            className="font-body font-medium tracking-widest uppercase"
            style={{ fontSize: '1.2vw', color: '#5d918f', letterSpacing: '0.18em' }}
          >
            Restaurant Management Platform
          </span>
        </div>

        <h1
          className="font-display font-extrabold tracking-tight"
          style={{ fontSize: '8vw', color: '#eef3f2', lineHeight: 1, textWrap: 'balance', marginBottom: '3vh' }}
        >
          Savor
        </h1>

        <p
          className="font-body"
          style={{ fontSize: '2vw', color: '#7aacaa', maxWidth: '38vw', lineHeight: 1.45, textWrap: 'pretty' }}
        >
          Digital menu, kitchen display, POS, and analytics — one platform, zero paper.
        </p>

        <div style={{ marginTop: '5vh', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ width: '3vw', height: '2px', background: '#426564' }} />
          <span className="font-body" style={{ fontSize: '1.5vw', color: '#5d918f' }}>
            Demo · 2026
          </span>
        </div>
      </div>

      <div
        className="absolute"
        style={{ right: '8vw', bottom: '8vh', width: '28vw', height: '28vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}
      />
    </div>
  );
}
