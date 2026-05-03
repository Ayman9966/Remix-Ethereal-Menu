import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import {
  UtensilsCrossed, ChefHat, MonitorPlay, BarChart2, Settings2,
  ShoppingCart, Globe, ArrowRight, Check, QrCode,
  Printer, Zap, RefreshCw,
} from 'lucide-react';

export const Route = createFileRoute('/landing')({
  head: () => ({
    meta: [
      { title: 'Savor — Restaurant Management SaaS' },
      { name: 'description', content: 'Digital menu, POS, kitchen display, board signage and analytics — all in one platform.' },
    ],
  }),
  component: LandingPage,
});

const ACCENT = '#426564';

/* ─── screen-cut config ───────────────────────────────────────────── */
const MODULES = [
  {
    id: 'menu',
    label: 'Digital Menu',
    icon: Globe,
    screenshot: '/ss-menu.jpg',
    // crop: show the food list area
    cut: { objectPosition: 'center 50%', height: 480 },
    mobile: true,
    url: '/t/1',
  },
  {
    id: 'pos',
    label: 'Point of Sale',
    icon: ShoppingCart,
    screenshot: '/ss-pos.jpg',
    cut: { objectPosition: 'center 15%', height: 420 },
    mobile: false,
    url: '/pos',
  },
  {
    id: 'kitchen',
    label: 'Kitchen Display',
    icon: ChefHat,
    screenshot: '/ss-kitchen.jpg',
    cut: { objectPosition: 'center 20%', height: 420 },
    mobile: false,
    url: '/kitchen',
  },
  {
    id: 'board',
    label: 'Board Display',
    icon: MonitorPlay,
    screenshot: '/ss-board.jpg',
    cut: { objectPosition: 'center 30%', height: 420 },
    mobile: false,
    url: '/board',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart2,
    screenshot: '/ss-admin.jpg',
    cut: { objectPosition: 'center 55%', height: 420 },
    mobile: false,
    url: '/admin',
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings2,
    screenshot: '/ss-admin.jpg',
    cut: { objectPosition: 'center 10%', height: 420 },
    mobile: false,
    url: '/admin',
  },
];

/* ─── Static mock menu screen (no iframe, instant load) ─────────── */
const MOCK_ITEMS = [
  { name: 'Grilled Octopus',      desc: 'Smoked paprika, crispy potatoes & chimichurri', price: '18.00', emoji: '🐙', badge: 'Popular' },
  { name: 'Crispy Calamari',      desc: 'Lightly battered, served with marinara & lemon', price: '14.00', emoji: '🦑', badge: null },
  { name: 'Truffle Mac Bites',    desc: 'Creamy macaroni, white truffle oil drizzle',    price: '12.00', emoji: '🧀', badge: null },
  { name: 'Pan-Seared Salmon',    desc: 'Seasonal vegetables, lemon butter sauce',       price: '28.00', emoji: '🐟', badge: 'Chef Pick' },
  { name: 'Molten Lava Cake',     desc: 'Warm chocolate cake, vanilla ice cream',        price: '9.00',  emoji: '🍫', badge: null },
];

