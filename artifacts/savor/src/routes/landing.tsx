import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import {
  UtensilsCrossed, ChefHat, MonitorPlay, BarChart2, Settings2,
  QrCode, Printer, Zap, Check, ArrowRight, Star, ShoppingCart,
  Clock, Package, CheckCircle, Sparkles, Globe, RefreshCw,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useLoopTimer(ms: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return tick;
}

function useStep(steps: number, ms: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps), ms);
    return () => clearInterval(t);
  }, [steps, ms]);
  return step;
}

// ─── Animated Demos ───────────────────────────────────────────────────────────

function MenuDemo() {
  const step = useStep(4, 1400);
  const items = ['Crispy Calamari', 'Truffle Pasta', 'Grilled Salmon', 'Lava Cake'];
  const prices = ['14.00', '22.00', '28.00', '9.00'];
  const emojis = ['🦑', '🍝', '🐟', '🍫'];
  const [cartCount, setCartCount] = useState(0);
  const prev = useRef(step);
  useEffect(() => {
    if (step !== prev.current) { setCartCount(c => c + 1); prev.current = step; }
  }, [step]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] p-4 font-sans text-white shadow-2xl" style={{ minHeight: 320 }}>
      {/* bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}33` }}>
            <UtensilsCrossed className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          </div>
          <span className="text-xs font-bold" style={{ color: ACCENT }}>Savor Restaurant</span>
        </div>
        <div className="relative">
          <ShoppingCart className="h-4 w-4 text-white/60" />
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black text-white" style={{ backgroundColor: ACCENT }}>{cartCount}</span>
          )}
        </div>
      </div>
      {/* tabs */}
      <div className="mb-3 flex gap-1.5">
        {['All', 'Starters', 'Mains', 'Desserts'].map((t, i) => (
          <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-300" style={{ backgroundColor: i === 0 ? ACCENT : 'rgba(255,255,255,0.06)', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }}>{t}</span>
        ))}
      </div>
      {/* items */}
      <div className="space-y-2">
        {items.map((name, i) => (
          <div key={name} className="flex items-center gap-3 rounded-xl p-2.5 transition-all duration-500" style={{ backgroundColor: step === i ? `${ACCENT}22` : 'rgba(255,255,255,0.04)', border: step === i ? `1px solid ${ACCENT}55` : '1px solid transparent' }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${ACCENT}1a` }}>{emojis[i]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{name}</p>
              <p className="text-[10px]" style={{ color: ACCENT }}>${prices[i]}</p>
            </div>
            <button className="rounded-lg px-2 py-1 text-[10px] font-black text-white transition-all duration-300 shadow-sm" style={{ backgroundColor: step === i ? ACCENT : 'rgba(255,255,255,0.1)', transform: step === i ? 'scale(1.05)' : 'scale(1)' }}>
              {step === i ? '✓ Added' : '+ Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function POSDemo() {
  const step = useStep(5, 1200);
  const cartItems = [
    { name: 'Grilled Salmon', price: 28, qty: 1 },
    { name: 'Truffle Pasta', price: 22, qty: 2 },
    { name: 'Lava Cake', price: 9, qty: 1 },
  ];
  const visibleItems = cartItems.slice(0, Math.min(step, 3));
  const total = visibleItems.reduce((s, i) => s + i.price * i.qty, 0);
  const sent = step === 4;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] shadow-2xl" style={{ minHeight: 320 }}>
      <div className="grid h-full" style={{ gridTemplateColumns: '1fr 140px' }}>
        {/* left */}
        <div className="border-r border-white/10 p-3 space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: ACCENT }}>Menu</p>
          {['🐟 Salmon $28', '🍝 Pasta $22', '🍫 Lava Cake $9', '🦑 Calamari $14'].map((it, i) => (
            <div key={it} className="rounded-xl p-2 text-[10px] font-semibold text-white/70 cursor-pointer hover:bg-white/5 transition-colors" style={{ backgroundColor: i < step && step < 4 ? `${ACCENT}18` : 'transparent', border: i < step && step < 4 ? `1px solid ${ACCENT}33` : '1px solid transparent' }}>{it}</div>
          ))}
        </div>
        {/* right - cart */}
        <div className="flex flex-col p-3">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-white/60">Order T:3</p>
          <div className="flex-1 space-y-1.5">
            {visibleItems.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/5 px-2 py-1.5 transition-all duration-300" style={{ animation: 'slideIn 0.3s ease' }}>
                <p className="text-[9px] font-semibold text-white leading-tight">{item.name}</p>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-white/40">×{item.qty}</span>
                  <span className="text-[9px] font-bold" style={{ color: ACCENT }}>${item.price * item.qty}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] text-white/50">Total</span>
              <span className="text-xs font-black text-white">${total}</span>
            </div>
            <button className="w-full rounded-xl py-2 text-[10px] font-black text-white transition-all duration-500" style={{ backgroundColor: sent ? '#22c55e' : ACCENT, transform: sent ? 'scale(0.97)' : 'scale(1)' }}>
              {sent ? '✓ Sent!' : 'Send to Kitchen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenDemo() {
  const step = useStep(3, 1600);
  const cols = [
    { title: 'New', dot: '#f59e0b', orders: step === 0 ? 1 : 0 },
    { title: 'Cooking', dot: '#3b82f6', orders: step === 1 ? 1 : 0 },
    { title: 'Ready', dot: '#22c55e', orders: step === 2 ? 1 : 0 },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] p-4 shadow-2xl" style={{ minHeight: 300 }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-white">Kitchen Display</p>
          <p className="text-[10px] text-white/40">Live order pipeline</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5">
          <Clock className="h-3 w-3 text-white/40" />
          <span className="text-[10px] font-bold text-white/60">03:45 AM</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.dot }} />
              <span className="text-[10px] font-bold" style={{ color: col.dot }}>{col.title}</span>
              <span className="rounded-full px-1.5 text-[9px] font-bold" style={{ backgroundColor: `${col.dot}22`, color: col.dot }}>{col.orders}</span>
            </div>
            <div className="min-h-[140px] rounded-xl border border-white/5 p-2 transition-all duration-500" style={{ backgroundColor: col.orders ? `${col.dot}0d` : 'rgba(255,255,255,0.02)' }}>
              {col.orders > 0 && (
                <div className="rounded-xl border p-3 transition-all duration-500" style={{ borderColor: `${col.dot}44`, backgroundColor: `${col.dot}11` }}>
                  <p className="text-[10px] font-black" style={{ color: col.dot }}>#042</p>
                  <p className="mt-1 text-[9px] text-white/60">Dine In · Table 4</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[9px] text-white/50">Grilled Salmon</span>
                      <span className="text-[9px] text-white/50">×1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-white/50">Pasta</span>
                      <span className="text-[9px] text-white/50">×2</span>
                    </div>
                  </div>
                  <button className="mt-2 w-full rounded-lg py-1 text-[9px] font-black text-white" style={{ backgroundColor: col.dot }}>
                    {col.title === 'New' ? 'Start Preparing →' : col.title === 'Cooking' ? 'Mark Ready →' : '✓ Served'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardDemo() {
  const step = useStep(4, 1800);
  const cats = [
    { icon: '🥗', name: 'Starters', items: ['Crispy Calamari $14', 'Bruschetta $10', 'Soup $8'] },
    { icon: '🍝', name: 'Pasta', items: ['Truffle Pasta $22', 'Carbonara $18', 'Pesto $16'] },
    { icon: '🥩', name: 'Mains', items: ['Grilled Salmon $28', 'Ribeye Steak $42', 'Duck Confit $36'] },
    { icon: '🍫', name: 'Desserts', items: ['Lava Cake $9', 'Tiramisu $11', 'Sorbet $7'] },
  ];
  const cat = cats[step % cats.length];
  const progress = ((step % cats.length) + 1) / cats.length;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0a0d13] p-4 shadow-2xl" style={{ minHeight: 300 }}>
      {/* progress bar */}
      <div className="mb-4 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress * 100}%`, backgroundColor: ACCENT }} />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl border border-white/10 bg-black/30">{cat.icon}</div>
          <div>
            <p className="font-black uppercase italic text-white text-xl leading-tight">{cat.name}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{cat.items.length} selections</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{(step % cats.length) + 1}/{cats.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cat.items.map((item, i) => {
          const [name, price] = item.split(' $');
          return (
            <div key={item} className="rounded-xl border border-white/10 bg-black/40 p-2.5 transition-all duration-300" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="mb-2 aspect-video w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT}11)` }} />
              <p className="text-[10px] font-black text-white">{name}</p>
              <div className="mt-1 inline-block rounded-lg bg-white px-1.5 py-0.5 text-[9px] font-black text-black">${price}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  const tick = useLoopTimer(120);
  const baseValues = [420, 680, 540, 920, 1020, 760, 310];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = 1020;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] p-4 shadow-2xl" style={{ minHeight: 300 }}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Revenue', val: '$9,287', delta: '+12%' },
          { label: 'Orders', val: '200', delta: '+8%' },
          { label: 'Avg Order', val: '$46.4', delta: '+4%' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5" style={{ backgroundColor: `${ACCENT}18` }}>
            <p className="text-[9px] text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-black text-white mt-0.5">{s.val}</p>
            <p className="text-[9px] font-bold text-emerald-400">{s.delta}</p>
          </div>
        ))}
      </div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/40">Revenue — Last 7 Days</p>
      <div className="flex items-end gap-1.5 h-24">
        {baseValues.map((v, i) => {
          const jitter = Math.sin(tick * 0.05 + i) * 30;
          const height = Math.max(8, ((v + jitter) / max) * 96);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{ height, backgroundColor: i === 4 ? ACCENT : `${ACCENT}55` }}
              />
              <span className="text-[8px] text-white/30">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDemo() {
  const step = useStep(3, 1600);
  const tabs = ['Menu Items', 'Categories', 'Branding'];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] shadow-2xl" style={{ minHeight: 300 }}>
      {/* tab bar */}
      <div className="flex border-b border-white/10">
        {tabs.map((t, i) => (
          <button key={t} className="flex-1 px-2 py-2.5 text-[10px] font-bold transition-all duration-300" style={{ color: step === i ? ACCENT : 'rgba(255,255,255,0.3)', borderBottom: step === i ? `2px solid ${ACCENT}` : '2px solid transparent' }}>{t}</button>
        ))}
      </div>
      <div className="p-4">
        {step === 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/70">Menu Items</p>
              <button className="rounded-lg px-2 py-1 text-[9px] font-black text-white" style={{ backgroundColor: ACCENT }}>+ Add Item</button>
            </div>
            {['Grilled Salmon — $28.00', 'Truffle Pasta — $22.00', 'Crispy Calamari — $14.00'].map(item => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span className="text-[10px] text-white/70">{item}</span>
                <div className="flex gap-1">
                  <span className="text-[8px] rounded-full px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/70 mb-3">Categories</p>
            {[['🥗', 'Starters', '3 items'], ['🍝', 'Pasta', '4 items'], ['🥩', 'Mains', '5 items'], ['🍫', 'Desserts', '3 items']].map(([icon, name, count]) => (
              <div key={name} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                <span className="text-base">{icon}</span>
                <span className="flex-1 text-[10px] font-semibold text-white/70">{name}</span>
                <span className="text-[9px] text-white/30">{count}</span>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-white/70 mb-3">Branding</p>
            <div>
              <p className="text-[9px] text-white/40 mb-1">Restaurant Name</p>
              <div className="rounded-xl bg-white/5 px-3 py-2 text-[10px] text-white/70">Savor Restaurant</div>
            </div>
            <div>
              <p className="text-[9px] text-white/40 mb-1">Accent Color</p>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                <div className="h-4 w-4 rounded-md" style={{ backgroundColor: ACCENT }} />
                <span className="text-[10px] text-white/70">#426564</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] text-white/40 mb-1">Currency</p>
              <div className="rounded-xl bg-white/5 px-3 py-2 text-[10px] text-white/70">$ USD</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QRDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1613] p-4 shadow-2xl" style={{ minHeight: 300 }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold text-white/70">Table QR Codes</p>
        <button className="rounded-lg px-2 py-1 text-[9px] font-black text-white" style={{ backgroundColor: ACCENT }}>Print All</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-2">
            <p className="text-[8px] font-bold text-white/40">Table {i + 1}</p>
            <div className="rounded-lg bg-white p-1.5">
              <svg width="36" height="36" viewBox="0 0 36 36">
                {/* QR code pattern */}
                <rect width="36" height="36" fill="white" />
                {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                  const inTopLeft = r < 7 && c < 7;
                  const inTopRight = r < 7 && c > 28;
                  const inBotLeft = r > 28 && c < 7;
                  const border = (r === 0 || r === 6 || c === 0 || c === 6) && inTopLeft;
                  const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4 && inTopLeft;
                  if (!border && !inner) return null;
                  return <rect key={`${r}-${c}`} x={c * 5} y={r * 5} width="5" height="5" fill="#000" />;
                }))}
                {/* data pattern */}
                {Array.from({ length: 20 }, (_, k) => (
                  <rect key={k} x={Math.floor(Math.random() * 36)} y={Math.floor(Math.random() * 36)} width="2" height="2" fill="#000" opacity={0.6} />
                ))}
              </svg>
            </div>
            <p className="text-[7px] text-white/30">/t{i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature sections data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    badge: '01 · Digital Menu',
    title: 'A menu your customers will love to browse',
    description: 'Customers scan a QR code and get a beautiful, fast digital menu — no app download needed. They can browse categories, search dishes, see prep times, and place orders right from their phone.',
    bullets: ['QR-coded per table or takeaway link', 'Real-time availability — sold-out items auto-hide', 'Cart with taxes, service charge & fees applied', 'Dine-in and takeaway ordering modes'],
    Demo: MenuDemo,
    flip: false,
  },
  {
    badge: '02 · Point of Sale',
    title: 'A POS built for speed',
    description: 'Staff tap items, build orders in seconds, and fire them straight to the kitchen. No paper, no miscommunication — everything is real-time. Auto-print receipts the moment an order is placed.',
    bullets: ['Lightning-fast item grid with category tabs', 'Inline notes per item (e.g. "no onions")', 'Auto-print invoice on 58mm or 80mm paper', 'Full order history with reprint support'],
    Demo: POSDemo,
    flip: true,
  },
  {
    badge: '03 · Kitchen Display',
    title: 'Keep the kitchen in perfect sync',
    description: 'Replace paper tickets with a live kitchen display. Orders flow in the moment they\'re placed, move through New → Cooking → Ready with one tap, and late orders are flagged in red automatically.',
    bullets: ['Color-coded pipeline (New / Cooking / Ready)', 'Late order alerts after configurable threshold', 'Waiter-call notifications with bell badge', 'Manager approval queue for new orders'],
    Demo: KitchenDemo,
    flip: false,
  },
  {
    badge: '04 · Board Display',
    title: 'Digital signage that sells for you',
    description: 'Put any TV or screen to work. The board display cycles through your menu categories with cinematic animations — prices, photos, descriptions — all auto-updating whenever you edit your menu.',
    bullets: ['Two premium templates: Dark Cinematic & Grand Spotlight', 'Configurable cycle speed and column count', 'Shows photos, prices, prep time, description', 'Live preview + shareable URL for any screen'],
    Demo: BoardDemo,
    flip: true,
  },
  {
    badge: '05 · Analytics',
    title: 'Know your numbers, grow your revenue',
    description: 'Track revenue, order volume, and top-selling items across any time period. See your busiest days at a glance and understand exactly what\'s driving your sales.',
    bullets: ['7-day revenue trend chart', 'Top 5 items by quantity and revenue', 'Average order value tracking', 'Recent orders summary with status'],
    Demo: AnalyticsDemo,
    flip: false,
  },
  {
    badge: '06 · Admin Panel',
    title: 'Total control from one dashboard',
    description: 'Add and edit menu items, reorder categories with drag-and-drop, configure your branding, taxes, and fees — all without touching any code. Changes go live instantly across every device.',
    bullets: ['Menu item & category management with drag-and-drop', 'Full branding: name, logo, accent color, tagline', 'Configurable tax, service charge & additional fees', 'Per-type (dine-in / takeaway) fee application'],
    Demo: AdminDemo,
    flip: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both; }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.2s; }
        .fade-up-d3 { animation-delay: 0.3s; }
        .live-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT }}>
              <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">Savor</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'Kitchen', 'Analytics', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/menu" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 md:block">Live Demo</Link>
            <Link to="/admin" className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, #0a0d13 0%, #0f1a19 60%, #131f1e 100%)` }}>
        {/* glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: ACCENT }} />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full opacity-10 blur-[80px]" style={{ backgroundColor: ACCENT }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 text-center">
          <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
            <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            Now live — Real-time restaurant management
          </div>

          <h1 className="fade-up fade-up-d1 mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Your restaurant,<br />
            <span style={{ color: ACCENT }}>fully digital.</span>
          </h1>

          <p className="fade-up fade-up-d2 mx-auto mt-6 max-w-2xl text-lg text-white/55 leading-relaxed">
            One platform for your digital menu, point of sale, kitchen display, board signage, and analytics. Everything syncs in real-time — zero complexity, zero paper.
          </p>

          <div className="fade-up fade-up-d3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/admin" className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5" style={{ backgroundColor: ACCENT }}>
              Open Admin Panel <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/menu" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10">
              <Globe className="h-4 w-4" /> View Digital Menu
            </Link>
          </div>

          {/* quick links row */}
          <div className="fade-up fade-up-d3 mt-8 flex flex-wrap justify-center gap-3">
            {[
              { label: 'POS', to: '/pos', icon: ShoppingCart },
              { label: 'Kitchen', to: '/kitchen', icon: ChefHat },
              { label: 'Board', to: '/board', icon: MonitorPlay },
            ].map(({ label, to, icon: Icon }) => (
              <Link key={label} to={to} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-10" id="features">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { val: '6', label: 'Integrated modules' },
            { val: '∞', label: 'Tables supported' },
            { val: '< 1s', label: 'Real-time sync' },
            { val: '0', label: 'Setup complexity' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-gray-900" style={{ color: ACCENT }}>{s.val}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Sections ── */}
      {FEATURES.map((f) => {
        const { Demo } = f;
        return (
          <section key={f.badge} className="py-20">
            <div className={`mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row ${f.flip ? 'lg:flex-row-reverse' : ''}`}>
              {/* text */}
              <div className="flex-1 max-w-xl">
                <span className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white" style={{ backgroundColor: ACCENT }}>{f.badge}</span>
                <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-4xl">{f.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-gray-500">{f.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm text-gray-600">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* demo */}
              <div className="w-full flex-1 max-w-lg">
                <Demo />
              </div>
            </div>
          </section>
        );
      })}

      {/* ── QR Codes bonus section ── */}
      <section className="bg-gray-50/60 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 max-w-xl">
            <span className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white" style={{ backgroundColor: ACCENT }}>07 · QR Codes</span>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-4xl">One QR per table — ready in seconds</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-500">Generate a unique QR code for every table in your restaurant. Download as SVG or print all at once. Customers scan to open your menu with their table pre-selected — no app, no friction.</p>
            <ul className="mt-6 space-y-2.5">
              {['Auto-generated for all your tables', 'Downloadable SVG per table', 'Bulk print-all in one click', 'URL links directly to the right table view'].map(b => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-gray-600">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full flex-1 max-w-lg"><QRDemo /></div>
        </div>
      </section>

      {/* ── More features grid ── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Everything else you need</h2>
            <p className="mt-3 text-gray-500">The details that make running a restaurant smoother.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Printer, title: 'Auto-print invoices', desc: 'Fire a receipt the moment an order is placed. Supports 58mm and 80mm thermal printers.' },
              { icon: Zap, title: 'Real-time sync', desc: 'Every device — POS, kitchen, board — updates live without refresh. Powered by Supabase Realtime.' },
              { icon: RefreshCw, title: 'Tax & service charges', desc: 'Configure tax, service charge, and custom fees separately for dine-in and takeaway orders.' },
              { icon: Star, title: 'Custom branding', desc: 'Set your restaurant name, tagline, logo, hero image, and accent color. Your menu, your identity.' },
              { icon: Globe, title: 'Works on any device', desc: 'No native app required. Customers open your menu in any mobile browser by scanning the QR.' },
              { icon: CheckCircle, title: 'Order approval queue', desc: 'Optional manager approval step before orders enter the kitchen pipeline.' },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${ACCENT}18` }}>
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
      <section className="py-20" style={{ background: `linear-gradient(160deg, #0a0d13, #0f1a19)` }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white/60 border border-white/10">Get started in minutes</span>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Up and running in 3 steps</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { num: '01', title: 'Set up your menu', desc: 'Add categories and items in the Admin panel. Upload photos, set prices, and configure your branding in minutes.' },
              { num: '02', title: 'Print your QR codes', desc: 'Generate QR codes for every table and download or print them. Place on tables — your digital menu is live.' },
              { num: '03', title: 'Open the kitchen display', desc: 'Put Kitchen on a tablet, Board on a TV, and POS on the counter. Everything is linked, real-time, zero config.' },
            ].map(s => (
              <div key={s.num} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm text-left">
                <p className="text-4xl font-black" style={{ color: ACCENT }}>{s.num}</p>
                <h3 className="mt-3 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl shadow-lg" style={{ backgroundColor: ACCENT }}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">Ready to go fully digital?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">Open the Admin panel, add your menu, and print your first QR codes — your restaurant runs smarter today.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/admin" className="flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-black text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5" style={{ backgroundColor: ACCENT }}>
              Open Admin Panel <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/menu" className="flex items-center gap-2 rounded-2xl border border-gray-200 px-10 py-4 text-base font-bold text-gray-700 transition hover:bg-gray-50">
              <Globe className="h-4 w-4" /> View Menu Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: ACCENT }}>
              <UtensilsCrossed className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-gray-900">Savor</span>
            <span className="text-sm text-gray-400">— Restaurant Management</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: 'Menu', to: '/menu' },
              { label: 'POS', to: '/pos' },
              { label: 'Kitchen', to: '/kitchen' },
              { label: 'Board', to: '/board' },
              { label: 'Admin', to: '/admin' },
            ].map(l => (
              <Link key={l.label} to={l.to} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
