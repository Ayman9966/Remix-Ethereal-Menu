const base = import.meta.env.BASE_URL;

export default function Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <img
        src={`${base}hero-restaurant.png`}
        crossOrigin="anonymous"
        alt="Restaurant"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.18 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(12,20,18,0.98) 35%, rgba(22,34,32,0.85) 100%)' }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        <div
          style={{ width: '5vw', height: '2px', background: '#426564', marginBottom: '4vh' }}
        />

        <h2
          className="font-display font-extrabold tracking-tight text-center"
          style={{ fontSize: '6vw', color: '#eef3f2', lineHeight: 1, marginBottom: '3vh', textWrap: 'balance' }}
        >
          Ready to run your restaurant smarter?
        </h2>

        <p
          className="font-body text-center"
          style={{ fontSize: '1.8vw', color: '#7aacaa', maxWidth: '40vw', lineHeight: 1.5, marginBottom: '5vh', textWrap: 'pretty' }}
        >
          Savor is live today. Set up takes minutes — no hardware, no app downloads, no training required.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
          <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f' }} />
          <span className="font-body font-medium" style={{ fontSize: '1.6vw', color: '#5d918f' }}>
            savor.app
          </span>
          <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#5d918f' }} />
        </div>
      </div>

      <div
        className="absolute"
        style={{ right: '-5vw', top: '50%', transform: 'translateY(-50%)', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,101,100,0.15) 0%, transparent 65%)', pointerEvents: 'none' }}
      />
    </div>
  );
}
