export default function Analytics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0c1412' }}>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(145deg, #162220 0%, #0c1412 60%)' }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ paddingLeft: '8vw', paddingRight: '8vw', paddingTop: '8vh', paddingBottom: '6vh' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '2vw', flex: 1 }}>
          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2.5vw', border: '1px solid rgba(93,145,143,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div className="font-body" style={{ fontSize: '1.2vw', color: '#5d918f', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Revenue — 7 days</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.6vw', paddingTop: '1vh' }}>
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.25)', borderRadius: '0.3vw 0.3vw 0 0', height: '55%' }} />
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.35)', borderRadius: '0.3vw 0.3vw 0 0', height: '70%' }} />
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.3)', borderRadius: '0.3vw 0.3vw 0 0', height: '60%' }} />
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.45)', borderRadius: '0.3vw 0.3vw 0 0', height: '80%' }} />
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.35)', borderRadius: '0.3vw 0.3vw 0 0', height: '65%' }} />
              <div style={{ flex: 1, background: '#426564', borderRadius: '0.3vw 0.3vw 0 0', height: '90%' }} />
              <div style={{ flex: 1, background: 'rgba(66,101,100,0.4)', borderRadius: '0.3vw 0.3vw 0 0', height: '75%' }} />
            </div>
            <div style={{ borderTop: '1px solid rgba(93,145,143,0.15)', marginTop: '1.5vh', paddingTop: '1.5vh' }}>
              <div className="font-display font-bold" style={{ fontSize: '2.5vw', color: '#eef3f2' }}>8,912</div>
              <div className="font-body" style={{ fontSize: '1.3vw', color: '#7aacaa' }}>Total revenue this week</div>
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2vw', border: '1px solid rgba(93,145,143,0.12)', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div className="font-body" style={{ fontSize: '1.2vw', color: '#5d918f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Items</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <span className="font-body" style={{ fontSize: '1.4vw', color: '#eef3f2' }}>Grilled Octopus</span>
                  <span className="font-body font-medium" style={{ fontSize: '1.4vw', color: '#5d918f' }}>47</span>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(93,145,143,0.15)', borderRadius: '1vw', overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', background: '#426564', borderRadius: '1vw' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <span className="font-body" style={{ fontSize: '1.4vw', color: '#eef3f2' }}>Crispy Calamari</span>
                  <span className="font-body font-medium" style={{ fontSize: '1.4vw', color: '#5d918f' }}>38</span>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(93,145,143,0.15)', borderRadius: '1vw', overflow: 'hidden' }}>
                  <div style={{ width: '72%', height: '100%', background: '#426564', borderRadius: '1vw' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <span className="font-body" style={{ fontSize: '1.4vw', color: '#eef3f2' }}>Pan-Seared Salmon</span>
                  <span className="font-body font-medium" style={{ fontSize: '1.4vw', color: '#5d918f' }}>29</span>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(93,145,143,0.15)', borderRadius: '1vw', overflow: 'hidden' }}>
                  <div style={{ width: '55%', height: '100%', background: '#426564', borderRadius: '1vw' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#162220', borderRadius: '1.2vw', padding: '3vh 2vw', border: '1px solid rgba(93,145,143,0.12)', display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
            <div className="font-body" style={{ fontSize: '1.2vw', color: '#5d918f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Peak Hours</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.5vw', paddingTop: '1vh' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: 'rgba(66,101,100,0.2)', borderRadius: '0.2vw 0.2vw 0 0', height: '20%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>10</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: 'rgba(66,101,100,0.35)', borderRadius: '0.2vw 0.2vw 0 0', height: '45%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>12</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: 'rgba(66,101,100,0.5)', borderRadius: '0.2vw 0.2vw 0 0', height: '65%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>14</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: '#426564', borderRadius: '0.2vw 0.2vw 0 0', height: '90%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>19</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: 'rgba(66,101,100,0.55)', borderRadius: '0.2vw 0.2vw 0 0', height: '72%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>20</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                <div style={{ width: '100%', background: 'rgba(66,101,100,0.3)', borderRadius: '0.2vw 0.2vw 0 0', height: '40%' }} />
                <span className="font-body" style={{ fontSize: '1vw', color: '#7aacaa' }}>21</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(93,145,143,0.15)', paddingTop: '1.5vh' }}>
              <div className="font-body" style={{ fontSize: '1.3vw', color: '#7aacaa', lineHeight: 1.4 }}>Peak at 7pm — staff accordingly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