function MockMenuScreen() {
  const s: Record<string, React.CSSProperties> = {
    root:    { width: '100%', background: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif', overflowY: 'auto', height: '100%' },
    header:  { background: ACCENT, padding: '22px 16px 16px', textAlign: 'center' },
    logo:    { color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' },
    tagline: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
    searchWrap: { background: '#f6f6f6', padding: '8px 12px 4px' },
    search:  { background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: '6px 11px', fontSize: 10, color: '#bbb', display: 'flex', gap: 5, alignItems: 'center' },
    pills:   { display: 'flex', gap: 5, padding: '8px 12px 6px', overflowX: 'auto' as const },
    pill:    (active: boolean): React.CSSProperties => ({ background: active ? ACCENT : '#f0f0f0', color: active ? '#fff' : '#666', border: 'none', borderRadius: 20, padding: '4px 11px', fontSize: 9, fontWeight: 700, cursor: 'default', whiteSpace: 'nowrap' }),
    sectionLabel: { padding: '6px 12px 3px', fontSize: 10, fontWeight: 800, color: '#333' },
    card:    { margin: '4px 10px', background: '#fff', borderRadius: 13, padding: '9px 10px', border: '1px solid #f0f0f0', display: 'flex', gap: 9, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    img:     { width: 44, height: 44, background: '#f5f5f5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
    name:    { fontWeight: 700, fontSize: 11, color: '#1a1a1a', lineHeight: 1.2 },
    desc:    { fontSize: 9, color: '#aaa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 110 },
    price:   { fontWeight: 800, fontSize: 13, color: ACCENT, marginTop: 3 },
    addBtn:  { background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, width: 27, height: 27, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, cursor: 'default', lineHeight: 1 },
    badge:   { display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: 8, fontWeight: 700, borderRadius: 5, padding: '1px 5px', marginLeft: 5 },
    cartBar: { margin: '10px 10px 16px', background: ACCENT, borderRadius: 13, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cartTxt: { color: '#fff', fontSize: 11, fontWeight: 700 },
    cartBtn: { color: '#fff', fontSize: 9, fontWeight: 800, background: 'rgba(255,255,255,0.18)', padding: '4px 9px', borderRadius: 7 },
    callBtn: { margin: '0 10px 10px', border: `1px solid ${ACCENT}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: ACCENT },
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ fontSize: 22 }}>🍽️</div>
        <div style={s.logo}>Savor1</div>
        <div style={s.tagline}>Modern Dining, Redefined</div>
      </div>

      <div style={s.searchWrap}>
        <div style={s.search}><span>🔍</span> Search menu...</div>
      </div>

      <div style={s.pills}>
        {['All', 'Starters', 'Mains', 'Desserts', 'Drinks'].map((c, i) => (
          <button key={c} style={s.pill(i === 1)}>{c}</button>
        ))}
      </div>

      <div style={s.sectionLabel}>🟢 Starters</div>

      {MOCK_ITEMS.slice(0, 3).map(item => (
        <div key={item.name} style={s.card}>
          <div style={s.img}>{item.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.name}>
              {item.name}
              {item.badge && <span style={s.badge}>{item.badge}</span>}
            </div>
            <div style={s.desc}>{item.desc}</div>
            <div style={s.price}>{item.price}</div>
          </div>
          <div style={s.addBtn}>+</div>
        </div>
      ))}

      <div style={s.sectionLabel}>🔵 Mains</div>
      {MOCK_ITEMS.slice(3, 5).map(item => (
        <div key={item.name} style={s.card}>
          <div style={s.img}>{item.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.name}>
              {item.name}
              {item.badge && <span style={s.badge}>{item.badge}</span>}
            </div>
            <div style={s.desc}>{item.desc}</div>
            <div style={s.price}>{item.price}</div>
          </div>
          <div style={s.addBtn}>+</div>
        </div>
      ))}

      <div style={{ height: 8 }} />
      <div style={s.callBtn}>🔔 Call Waiter</div>
      <div style={s.cartBar}>
        <span style={s.cartTxt}>2 items · 32.00</span>
        <span style={s.cartBtn}>View Cart →</span>
      </div>
    </div>
  );
}

/* ─── Phone frame wrapper ────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{
        width: 272,
        border: '10px solid #1c1c1e',
        borderRadius: '2.8rem',
        background: '#000',
        boxShadow: '0 0 0 2px #3a3a3c, 0 40px 80px rgba(0,0,0,0.55)',
        height: 540,
      }}
    >
      {/* notch */}
      <div
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-2xl bg-[#1c1c1e]"
        style={{ height: 14, width: 88 }}
      />
      <div style={{ paddingTop: 14, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <MockMenuScreen />
      </div>
    </div>
  );
}

/* ─── Small phone cut (image-based, for cards) ────────────────────── */
function PhoneCut({ imgSrc, objectPosition = 'center 50%', height = 240 }: { imgSrc: string; objectPosition?: string; height?: number }) {
  return (
    <div
      className="overflow-hidden rounded-[1.6rem] shadow-xl"
      style={{ width: 176, border: '7px solid #1c1c1e', background: '#000' }}
    >
      <div className="flex justify-center bg-black" style={{ paddingTop: 6, paddingBottom: 4 }}>
        <div className="rounded-full bg-[#1c1c1e]" style={{ height: 10, width: 60 }} />
      </div>
      <img
        src={imgSrc}
        alt="Mobile view"
        className="w-full object-cover"
        style={{ height, objectPosition }}
      />
    </div>
  );
}

/* ─── Browser chrome mockup ──────────────────────────────────────── */
function BrowserMockup({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ background: '#111' }}>
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#1c1c1e] px-4 py-2.5">
        <div className="flex gap-1.5 shrink-0">
          <span className="block h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <span className="rounded-md bg-[#2c2c2e] px-4 py-1 font-mono text-[11px] text-white/35">
            savor.app{url}
          </span>
        </div>
        <div className="w-14 shrink-0" />
      </div>
      {children}
    </div>
  );
}

/* ─── Module showcase ────────────────────────────────────────────── */
function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setVisible(false);
    setTimeout(() => { setActive(idx); setVisible(true); }, 180);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setActive(a => (a + 1) % MODULES.length); setVisible(true); }, 180);
    }, 3800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const mod = MODULES[active];

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          const isActive = active === i;
          return (
            <button
              key={m.id}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                goTo(i);
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              style={isActive
                ? { backgroundColor: ACCENT, color: '#fff', transform: 'scale(1.05)' }
                : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* preview */}
      <div
        className="transition-opacity duration-180"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {mod.mobile ? (
          <div className="flex justify-center py-6">
            <PhoneMockup />
          </div>
        ) : (
          <BrowserMockup url={mod.url}>
            {/* padding-bottom % → responsive aspect-ratio cut, no fixed px heights */}
            <div className="relative overflow-hidden" style={{ paddingBottom: '46%' }}>
              <img
                src={mod.screenshot}
                alt={mod.label}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: mod.cut.objectPosition }}
              />
            </div>
          </BrowserMockup>
        )}
      </div>

      {/* dots */}
      <div className="mt-5 flex justify-center gap-2">
        {MODULES.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); goTo(i); }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: active === i ? 22 : 6, backgroundColor: active === i ? ACCENT : 'rgba(255,255,255,0.18)' }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatPhone {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%     { transform: translateY(-10px) rotate(-1deg); }
        }
        .fu  { animation: fadeUp 0.65s cubic-bezier(.2,.8,.2,1) both; }
        .d1  { animation-delay:.08s; }
        .d2  { animation-delay:.18s; }
        .d3  { animation-delay:.28s; }
        .d4  { animation-delay:.38s; }
        .phone-float { animation: floatPhone 5s ease-in-out infinite; }
        .live { animation: livePulse 2s ease-in-out infinite; }
        @keyframes livePulse { 0%,100%{opacity:1}50%{opacity:.35} }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT }}>
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">Savor</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#platform" className="text-sm font-medium text-gray-500 transition hover:text-gray-900">Platform</a>
            <a href="#roles"    className="text-sm font-medium text-gray-500 transition hover:text-gray-900">Who It's For</a>
            <a href="#how"      className="text-sm font-medium text-gray-500 transition hover:text-gray-900">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/t/1" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 md:block">
              View Menu
            </Link>
            <Link
              to="/admin"
              className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#06090f 0%,#0c1c1b 60%,#091614 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: ACCENT }} />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-28">
          {/* left */}
          <div>
            <div className="fu mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/60">
              <span className="live h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All data is live — no refresh needed
            </div>

            <h1 className="fu d1 text-5xl font-black leading-[1.06] tracking-tight text-white xl:text-6xl">
              Your restaurant,<br />
              <span style={{ color: ACCENT }}>fully digital.</span>
            </h1>

            <p className="fu d2 mt-5 max-w-md text-lg leading-relaxed text-white/50">
              One platform connecting your menu, counter, kitchen, signage, and analytics — all syncing live, zero paper.
            </p>

            <div className="fu d3 mt-9 flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Open Admin Panel <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/t/1"
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <Globe className="h-4 w-4" /> View Digital Menu
              </Link>
            </div>

            <div className="fu d4 mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {['Real-time sync', 'Auto-print receipts', 'No app download needed', 'Unlimited tables'].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-white/35">
                  <Check className="h-3 w-3 text-emerald-500" /> {f}
                </span>
              ))}
            </div>
          </div>

          {/* right — phone mockup (customer-facing product first) */}
          <div className="flex justify-center lg:justify-end">
            <div className="phone-float">
              <PhoneMockup />
              {/* floating label */}
              <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-sm">
                <Globe className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                <span className="text-xs font-semibold text-white/60">
                  Guests scan → menu opens instantly
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { val: '6',    label: 'Connected modules' },
            { val: '<1s',  label: 'Cross-device sync' },
            { val: '∞',    label: 'Tables supported' },
            { val: '0',    label: 'Minutes to set up' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black" style={{ color: ACCENT }}>{s.val}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform showcase ────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(160deg,#06090f,#0d1a19)' }}
        id="platform"
      >
        <div className="mb-12 px-6 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>
            The Platform
          </p>
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Every screen your restaurant needs
          </h2>
          <p className="mt-3 text-sm text-white/40">
            One system — six live views, each built for a specific job.
          </p>
        </div>

        <ModuleShowcase />
      </section>

      {/* ── Who It's For ─────────────────────────────────────────── */}
      <section className="py-24 px-6" id="roles">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>
              Who It's For
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
              Built for every person in your restaurant
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Customers */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-hidden bg-gray-50">
                {/* phone screen cut */}
                <div className="flex justify-center py-6">
                  <PhoneCut imgSrc="/ss-menu.jpg" objectPosition="center 52%" height={240} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}18` }}>
                    <Globe className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">For Customers</span>
                </div>
                <h3 className="mt-1 text-lg font-black text-gray-900">A menu they'll actually enjoy</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Scan the QR, browse categories, pick dishes, and order — all from their phone. No app, no waiting.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {['Instant QR access, no download', 'Browse, filter & add to cart', 'Live order status tracking'].map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/t/1"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  View live menu <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Staff */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-hidden bg-gray-50">
                {/* kitchen screen cut — responsive aspect ratio */}
                <div className="relative overflow-hidden" style={{ paddingBottom: '58%' }}>
                  <img
                    src="/ss-kitchen.jpg"
                    alt="Kitchen display"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: 'center 18%' }}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}18` }}>
                    <ChefHat className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">For Staff</span>
                </div>
                <h3 className="mt-1 text-lg font-black text-gray-900">Faster service, fewer mistakes</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Orders flow from the POS or menu straight to the kitchen display — no shouting, no paper tickets, no guesswork.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {['POS fires orders instantly', 'Kitchen sees live ticket pipeline', 'Late orders flagged automatically'].map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex gap-3">
                  <Link to="/pos"     className="text-sm font-bold transition hover:opacity-80" style={{ color: ACCENT }}>POS <ArrowRight className="inline h-3 w-3" /></Link>
                  <Link to="/kitchen" className="text-sm font-bold transition hover:opacity-80" style={{ color: ACCENT }}>Kitchen <ArrowRight className="inline h-3 w-3" /></Link>
                </div>
              </div>
            </div>

            {/* Managers */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-hidden bg-gray-50">
                {/* analytics screen cut — responsive aspect ratio */}
                <div className="relative overflow-hidden" style={{ paddingBottom: '58%' }}>
                  <img
                    src="/ss-admin.jpg"
                    alt="Analytics dashboard"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: 'center 60%' }}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}18` }}>
                    <BarChart2 className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">For Managers</span>
                </div>
                <h3 className="mt-1 text-lg font-black text-gray-900">Full control from one dashboard</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Edit your menu, manage branding, watch revenue trends, and spot your busiest hours — all from the admin panel.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {['Revenue, orders & top items at a glance', 'Peak hours & busiest days charts', 'Menu, branding & fees in one place'].map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/admin"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  Open dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Under-the-hood features ──────────────────────────────── */}
      <section className="bg-gray-50/60 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>
              Under the Hood
            </p>
            <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
              The details that matter
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: QrCode,
                title: 'QR per table',
                desc: 'Auto-generated QR codes for every table. Download as PNG or bulk-print in one click.',
              },
              {
                icon: Printer,
                title: 'Auto-print receipts',
                desc: 'Fire a receipt the moment an order is placed. Supports 58mm and 80mm thermal printers.',
              },
              {
                icon: Zap,
                title: 'Real-time everything',
                desc: 'POS, kitchen, board and analytics all update live via Supabase Realtime — zero polling.',
              },
              {
                icon: RefreshCw,
                title: 'Taxes & fees built in',
                desc: 'Configure tax, service charge, and custom fees separately for dine-in and takeaway.',
              },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${ACCENT}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(150deg,#06090f,#0c1c1b)' }}
        id="how"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>
            Get Started
          </p>
          <h2 className="text-3xl font-black text-white md:text-4xl">Up and running in 3 steps</h2>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Build your menu',
                desc: 'Add categories and items in Admin. Upload photos, set prices, configure branding — takes minutes.',
                to: '/admin',
              },
              {
                n: '02',
                title: 'Print QR codes',
                desc: 'Generate a QR per table and place them. Your digital menu is live the moment they\'re scanned.',
                to: '/admin',
              },
              {
                n: '03',
                title: 'Open your screens',
                desc: 'Kitchen on a tablet, Board on the TV, POS at the counter. Everything links automatically.',
                to: '/kitchen',
              },
            ].map(s => (
              <div key={s.n} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7 text-left">
                <span className="text-5xl font-black" style={{ color: ACCENT }}>{s.n}</span>
                <h3 className="mt-4 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/45">{s.desc}</p>
                <Link
                  to={s.to as any}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold transition hover:underline"
                  style={{ color: ACCENT }}
                >
                  Go there <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="rounded-3xl p-14 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #1e3634)` }}
          >
            <h2 className="text-4xl font-black text-white md:text-5xl">
              Ready to go paperless?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60">
              Everything is already set up. Open the dashboard, add your menu, and your restaurant is live.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black shadow-lg transition hover:opacity-90"
                style={{ color: ACCENT }}
              >
                Open Admin Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/t/1"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Globe className="h-4 w-4" /> View Live Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: ACCENT }}>
              <UtensilsCrossed className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-gray-900">Savor</span>
            <span className="ml-1 text-sm text-gray-400">— Restaurant Management</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Digital Menu', to: '/t/1' },
              { label: 'POS',          to: '/pos' },
              { label: 'Kitchen',      to: '/kitchen' },
              { label: 'Board',        to: '/board' },
              { label: 'Admin',        to: '/admin' },
            ].map(l => (
              <Link key={l.label} to={l.to as any} className="text-sm text-gray-400 transition hover:text-gray-800">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
