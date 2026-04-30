import { createFileRoute } from '@tanstack/react-router';
import { useMenu } from '@/hooks/use-menu-context';
import { Search, Clock, UtensilsCrossed, Plus, Minus, ShoppingCart, X, Send, Check, Package, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MenuItem, OrderItem, Order } from '@/lib/menu-data';

export const Route = createFileRoute('/menu')({
  validateSearch: (search: Record<string, unknown>): { table?: number } => {
    const raw = search.table;
    const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseInt(raw, 10) : NaN;
    return { table: Number.isFinite(n) && n > 0 ? (n as number) : undefined };
  },
  head: () => ({
    meta: [
      { title: 'Menu — Savor' },
      { name: 'description', content: 'Browse our curated menu of modern dining experiences' },
    ],
  }),
  component: CustomerMenuPage,
});

function CustomerMenuPage() {
  const { items, categories, brand, orders, addOrder, callWaiter, waiterCalls, isLoading } = useMenu();
  const { table: lockedTable } = Route.useSearch();
  const [showCallWaiter, setShowCallWaiter] = useState(false);
  const [callTable, setCallTable] = useState(lockedTable ?? 1);
  const [now, setNow] = useState(() => Date.now());
  const [splashFinished, setSplashFinished] = useState(false);

  // Core state hooks (must be before any conditional returns)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  const defaultType: 'dine-in' | 'takeaway' = lockedTable
    ? 'dine-in'
    : brand.orderingMode === 'takeaway' ? 'takeaway' : 'dine-in';
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>(defaultType);
  const [tableNumber, setTableNumber] = useState(lockedTable ?? 1);
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('savor_customer_phone') || '');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('my_takeaway_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [labelsExpanded, setLabelsExpanded] = useState(true);

  // Tick every second to update relative times and cooldowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isLoading && !splashFinished) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setSplashFinished(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, splashFinished]);

  // UI behavior hooks
  useEffect(() => {
    if (!labelsExpanded) return;
    const timer = setTimeout(() => {
      setLabelsExpanded(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [labelsExpanded]);

  useEffect(() => {
    localStorage.setItem('my_takeaway_orders', JSON.stringify(myOrderIds));
  }, [myOrderIds]);

  useEffect(() => {
    localStorage.setItem('savor_customer_phone', customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'my_takeaway_orders' && e.newValue) {
        try {
          const nextIds = JSON.parse(e.newValue);
          setMyOrderIds(nextIds);
        } catch (err) {
          console.error('Failed to parse my_takeaway_orders from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const myActiveOrders = useMemo(() => {
    const TEN_MINS = 10 * 60 * 1000;
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const currentNow = now; // using currentNow to avoid dependency on global state if it changes mid-render
    return orders.filter(o => {
      if (!myOrderIds.includes(o.id)) return false;
      const age = currentNow - new Date(o.createdAt).getTime();
      const ageSinceUpdate = currentNow - new Date(o.updatedAt).getTime();
      if (o.status !== 'picked') return age < THREE_HOURS;
      return ageSinceUpdate < TEN_MINS;
    });
  }, [orders, myOrderIds, now]);

  useEffect(() => {
    const cleanup = () => {
      const THREE_HOURS = 3 * 60 * 60 * 1000;
      const currentNow = Date.now();
      setMyOrderIds(prev => {
        const filtered = prev.filter(id => {
          const parts = id.split('-');
          if (parts.length >= 2 && parts[0] === 'ord') {
            const timestamp = parseInt(parts[1]);
            if (!isNaN(timestamp)) return (currentNow - timestamp) < THREE_HOURS;
          }
          const order = orders.find(o => o.id === id);
          if (order) return (currentNow - new Date(order.createdAt).getTime()) < THREE_HOURS;
          return true; 
        });
        return filtered.length !== prev.length ? filtered : prev;
      });
    };
    cleanup();
    const interval = setInterval(cleanup, 60000);
    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    if (lockedTable) {
      setTableNumber(lockedTable);
      setCallTable(lockedTable);
      setOrderType('dine-in');
    }
  }, [lockedTable]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  // Conditional return for splash screen must be AFTER all hooks
  if (isLoading || !splashFinished) {
    return (
      <motion.div 
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      >
        <div className="text-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
          >
            <UtensilsCrossed className="h-10 w-10 text-primary" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-4xl font-bold text-foreground"
          >
            {brand.restaurantName}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-3 text-muted-foreground"
          >
            {brand.tagline}
          </motion.p>

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.6, duration: 2, ease: "easeInOut" }}
            className="mt-12 h-1 w-48 mx-auto rounded-full bg-surface-low overflow-hidden"
          >
            <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-full w-full bg-primary"
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const COOLDOWN_MS = 60_000;
  const lastCallForTable = waiterCalls
    .filter(c => c.tableNumber === callTable)
    .reduce<number>((max, c) => Math.max(max, new Date(c.createdAt).getTime()), 0);
  const cooldownRemaining = Math.max(0, Math.ceil((COOLDOWN_MS - (now - lastCallForTable)) / 1000));
  const onCooldown = cooldownRemaining > 0 && lastCallForTable > 0;
  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const ordering = brand.onlineOrderingEnabled;

  const filtered = items.filter(item => {
    if (!item.available) return false;
    if (activeCategory && item.categoryId !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getRelativeTime = (date: Date) => {
    const diff = Math.floor((now - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const grouped = activeCategory
    ? [{ category: categories.find(c => c.id === activeCategory)!, items: filtered.sort((a, b) => a.name.localeCompare(b.name)) }]
    : sortedCategories
        .map(cat => ({ 
          category: cat, 
          items: filtered.filter(i => i.categoryId === cat.id).sort((a, b) => a.name.localeCompare(b.name)) 
        }))
        .filter(g => g.items.length > 0);

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

  const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  
  const shouldApplyTax = brand.taxEnabled && (orderType === 'dine-in' ? brand.taxApplyDineIn : brand.taxApplyTakeaway);
  const tax = shouldApplyTax 
    ? (brand.taxType === 'percentage' ? (subtotal * (brand.taxRate / 100)) : brand.taxRate)
    : 0;
    
  const shouldApplyServiceCharge = brand.serviceChargeEnabled && (orderType === 'dine-in' ? brand.serviceChargeApplyDineIn : brand.serviceChargeApplyTakeaway);
  const serviceCharge = shouldApplyServiceCharge
    ? (brand.serviceChargeType === 'percentage' ? (subtotal * (brand.serviceChargeRate / 100)) : brand.serviceChargeRate)
    : 0;
    
  const shouldApplyAdditionalFee = brand.additionalFeeEnabled && (orderType === 'dine-in' ? brand.additionalFeeApplyDineIn : brand.additionalFeeApplyTakeaway);
  const additionalFee = shouldApplyAdditionalFee
    ? (brand.additionalFeeType === 'percentage' ? (subtotal * (brand.additionalFeeAmount / 100)) : brand.additionalFeeAmount)
    : 0;

  const total = subtotal + tax + serviceCharge + additionalFee;
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const getItemQty = (id: string) => cart.find(c => c.menuItem.id === id)?.quantity ?? 0;

  const placeOrder = () => {
    if (cart.length === 0) return;
    const orderId = `ord-${Date.now()}`;
    addOrder({
      id: orderId,
      items: cart,
      status: 'pending',
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customerPhone: orderType === 'takeaway' ? customerPhone : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      total,
      subtotal,
      taxAmount: tax,
      serviceChargeAmount: serviceCharge,
      additionalFeeAmount: additionalFee,
    });
    
    if (orderType === 'takeaway') {
      setMyOrderIds(prev => [orderId, ...prev]);
    }
    
    setCart([]);
    setShowCart(false);
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const canDineIn = brand.orderingMode === 'dine-in' || brand.orderingMode === 'both';
  const canTakeaway = brand.orderingMode === 'takeaway' || brand.orderingMode === 'both';
  const showToggle = canDineIn && canTakeaway && !lockedTable;

  const menuScale = brand.menuScale ?? 100;

  return (
    <div className="min-h-screen bg-background" style={{ zoom: menuScale / 100 }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {brand.heroImageUrl ? (
          <>
            <img 
              src={brand.heroImageUrl} 
              alt="" 
              className="absolute inset-0 h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-foreground/50" />
          </>
        ) : (
          <div className="absolute inset-0 gradient-primary" />
        )}
        <div className="relative px-4 py-16 text-center">
          <div className="w-full">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold text-primary-foreground">{brand.restaurantName}</h1>
            <p className="mt-2 text-primary-foreground/70">{brand.tagline}</p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full rounded-2xl bg-card py-3.5 pl-11 pr-4 text-base text-foreground shadow-ambient-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-xl px-5 py-2 text-sm font-medium transition-all ${
              !activeCategory ? 'gradient-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-surface-low'
            }`}
          >
            All
          </button>
          {sortedCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.id ? 'gradient-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-surface-low'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-10">
          {grouped.map(({ category, items: groupItems }) => (
            <section key={category.id}>
              <h2 className="mb-5 font-display text-xl font-bold text-foreground">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h2>
              <div className="space-y-3">
                {groupItems.map(item => {
                  const qty = getItemQty(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 rounded-2xl bg-card p-5 shadow-ambient-sm transition-all duration-200 hover:shadow-ambient"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          width={512}
                          height={512}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-semibold text-foreground">{item.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-lg font-bold text-primary">{brand.currency}{item.price.toFixed(2)}</span>
                            {brand.showPrepTime && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {item.preparationTime} min
                              </span>
                            )}
                          </div>
                          {ordering && (
                            <>
                              {qty === 0 ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ambient-sm transition-all hover:shadow-ambient active:scale-95"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => updateQty(item.id, -1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-low text-foreground hover:bg-muted-foreground/20"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-5 text-center text-sm font-semibold text-foreground">{qty}</span>
                                  <button
                                    onClick={() => updateQty(item.id, 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>

      {/* Order Placed Toast */}
      {orderPlaced && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-ambient">
            <Check className="h-5 w-5" />
            <span className="font-medium">Order placed successfully!</span>
          </div>
        </div>
      )}

      {/* Floating My Orders Button (Takeaway tracking) */}
      {myActiveOrders.length > 0 && !showCart && !showMyOrders && (
        <button
          onClick={() => setShowMyOrders(true)}
          onMouseEnter={() => setLabelsExpanded(true)}
          className={`fixed z-40 flex items-center gap-2 rounded-2xl bg-success px-5 py-3.5 text-success-foreground shadow-ambient transition-all hover:shadow-lg active:scale-95 ${
            ordering && cartCount > 0 ? 'bottom-40 right-6' : 'bottom-24 right-6'
          } ${!labelsExpanded ? 'w-[52px] px-0 justify-center' : ''}`}
          aria-label="My orders"
        >
          <UtensilsCrossed className="h-5 w-5" />
          <AnimatePresence mode="popLayout" initial={false}>
            {labelsExpanded && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap text-sm font-medium"
              >
                My Orders ({myActiveOrders.length})
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* My Orders Modal */}
      {showMyOrders && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowMyOrders(false)} />
          <div className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-8 rounded-3xl bg-card p-6 shadow-2xl border border-border/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Order Status</h3>
              <button onClick={() => setShowMyOrders(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-low">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="max-h-[60vh] space-y-4 overflow-auto py-2">
              {myActiveOrders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No orders in progress.</p>
              ) : (
                myActiveOrders.map((order: Order) => (
                  <div key={order.id} className="rounded-2xl border border-border/50 bg-surface-low p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <span className="font-display text-lg font-bold text-primary">Order #{String(order.orderNumber).padStart(3, '0')}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getRelativeTime(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        order.status === 'ready_to_pickup' ? 'bg-success text-success-foreground animate-pulse' : 
                        order.status === 'picked' ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'
                      }`}>
                        {order.status === 'pending' && 'Received'}
                        {order.status === 'preparing' && 'In Kitchen'}
                        {order.status === 'ready_to_pickup' && 'Ready to Collect!'}
                        {order.status === 'picked' && 'Picked Up'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((item: any, i: number) => (
                        <span key={i} className="rounded-lg bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                      ))}
                    </div>

                    {order.status === 'ready_to_pickup' && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-xs font-medium text-success">
                        <Package className="h-4 w-4" />
                        Your food is ready! Please collect it from the counter.
                      </div>
                    )}
                    {order.status === 'picked' && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                        <Check className="h-4 w-4" />
                        Enjoy your meal!
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={() => setShowMyOrders(false)}
              className="mt-6 w-full rounded-2xl bg-surface-low py-3 text-sm font-medium text-foreground hover:bg-muted-foreground/10"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Floating Call Waiter Button (only when dine-in available) */}
      {(brand.orderingMode === 'dine-in' || brand.orderingMode === 'both') && !showCart && (
        <button
          onClick={() => setShowCallWaiter(true)}
          onMouseEnter={() => setLabelsExpanded(true)}
          className={`fixed z-40 flex items-center gap-2 rounded-2xl bg-card px-5 py-3.5 text-foreground shadow-ambient transition-all hover:shadow-lg active:scale-95 ${
            ordering && cartCount > 0 ? 'bottom-24 right-6' : 'bottom-6 right-6'
          } ${!labelsExpanded ? 'w-[52px] px-0 justify-center' : ''}`}
          aria-label="Call waiter"
        >
          <Bell className="h-5 w-5 text-primary" />
          <AnimatePresence mode="popLayout" initial={false}>
            {labelsExpanded && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap text-sm font-medium"
              >
                Call Waiter
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Call Waiter Modal */}
      {showCallWaiter && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowCallWaiter(false)} />
          <div className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-8 rounded-3xl bg-card p-6 shadow-2xl border border-border/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Call a Waiter</h3>
              <button onClick={() => setShowCallWaiter(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-low">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Select your table and we'll send a waiter right over.</p>
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-surface-low p-3">
              <span className="text-sm text-muted-foreground">Table</span>
              {lockedTable ? (
                <span className="flex-1 rounded-lg bg-card px-3 py-2 text-sm font-semibold text-foreground">
                  Table {lockedTable}
                </span>
              ) : (
                <select
                  value={callTable}
                  onChange={e => setCallTable(Number(e.target.value))}
                  className="flex-1 rounded-lg bg-card px-3 py-2 text-base font-medium text-foreground outline-none"
                >
                  {Array.from({ length: brand.totalTables ?? 20 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Table {i + 1}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              disabled={onCooldown}
              onClick={() => {
                const res = callWaiter(callTable);
                if (res.ok) {
                  toast.success(`Waiter called to Table ${callTable}`);
                  setShowCallWaiter(false);
                }
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-medium shadow-ambient-sm transition-all active:scale-[0.98] ${
                onCooldown
                  ? 'bg-surface-low text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:shadow-ambient'
              }`}
            >
              {onCooldown ? (
                <>
                  <Clock className="h-4 w-4" />
                  Available in {formatCountdown(cooldownRemaining)}
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Send Request
                </>
              )}
            </button>
            <button
              onClick={() => setShowCallWaiter(false)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-low py-3 text-sm font-medium text-foreground hover:bg-muted-foreground/10 active:scale-[0.98]"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      {ordering && cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-ambient transition-all hover:shadow-lg active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{cartCount} items · {brand.currency}{total.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {ordering && showCart && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-8 rounded-3xl bg-card p-6 shadow-2xl border border-border/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Your Order</h3>
              <button onClick={() => setShowCart(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-low">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order type toggle */}
            {showToggle && (
              <div className="mb-4 flex gap-2 rounded-xl bg-surface-low p-1">
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

            {orderType === 'takeaway' && (
              <div className="mb-4 space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter your mobile number..."
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl bg-surface-low px-4 py-2 text-base font-medium text-foreground outline-none border border-border/10 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            )}

            {/* Table selector — only for dine-in */}
            {orderType === 'dine-in' && canDineIn && (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface-low p-3">
                <span className="text-sm text-muted-foreground">Table Number</span>
                {lockedTable ? (
                  <span className="flex-1 rounded-lg bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                    Table {lockedTable}
                  </span>
                ) : (
                  <select
                    value={tableNumber}
                    onChange={e => setTableNumber(Number(e.target.value))}
                    className="flex-1 rounded-lg bg-card px-3 py-1.5 text-base font-medium text-foreground outline-none"
                  >
                    {Array.from({ length: brand.totalTables ?? 20 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="max-h-64 space-y-2 overflow-auto">
              {cart.map(c => (
                <div key={c.menuItem.id} className="flex items-center gap-3 rounded-xl bg-surface-low p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.currency}{(c.menuItem.price * c.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(c.menuItem.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{c.quantity}</span>
                    <button onClick={() => updateQty(c.menuItem.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeFromCart(c.menuItem.id)} className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/10">
              <AnimatePresence>
                {showSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2 mb-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Items Subtotal</span>
                      <span className="font-medium text-foreground">{brand.currency}{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {shouldApplyTax && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          Tax {brand.taxType === 'percentage' && <span className="text-[10px] bg-muted px-1 rounded uppercase font-bold text-muted-foreground">{brand.taxRate}%</span>}
                        </span>
                        <span className="font-medium text-foreground">{brand.currency}{tax.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {shouldApplyServiceCharge && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          Service {brand.serviceChargeType === 'percentage' && <span className="text-[10px] bg-muted px-1 rounded uppercase font-bold text-muted-foreground">{brand.serviceChargeRate}%</span>}
                        </span>
                        <span className="font-medium text-foreground">{brand.currency}{serviceCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {shouldApplyAdditionalFee && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          {brand.additionalFeeName} {brand.additionalFeeType === 'percentage' && <span className="text-[10px] bg-muted px-1 rounded uppercase font-bold text-muted-foreground">{brand.additionalFeeAmount}%</span>}
                        </span>
                        <span className="font-medium text-foreground">{brand.currency}{additionalFee.toFixed(2)}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                className="flex items-center justify-between pt-3 mt-1 border-t border-dashed border-border/40 cursor-pointer group"
                onClick={() => setShowSummary(!showSummary)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">Amount to Pay</span>
                  {showSummary ? <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> : <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
                <span className="font-display text-2xl font-bold text-primary">{brand.currency}{total.toFixed(2)}</span>
              </div>
              <button
                onClick={placeOrder}
                disabled={cart.length === 0 || (orderType === 'takeaway' && !customerPhone.trim())}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-ambient transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Place Order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
