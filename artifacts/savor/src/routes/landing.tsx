import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import {
  UtensilsCrossed, ChefHat, MonitorPlay, BarChart2, Settings2,
  QrCode, Printer, Zap, Check, ArrowRight, Star, ShoppingCart,
  Globe, RefreshCw, CheckCircle, Play, ExternalLink,
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

const MODULES = [
  {
    id: 'menu',
    label: 'Digital Menu',
    icon: Globe,
    src: '/t/1',
    screenshot: '/ss-menu.jpg',
    badge: '01 · Digital Menu',
    title: 'A menu customers love to browse',
    desc: 'Guests scan a QR code and get a beautiful, fast digital menu — no app download needed. Browse categories, search dishes, see prep times, and order from their phone.',
    bullets: [
      'QR-coded per table or takeaway link',
      'Real-time availability — sold-out items auto-hide',
      'Cart with taxes, service charge & fees applied',
      'Dine-in and takeaway ordering modes',
    ],
    color: '#426564',
  },
  {
    id: 'pos',
    label: 'POS',
    icon: ShoppingCart,
    src: '/pos',
    screenshot: '/ss-pos.jpg',
    badge: '02 · Point of Sale',
    title: 'A POS built for speed',
    desc: 'Staff tap items, build orders in seconds, and fire them to the kitchen. No paper, no miscommunication — everything is real-time with auto-print receipt support.',
    bullets: [
      'Fast item grid with category tabs & search',
      'Inline notes per item (e.g. "no onions")',
      'Auto-print invoice on 58mm or 80mm paper',
      'Full order history with reprint support',
    ],
    color: '#2563eb',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    icon: ChefHat,
    src: '/kitchen',
    screenshot: '/ss-kitchen.jpg',
    badge: '03 · Kitchen Display',
    title: 'Keep the kitchen in perfect sync',
    desc: 'Replace paper tickets with a live kitchen display. Orders flow in the moment they\'re placed, move through New → Cooking → Ready with one tap. Late orders turn red automatically.',
    bullets: [
      'Color-coded pipeline: New / Cooking / Ready',
      'Late order alerts after configurable threshold',
      'Waiter-call notifications with bell badge',
      'Manager approval queue for new orders',
    ],
    color: '#f59e0b',
  },
  {
    id: 'board',
    label: 'Board Display',
    icon: MonitorPlay,
    src: '/board',
    screenshot: '/ss-board.jpg',
    badge: '04 · Board Display',
    title: 'Digital signage that sells for you',
    desc: 'Put any TV or screen to work. The board display cycles through your menu categories with cinematic animations — prices, photos, descriptions — all auto-updating when you edit.',
    bullets: [
      'Two premium templates: Dark Cinematic & Grand Spotlight',
      'Configurable cycle speed and column count',
      'Shows photos, prices, prep time, description',
      'Live preview + shareable URL for any screen',
    ],
    color: '#8b5cf6',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart2,
    src: '/admin',
    screenshot: '/ss-admin.jpg',
    badge: '05 · Analytics',
    title: 'Know your numbers, grow revenue',
    desc: 'Track revenue, order volume, and top-selling items. See your busiest days at a glance and understand exactly what\'s driving your sales — all from one clean dashboard.',
    bullets: [
      '7-day revenue trend chart',
      'Top 5 items by quantity and revenue',
      'Average order value tracking',
      'Recent orders summary with status',
    ],
    color: '#10b981',
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings2,
    src: '/admin',
    screenshot: '/ss-admin.jpg',
    badge: '06 · Admin Panel',
    title: 'Total control from one dashboard',
    desc: 'Add and edit menu items, reorder categories with drag-and-drop, configure branding, taxes, and fees — all without code. Changes go live instantly across every device.',
    bullets: [
      'Menu item & category management with drag-and-drop',
      'Full branding: name, logo, accent color, tagline',
      'Configurable tax, service charge & additional fees',
      'Board display + receipt settings in one place',
    ],
    color: '#426564',
  },
];

function BrowserChrome({
  url,
  children,
  dark = true,
}: {
  url: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-2xl ${
        dark ? 'border border-white/10' : 'border border-gray-200/80'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-2.5 ${
          dark
            ? 'bg-[#1c1c1e] border-b border-white/10'
            : 'bg-[#f3f3f3] border-b border-gray-200'
        }`}
      >
        <div className="flex gap-1.5 shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className={`flex flex-1 items-center justify-center rounded-md px-3 py-1 ${
            dark ? 'bg-[#2c2c2e]' : 'bg-white border border-gray-200'
          }`}
        >
          <span
            className={`font-mono text-[11px] ${
              dark ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            savor.app{url}
          </span>
        </div>
        <div className="w-14 shrink-0" />
      </div>
      {children}
    </div>
  );
}

function ScreenshotSlideshow() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 200);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(a => (a + 1) % MODULES.length);
        setFading(false);
      }, 200);
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const mod = MODULES[active];

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Tab strip */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                goTo(i);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active === i
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
              style={active === i ? { backgroundColor: ACCENT } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Browser mockup */}
      <BrowserChrome url={mod.src} dark>
        <div
          className="relative overflow-hidden transition-opacity duration-200"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <img
            key={mod.id}
            src={mod.screenshot}
            alt={mod.label}
            className="w-full object-cover object-top"
            style={{ maxHeight: 520 }}
          />
          {/* bottom gradient + label */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-16">
            <div>
              <span
                className="mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {mod.badge}
              </span>
              <p className="text-lg font-black text-white">{mod.title}</p>
            </div>
            <Link
              to={mod.src as any}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Play className="h-3 w-3" /> Open Live
            </Link>
          </div>
        </div>
      </BrowserChrome>

      {/* Progress dots */}
      <div className="mt-4 flex justify-center gap-2">
        {MODULES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === i ? 24 : 6,
              backgroundColor: active === i ? ACCENT : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  mod,
  flip,
}: {
  mod: (typeof MODULES)[0];
  flip: boolean;
}) {
  const Icon = mod.icon;
  return (
    <section className="py-20">
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row ${
          flip ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* text */}
        <div className="flex-1 max-w-xl">
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
            style={{ backgroundColor: ACCENT }}
          >
            <Icon className="h-3 w-3" />
            {mod.badge}
          </span>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-4xl">
            {mod.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">{mod.desc}</p>
          <ul className="mt-6 space-y-2.5">
            {mod.bullets.map(b => (
              <li key={b} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-gray-600">{b}</span>
              </li>
            ))}
          </ul>
          <Link
            to={mod.src as any}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Open {mod.label} <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* screenshot */}
        <div className="w-full flex-1 max-w-2xl">
          <BrowserChrome url={mod.src} dark={false}>
            <div className="overflow-hidden">
              <img
                src={mod.screenshot}
                alt={mod.label}
                className="w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                style={{ maxHeight: 420 }}
                loading="lazy"
              />
            </div>
          </BrowserChrome>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both; }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.22s; }
        .fade-up-d3 { animation-delay: 0.34s; }
        .fade-up-d4 { animation-delay: 0.46s; }
        .live-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: ACCENT }}
            >
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">Savor</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: 'Features', href: '#features' },
              { label: 'See It Live', href: '#showcase' },
              { label: 'How It Works', href: '#how' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/t/1"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 md:block"
            >
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

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #06090f 0%, #0d1a19 55%, #111f1e 100%)' }}
      >
        {/* glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[140px]"
            style={{ backgroundColor: ACCENT }}
          />
          <div
            className="absolute right-0 bottom-0 h-64 w-64 rounded-full opacity-10 blur-[80px]"
            style={{ backgroundColor: ACCENT }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-12">
            {/* left col */}
            <div className="flex-1 text-center lg:text-left lg:pt-8">
              <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span
                  className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                Live & real-time — no refresh needed
              </div>

              <h1 className="fade-up fade-up-d1 text-5xl font-black leading-[1.08] tracking-tight text-white md:text-6xl xl:text-7xl">
                Your restaurant,<br />
                <span style={{ color: ACCENT }}>fully digital.</span>
              </h1>

              <p className="fade-up fade-up-d2 mt-6 max-w-lg text-lg text-white/55 leading-relaxed">
                One platform for your digital menu, point of sale, kitchen display, board signage, and analytics. Everything syncs in real-time — zero complexity, zero paper.
              </p>

              <div className="fade-up fade-up-d3 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-black text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: ACCENT }}
                >
                  Open Admin Panel <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/t/1"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  <Globe className="h-4 w-4" /> View Digital Menu
                </Link>
              </div>

              {/* quick links */}
              <div className="fade-up fade-up-d4 mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {[
                  { label: 'POS', to: '/pos', Icon: ShoppingCart },
                  { label: 'Kitchen', to: '/kitchen', Icon: ChefHat },
                  { label: 'Board', to: '/board', Icon: MonitorPlay },
                  { label: 'Analytics', to: '/admin', Icon: BarChart2 },
                ].map(({ label, to, Icon }) => (
                  <Link
                    key={label}
                    to={to as any}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-3 w-3" /> {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* right col — hero screenshot */}
            <div className="fade-up fade-up-d2 w-full max-w-2xl flex-1 float">
              <BrowserChrome url="/admin" dark>
                <img
                  src="/ss-admin.jpg"
                  alt="Savor Admin Dashboard"
                  className="w-full object-cover object-top"
                  style={{ maxHeight: 460 }}
                />
              </BrowserChrome>

              {/* floating badges */}
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { icon: '⚡', text: 'Real-time sync' },
                  { icon: '🖨️', text: 'Auto-print receipts' },
                  { icon: '📱', text: 'No app download' },
                  { icon: '♾️', text: 'Unlimited tables' },
                ].map(b => (
                  <div
                    key={b.text}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 backdrop-blur-sm"
                  >
                    <span>{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-gray-100 bg-gray-50/70 py-10" id="features">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { val: '6', label: 'Integrated modules' },
            { val: '∞', label: 'Tables supported' },
            { val: '<1s', label: 'Real-time sync' },
            { val: '0', label: 'Setup complexity' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black" style={{ color: ACCENT }}>{s.val}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Showcase ── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(160deg, #06090f 0%, #0d1a19 100%)' }}
        id="showcase"
      >
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/50">
            See every module
          </span>
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Every screen, live and real.
          </h2>
          <p className="mt-3 text-white/40">
            These are the actual screens your staff and customers use every day.
          </p>
        </div>
        <ScreenshotSlideshow />
      </section>

      {/* ── Feature Sections (real screenshots) ── */}
      {MODULES.slice(0, 4).map((mod, i) => (
        <FeatureCard key={mod.id} mod={mod} flip={i % 2 !== 0} />
      ))}

      {/* ── Analytics + Admin side by side ── */}
      <section className="bg-gray-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
              Manage everything from one place
            </h2>
            <p className="mt-3 text-gray-500">
              Full analytics visibility and total admin control — side by side.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {MODULES.slice(4, 6).map(mod => {
              const Icon = mod.icon;
              return (
                <div key={mod.id} className="flex flex-col gap-5">
                  <BrowserChrome url={mod.src} dark={false}>
                    <div className="overflow-hidden">
                      <img
                        src={mod.screenshot}
                        alt={mod.label}
                        className="w-full object-cover object-top"
                        style={{ maxHeight: 340 }}
                        loading="lazy"
                      />
                    </div>
                  </BrowserChrome>
                  <div>
                    <span
                      className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      <Icon className="h-3 w-3" /> {mod.badge}
                    </span>
                    <h3 className="mt-2 text-xl font-black text-gray-900">{mod.title}</h3>
                    <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
                    <ul className="mt-4 space-y-1.5">
                      {mod.bullets.map(b => (
                        <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── QR Codes section ── */}
      <section className="py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 max-w-xl">
            <span
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: ACCENT }}
            >
              <QrCode className="h-3 w-3" /> 07 · QR Codes
            </span>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-4xl">
              One QR per table — ready in seconds
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-500">
              Generate a unique QR code for every table. Download as PNG or print all at once. Customers scan to open your menu with their table pre-selected — no app, no friction.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Auto-generated for all your tables',
                'Downloadable PNG per table',
                'Bulk print-all in one click',
                'URL links directly to the right table view',
              ].map(b => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-gray-600">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/admin"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Generate QR Codes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {/* visual: phone-style menu screenshot */}
          <div className="flex-1 max-w-xs">
            <div
              className="overflow-hidden rounded-[2.5rem] border-[8px] shadow-2xl"
              style={{ borderColor: '#1c1c1e', background: '#000' }}
            >
              {/* notch */}
              <div className="relative flex justify-center bg-black py-2">
                <div className="h-3.5 w-24 rounded-full bg-[#1c1c1e]" />
              </div>
              <img
                src="/ss-menu.jpg"
                alt="Digital Menu on mobile"
                className="w-full object-cover object-top"
                style={{ maxHeight: 520 }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── More features grid ── */}
      <section className="bg-gray-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
              Everything else you need
            </h2>
            <p className="mt-3 text-gray-500">The details that make running a restaurant smoother.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Printer,
                title: 'Auto-print invoices',
                desc: 'Fire a receipt the moment an order is placed. Supports 58mm and 80mm thermal printers.',
              },
              {
                icon: Zap,
                title: 'Real-time sync',
                desc: 'Every device — POS, kitchen, board — updates live without refresh. Powered by Supabase Realtime.',
              },
              {
                icon: RefreshCw,
                title: 'Tax & service charges',
                desc: 'Configure tax, service charge, and custom fees separately for dine-in and takeaway orders.',
              },
              {
                icon: Star,
                title: 'Custom branding',
                desc: 'Set your restaurant name, tagline, logo, hero image, and accent color. Your menu, your identity.',
              },
              {
                icon: Globe,
                title: 'Works on any device',
                desc: 'No native app required. Customers open your menu in any mobile browser by scanning the QR.',
              },
              {
                icon: CheckCircle,
                title: 'Order approval queue',
                desc: 'Optional manager approval step before orders enter the kitchen pipeline.',
              },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${ACCENT}18` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="py-24"
        style={{ background: 'linear-gradient(160deg, #06090f, #0d1a19)' }}
        id="how"
      >
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/50">
            Get started in minutes
          </span>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Up and running in 3 steps
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Set up your menu',
                desc: 'Add categories and items in the Admin panel. Upload photos, set prices, and configure your branding in minutes.',
                link: '/admin',
                cta: 'Open Admin',
              },
              {
                num: '02',
                title: 'Print your QR codes',
                desc: 'Generate QR codes for every table and download or print them. Place on tables — your digital menu is live.',
                link: '/admin',
                cta: 'Generate QRs',
              },
              {
                num: '03',
                title: 'Open kitchen & board',
                desc: 'Put Kitchen on a tablet, Board on a TV, and POS on the counter. Everything is linked, real-time, zero config.',
                link: '/kitchen',
                cta: 'Open Kitchen',
              },
            ].map(s => (
              <div
                key={s.num}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm"
              >
                <p className="text-5xl font-black" style={{ color: ACCENT }}>{s.num}</p>
                <h3 className="mt-4 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-white/50 leading-relaxed">{s.desc}</p>
                <Link
                  to={s.link as any}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold transition hover:underline"
                  style={{ color: ACCENT }}
                >
                  {s.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div
            className="rounded-3xl p-12 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #2d4a49)` }}
          >
            <h2 className="text-4xl font-black text-white md:text-5xl">
              Ready to go paperless?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
              Your full restaurant management suite is waiting — menu, POS, kitchen, board, and analytics, all connected and live.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black transition hover:opacity-90 hover:-translate-y-0.5"
                style={{ color: ACCENT }}
              >
                Open Admin Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/t/1"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Globe className="h-4 w-4" /> View Live Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: ACCENT }}
            >
              <UtensilsCrossed className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-gray-800">Savor</span>
            <span className="text-sm text-gray-400">— Restaurant Management SaaS</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            {[
              { label: 'Menu', to: '/t/1' },
              { label: 'POS', to: '/pos' },
              { label: 'Kitchen', to: '/kitchen' },
              { label: 'Board', to: '/board' },
              { label: 'Admin', to: '/admin' },
            ].map(l => (
              <Link
                key={l.label}
                to={l.to as any}
                className="transition hover:text-gray-800"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
