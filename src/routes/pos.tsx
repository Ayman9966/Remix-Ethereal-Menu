import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Send, Package, Bell, Check, Printer, ShoppingCart, Plus, Minus, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MenuItem, OrderItem, Order } from '@/lib/menu-data';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const Route = createFileRoute('/pos')({
  head: () => ({
    meta: [
      { title: 'POS — Savor' },
      { name: 'description', content: 'Order management POS' },
    ],
  }),
  component: POSPage,
});

function POSPage() {
  const { items, categories, addOrder, brand, searchQuery, orders, posViewMode, setPosViewMode } = useMenu();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const awaiting_orders = orders.filter((o) => o.status === 'awaiting_approval');
  const prevCount = useRef(awaiting_orders.length);

  const playAlert = async () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      await ctx.resume();
      const now = ctx.currentTime;
      [1046.5, 783.99].forEach((freq: number, i: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, now + i * 0.25);
        g.gain.exponentialRampToValueAtTime(0.2, now + i * 0.25 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 0.5);
        o.connect(g).connect(ctx.destination);
        o.start(now + i * 0.25);
        o.stop(now + i * 0.25 + 0.6);
      });
      setTimeout(() => ctx.close(), 2000);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (awaiting_orders.length > prevCount.current) {
      void playAlert();
    }
    prevCount.current = awaiting_orders.length;
  }, [awaiting_orders.length]);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const defaultType = brand.orderingMode === 'takeaway' ? 'takeaway' : 'dine-in';
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>(defaultType);
  const [tableNumber, setTableNumber] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      awaiting_approval: 'Awaiting Approval',
      pending: 'New',
      preparing: 'Cooking',
      ready: 'Ready',
      ready_to_pickup: 'Ready to Pickup',
      served: 'Served',
      picked: 'Picked Up',
    };
    return labels[status] || status;
  };

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

  const canDineIn = brand.orderingMode === 'dine-in' || brand.orderingMode === 'both';
  const canTakeaway = brand.orderingMode === 'takeaway' || brand.orderingMode === 'both';
  const showToggle = canDineIn && canTakeaway;

  const sendOrder = () => {
    if (cart.length === 0) return;
    const orderData = {
      id: `ord-${Date.now()}`,
      items: cart,
      status: 'pending' as const,
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
    };

    addOrder(orderData);
    toast.success("Order sent to kitchen successfully!");

    if (brand.autoPrintInvoice) {
      const optimisticOrderNumber = brand.nextOrderNumber;
      const printableOrder: Order = {
        ...orderData,
        id: `temp-${Date.now()}`,
        orderNumber: optimisticOrderNumber,
      };
      setSelectedOrder(printableOrder);
      setTimeout(() => {
        window.print();
        setSelectedOrder(null);
      }, 500);
    }

    setCart([]);
    setCustomerPhone('');
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <AnimatePresence>
        {awaiting_orders.length > 0 && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 z-[100] pointer-events-auto"
          >
            <button 
              onClick={() => setShowApprovalDialog(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 shadow-2xl flex items-center justify-between gap-4 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-white/20 animate-ping" />
                  <ShoppingCart className="h-5 w-5 relative z-10" />
                </div>
                <div className="text-left">
                  <span className="font-black text-sm uppercase tracking-tighter">
                    Action Required: {awaiting_orders.length} New Online {awaiting_orders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none">Review and approve to send to kitchen</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest group-hover:bg-white/30 transition-colors">
                Open Approvals Panel
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AppHeader />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="w-full px-6 pt-4 shrink-0 space-y-4">
          <WaiterCallsPanel />
        </div>
        <div className="flex-1 flex min-h-0 overflow-hidden">
        {posViewMode === 'history' ? (
          <div className="flex-1 overflow-auto p-6">
             <h2 className="font-display text-2xl font-bold mb-6">Order History</h2>
             <div className="grid gap-4">
               {orders.map(order => (
                 <Card key={order.id}>
                   <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()} - <span className="font-medium text-primary">{getStatusLabel(order.status)}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{brand.currency}{order.total.toFixed(2)}</p>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>Details</Button>
                      </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </div>
        ) : (
          <>
            {/* Menu Section */}
            <div className="flex-1 overflow-auto p-6">
          {/* Categories */}
          <div className="mb-4 group relative">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab scroll-smooth'}`}
            >
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cat-${cat.id}`}
                    onClick={() => {
                      if (isDragging) return; // Prevent click during drag
                      setActiveCategory(cat.id);
                      document.getElementById(`cat-${cat.id}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                      });
                    }}
                    className={`flex shrink-0 snap-center items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'gradient-primary text-primary-foreground shadow-ambient-sm ring-1 ring-primary'
                        : 'bg-card text-muted-foreground hover:bg-surface-low border border-border/40'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-ambient hover:-translate-y-0.5 active:scale-[0.98] border-border/30 overflow-hidden"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} loading="lazy" width={128} height={128} className="h-14 w-full object-cover" />
                  )}
                  <div className="p-1.5 px-2">
                    <h4 className="font-display text-[10px] sm:text-[11px] font-semibold text-foreground line-clamp-1">{item.name}</h4>
                    <p className="mt-0.5 font-display text-xs font-bold text-primary leading-none">{brand.currency}{item.price.toFixed(2)}</p>
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
              <h2 className="font-display text-base font-semibold">Order</h2>
            </div>
            {orderType === 'dine-in' && canDineIn && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">T:</span>
                <select
                  value={tableNumber}
                  onChange={e => setTableNumber(Number(e.target.value))}
                  className="rounded-lg bg-surface-low px-2 py-1 text-xs font-bold text-foreground outline-none border border-border/10 hover:bg-muted-foreground/10 transition-colors"
                >
                  {Array.from({ length: brand.totalTables ?? 20 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}
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

          {orderType === 'takeaway' && (
            <div className="mb-4 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Customer Mobile</label>
              <input
                type="tel"
                placeholder="Enter mobile number..."
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl bg-surface-low px-4 py-2 text-sm font-medium text-foreground outline-none border border-border/10 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
              />
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
                    <span className="text-muted-foreground">Subtotal</span>
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
                <span className="text-base font-bold text-foreground transition-colors group-hover:text-primary">Total</span>
                {showSummary ? <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" /> : <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />}
              </div>
              <span className="font-display text-2xl font-bold text-primary">{brand.currency}{total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full mt-2" 
              size="lg" 
              onClick={sendOrder} 
              disabled={cart.length === 0 || (orderType === 'takeaway' && !customerPhone.trim())}
            >
              <Send className="h-4 w-4" />
              {orderSent ? 'Order Sent!' : 'Send to Kitchen'}
            </Button>
          </div>
        </div>
        </>
        )}
      </div>
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Viewing the summary and items for this order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/10">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Order Items</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder.orderType === 'takeaway' ? (selectedOrder.customerPhone ? `📦 Takeaway (${selectedOrder.customerPhone})` : '📦 Takeaway') : `Table ${selectedOrder.tableNumber}`}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date & Time</p>
                  <p className="text-xs text-foreground">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.quantity}x {item.menuItem.name}</p>
                      {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">{item.notes}</p>}
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">{brand.currency}{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 border-t border-border/10 pt-5 mt-2 bg-surface-low/30 rounded-2xl p-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">{brand.currency}{(selectedOrder.subtotal ?? selectedOrder.total).toFixed(2)}</span>
                </div>
                {selectedOrder.taxAmount ? (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax Amount</span>
                    <span className="font-medium text-foreground">{brand.currency}{selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                {selectedOrder.serviceChargeAmount ? (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Service Charge</span>
                    <span className="font-medium text-foreground">{brand.currency}{selectedOrder.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                {selectedOrder.additionalFeeAmount ? (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Other Fees</span>
                    <span className="font-medium text-foreground">{brand.currency}{selectedOrder.additionalFeeAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-3 mt-1 border-t border-dashed border-border/40">
                  <span className="text-base font-bold text-foreground">Total Paid</span>
                  <span className="text-xl font-display font-bold text-primary">{brand.currency}{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button className="flex-1" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ApprovalDialog 
        open={showApprovalDialog} 
        onOpenChange={setShowApprovalDialog} 
      />

      {/* Hidden printable invoice */}
      {selectedOrder && (
        <div className={`printable-invoice ${brand.invoiceSize === '58mm' ? 'invoice-58mm' : 'invoice-80mm'}`} aria-hidden="true">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wider">{brand.restaurantName}</h1>
          </div>
          <div className="border-y border-dashed border-gray-400 py-3 mb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Order #</span>
              <span className="font-bold">#{selectedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Table</span>
              <span>{selectedOrder.tableNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="capitalize">{selectedOrder.orderType}</span>
            </div>
            {selectedOrder.customerPhone && (
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-bold">{selectedOrder.customerPhone}</span>
              </div>
            )}
          </div>

          <table className="w-full text-xs">
            <thead className="border-b border-dashed border-gray-400">
              <tr className="text-left font-bold">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, i) => (
                <tr key={i} className="border-b border-dotted border-gray-200">
                  <td className="py-2">
                     <p className="font-semibold">{item.menuItem.name}</p>
                     {item.notes && <p className="text-[10px] text-gray-500 italic">Note: {item.notes}</p>}
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{brand.currency}{(item.menuItem.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 border-t border-dashed border-gray-400 pt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Items Subtotal</span>
              <span>{brand.currency}{(selectedOrder.subtotal ?? selectedOrder.total).toFixed(2)}</span>
            </div>
            {selectedOrder.taxAmount ? (
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Tax</span>
                <span>{brand.currency}{selectedOrder.taxAmount.toFixed(2)}</span>
              </div>
            ) : null}
            {selectedOrder.serviceChargeAmount ? (
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Service Charge</span>
                <span>{brand.currency}{selectedOrder.serviceChargeAmount.toFixed(2)}</span>
              </div>
            ) : null}
            {selectedOrder.additionalFeeAmount ? (
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>{brand.additionalFeeName || 'Other Fees'}</span>
                <span>{brand.currency}{selectedOrder.additionalFeeAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-dotted border-gray-400 pt-2 text-sm font-bold text-gray-900">
              <span className="uppercase">Grand Total</span>
              <span>{brand.currency}{selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs border-t border-dashed border-gray-400 pt-4">
            <p>Thank you for dining with us!</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function ApprovalDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { orders, updateOrder, brand } = useMenu();
  const awaiting = orders.filter((o) => o.status === 'awaiting_approval');

  const getRelativeTime = (d: Date) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 border-b shrink-0 bg-surface-low/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">
                  Online Order Approvals
                </DialogTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  {awaiting.length} Orders awaiting confirmation
                </p>
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
          {awaiting.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-surface-low flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-base font-black text-foreground">Zero Pending Orders</h3>
              <p className="text-sm font-bold text-muted-foreground max-w-[240px] mt-2">All online orders have been processed. Great job!</p>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-8 rounded-xl font-bold">Close Panel</Button>
            </div>
          ) : (
            awaiting.map((order) => (
              <div key={order.id} className="rounded-3xl bg-card border border-border/50 shadow-ambient-sm overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="p-5 flex items-center justify-between border-b bg-surface-low/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-display font-black gradient-primary text-primary-foreground text-lg shadow-ambient-sm">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-foreground">
                        {order.orderType === 'takeaway' ? '📦 Takeaway' : `🍽️ Table ${order.tableNumber}`}
                      </h3>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        Placed {getRelativeTime(new Date(order.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary leading-none">
                      {brand.currency}{order.total.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1.5">
                      {order.items.length} Items Summary
                    </p>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground">
                          {item.quantity}x <span className="font-bold text-muted-foreground/80">{item.menuItem.name}</span>
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mt-1 italic border border-amber-100/50 inline-block">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black text-muted-foreground/40">{brand.currency}{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-5 pt-0 flex gap-3">
                  <Button 
                    className="flex-1 h-12 rounded-2xl font-black text-sm shadow-ambient-sm hover:shadow-ambient transition-all active:scale-[0.98]" 
                    onClick={() => {
                      updateOrder({ ...order, status: 'pending' });
                      toast.success(`Order #${order.orderNumber} approved and sent to kitchen!`);
                    }}
                  >
                    Approve Order
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-12 px-6 rounded-2xl text-destructive hover:bg-destructive/10 font-black text-sm transition-colors"
                    onClick={() => {
                      updateOrder({ ...order, status: 'served' }); 
                      toast.error(`Order #${order.orderNumber} dismissed.`);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
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
