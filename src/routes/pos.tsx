import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, ShoppingCart, X, Send, Package, Bell, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { MenuItem, OrderItem } from '@/lib/menu-data';
import { toast } from 'sonner';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const Route = createFileRoute('/pos')({
  head: () => ({
    meta: [
      { title: 'POS — Savor' },
      { name: 'description', content: 'Point of sale terminal for order management' },
    ],
  }),
  component: POSPage,
});

function POSPage() {
  const { items, categories, addOrder, brand, searchQuery } = useMenu();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const defaultType = brand.orderingMode === 'takeaway' ? 'takeaway' : 'dine-in';
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>(defaultType);
  const [tableNumber, setTableNumber] = useState(1);
  const [orderSent, setOrderSent] = useState(false);

  const filteredItems = items.filter(i => i.categoryId === activeCategory && i.available && i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItem.id !== id) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? null! : { ...c, quantity: newQty };
    }).filter(Boolean));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.menuItem.id !== id));

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  const canDineIn = brand.orderingMode === 'dine-in' || brand.orderingMode === 'both';
  const canTakeaway = brand.orderingMode === 'takeaway' || brand.orderingMode === 'both';
  const showToggle = canDineIn && canTakeaway;

  const sendOrder = () => {
    if (cart.length === 0) return;
    addOrder({
      id: `ord-${Date.now()}`,
      items: cart,
      status: 'pending',
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      createdAt: new Date(),
      total,
    });
    setCart([]);
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <WaiterCallsPanel />
      </div>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Menu Section */}
        <div className="flex-1 overflow-auto p-6">
          {/* Categories */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'gradient-primary text-primary-foreground shadow-ambient-sm'
                      : 'bg-card text-muted-foreground hover:bg-surface-low'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-5">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-ambient hover:-translate-y-0.5 active:scale-[0.98]"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} loading="lazy" width={512} height={512} className="h-20 w-full rounded-t-2xl object-cover" />
                  )}
                  <div className="p-3">
                    <h4 className="font-display text-xs font-semibold text-foreground">{item.name}</h4>
                    <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="mt-1.5 font-display text-sm font-bold text-primary">{brand.currency}{item.price.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 shrink-0 bg-card p-6 shadow-ambient flex flex-col lg:w-96">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Order</h2>
            </div>
          </div>

          {/* Order type toggle */}
          {showToggle && (
            <div className="mb-3 flex gap-2 rounded-xl bg-surface-low p-1">
              <button
                onClick={() => setOrderType('dine-in')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  orderType === 'dine-in' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                🍽️ Dine In
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  orderType === 'takeaway' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Takeaway</span>
              </button>
            </div>
          )}

          {/* Table selector — dine-in only */}
          {orderType === 'dine-in' && canDineIn && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Table</span>
              <select
                value={tableNumber}
                onChange={e => setTableNumber(Number(e.target.value))}
                className="rounded-lg bg-surface-low px-3 py-1.5 text-sm font-medium text-foreground outline-none"
              >
                {Array.from({ length: brand.totalTables ?? 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-auto space-y-3">
            {cart.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Tap items to add to order
              </div>
            ) : (
              cart.map(c => (
                <div key={c.menuItem.id} className="flex items-center gap-3 rounded-xl bg-surface-low p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.currency}{(c.menuItem.price * c.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(c.menuItem.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-surface-high">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{c.quantity}</span>
                    <button onClick={() => updateQty(c.menuItem.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-surface-high">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeFromCart(c.menuItem.id)} className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-foreground">{brand.currency}{total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={sendOrder} disabled={cart.length === 0}>
              <Send className="h-4 w-4" />
              {orderSent ? 'Order Sent!' : 'Send to Kitchen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaiterCallsPanel() {
  const { waiterCalls, acknowledgeCall, clearCall } = useMenu();
  const active = waiterCalls.filter((c) => !c.acknowledged);
  const prevCount = useRef(active.length);
  const [, force] = useState(0);

  const playAlert = async () => {
    try {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      // Some browsers keep fresh contexts suspended until resumed.
      await ctx.resume();
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, now + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.45);
        o.connect(g).connect(ctx.destination);
        o.start(now + i * 0.18);
        o.stop(now + i * 0.18 + 0.5);
      });
      setTimeout(() => ctx.close(), 1500);
    } catch {
      // ignore audio failures
    }
  };

  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (active.length > prevCount.current) {
      void playAlert();
      const newest = active[active.length - 1];
      if (newest) toast.info(`🔔 Table ${newest.tableNumber} needs a waiter`);
    }
    prevCount.current = active.length;
  }, [active]);

  // Repeat "ding-ding" every 5s while there are active waiter calls.
  useEffect(() => {
    if (active.length === 0) return;
    const id = window.setInterval(() => {
      void playAlert();
    }, 5000);
    return () => window.clearInterval(id);
  }, [active.length]);

  if (active.length === 0) return null;

  const formatAge = (d: Date) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <div className="rounded-2xl bg-warning/10 p-5 shadow-ambient-sm">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-5 w-5 animate-pulse text-warning" />
        <h2 className="font-display text-base font-bold text-foreground">
          {active.length} {active.length === 1 ? 'Table needs' : 'Tables need'} attention
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {active.map((call) => (
          <div key={call.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-ambient-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-bold gradient-primary text-primary-foreground">
              {call.tableNumber}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Table {call.tableNumber}</p>
              <p className="text-xs text-muted-foreground">{formatAge(call.createdAt)}</p>
            </div>
            <Button size="sm" variant="success" onClick={() => acknowledgeCall(call.id)}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => clearCall(call.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
