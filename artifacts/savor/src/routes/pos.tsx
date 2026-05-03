import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { ApprovalDialog } from '@/components/ApprovalDialog';
import { WaiterCallsDialog } from '@/components/WaiterCallsDialog';
import { useMenu } from '@/hooks/use-menu-context';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Send, Package, Bell, Check, Printer, ShoppingCart, Plus, Minus, ChevronDown, ChevronUp, WifiOff, MessageSquare } from 'lucide-react';
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
  const { items, categories, addOrder, brand, searchQuery, orders, waiterCalls, posViewMode, setPosViewMode } = useMenu();
  const { isOnline } = useOnlineStatus();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showWaiterCallsDialog, setShowWaiterCallsDialog] = useState(false);
  const awaiting_orders = orders.filter((o) => o.status === 'awaiting_approval');
  const active_waiter_calls = waiterCalls.filter(c => !c.acknowledged);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Auto-print: fires after printingOrder is set and invoice DOM is painted
  useEffect(() => {
    if (!printingOrder) return;
    // Double rAF ensures two paint cycles — invoice is guaranteed rendered
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setPrintingOrder(null);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [printingOrder]);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const defaultType = brand.orderingMode === 'takeaway' ? 'takeaway' : 'dine-in';
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>(defaultType);
  const [tableNumber, setTableNumber] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

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
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItem.id !== id) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? null! : { ...c, quantity: newQty };
    }).filter(Boolean));
  };

  const updateNote = (id: string, note: string) => {
    setCart(prev => prev.map(c => c.menuItem.id === id ? { ...c, notes: note } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const hasItems = cart.length > 0;
  
  // Only apply fees when cart has items — avoids confusing non-zero total on empty cart
  const shouldApplyTax = hasItems && brand.taxEnabled && (orderType === 'dine-in' ? brand.taxApplyDineIn : brand.taxApplyTakeaway);
  const tax = shouldApplyTax 
    ? (brand.taxType === 'percentage' ? (subtotal * (brand.taxRate / 100)) : brand.taxRate)
    : 0;

  const shouldApplyServiceCharge = hasItems && brand.serviceChargeEnabled && (orderType === 'dine-in' ? brand.serviceChargeApplyDineIn : brand.serviceChargeApplyTakeaway);
  const serviceCharge = shouldApplyServiceCharge
    ? (brand.serviceChargeType === 'percentage' ? (subtotal * (brand.serviceChargeRate / 100)) : brand.serviceChargeRate)
    : 0;

  const shouldApplyAdditionalFee = hasItems && brand.additionalFeeEnabled && (orderType === 'dine-in' ? brand.additionalFeeApplyDineIn : brand.additionalFeeApplyTakeaway);
  const additionalFee = shouldApplyAdditionalFee
    ? (brand.additionalFeeType === 'percentage' ? (subtotal * (brand.additionalFeeAmount / 100)) : brand.additionalFeeAmount)
    : 0;

  const total = subtotal + tax + serviceCharge + additionalFee;

  const canDineIn = brand.orderingMode === 'dine-in' || brand.orderingMode === 'both';
  const canTakeaway = brand.orderingMode === 'takeaway' || brand.orderingMode === 'both';
  const showToggle = canDineIn && canTakeaway;

  const sendOrder = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const orderData = {
      id: orderId,
      items: cart,
      status: 'pending' as const,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customerPhone: orderType === 'takeaway' ? customerPhone : undefined,
      createdAt: now,
      updatedAt: now,
      total,
      subtotal,
      taxAmount: tax,
      serviceChargeAmount: serviceCharge,
      additionalFeeAmount: additionalFee,
    };

    addOrder(orderData);

    if (isOnline) {
      toast.success("Order sent to kitchen!");
    } else {
      toast.warning("Offline — order saved locally and will sync when reconnected.", {
        duration: 4000,
      });
    }

    if (brand.autoPrintInvoice) {
      const optimisticOrderNumber = brand.nextOrderNumber;
      const printableOrder: Order = {
        ...orderData,
        orderNumber: optimisticOrderNumber,
      };
      setPrintingOrder(printableOrder);
    }

    setCart([]);
    setEditingNoteId(null);
    setCustomerPhone('');
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 2000);
  };

  return (
    <div className="flex h-screen flex-col min-h-0 overflow-hidden relative bg-background">
      <AppHeader 
        onOpenApprovals={() => setShowApprovalDialog(true)} 
        awaitingCount={awaiting_orders.length}
        onOpenWaiterCalls={() => setShowWaiterCallsDialog(true)}
        waiterCallsCount={active_waiter_calls.length}
      />
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-amber-700 dark:text-amber-400">
          <WifiOff className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium">Offline mode — orders will be saved locally and synced when connection is restored</p>
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
        <div className="w-80 shrink-0 bg-card p-6 border-l border-border/40 flex flex-col lg:w-96">
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

          <div className="flex-1 overflow-auto space-y-2">
            {cart.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShoppingCart className="h-8 w-8 opacity-30" />
                <span>Tap items to add to order</span>
              </div>
            ) : (
              cart.map(c => (
                <div key={c.menuItem.id} className="rounded-xl bg-surface-low overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">{brand.currency}{(c.menuItem.price * c.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNoteId(editingNoteId === c.menuItem.id ? null : c.menuItem.id)}
                        title="Add note"
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          c.notes ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-card'
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => updateQty(c.menuItem.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-surface-high">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{c.quantity}</span>
                      <button onClick={() => updateQty(c.menuItem.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-surface-high">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeFromCart(c.menuItem.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {editingNoteId === c.menuItem.id && (
                    <div className="px-3 pb-3">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Special instructions (e.g. no onions)..."
                        value={c.notes ?? ''}
                        onChange={e => updateNote(c.menuItem.id, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && setEditingNoteId(null)}
                        className="w-full rounded-lg bg-card px-3 py-1.5 text-xs text-foreground outline-none border border-border/20 focus:border-primary/40 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}
                  {c.notes && editingNoteId !== c.menuItem.id && (
                    <p className="px-3 pb-2 text-[10px] text-primary/70 italic truncate">📝 {c.notes}</p>
                  )}
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
              variant={!isOnline && cart.length > 0 ? 'outline' : 'default'}
            >
              {orderSent ? (
                <><Check className="h-4 w-4" /> {isOnline ? 'Order Sent!' : 'Order Queued!'}</>
              ) : isOnline ? (
                <><Send className="h-4 w-4" /> Send to Kitchen</>
              ) : (
                <><WifiOff className="h-4 w-4" /> Queue Order (Offline)</>
              )}
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

      <WaiterCallsDialog
        open={showWaiterCallsDialog}
        onOpenChange={setShowWaiterCallsDialog}
      />

      {/* Hidden printable invoice — rendered for both manual print (selectedOrder) and auto-print (printingOrder) */}
      {(selectedOrder || printingOrder) && (() => {
        const inv = printingOrder ?? selectedOrder!;
        const sizeClass = brand.invoiceSize === '58mm' ? 'invoice-58mm' : 'invoice-80mm';
        const dt = new Date(inv.createdAt);
        const dateStr = dt.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isDineIn = inv.orderType === 'dine-in';
        return (
          <div className={`printable-invoice ${sizeClass}`} aria-hidden="true" style={{ fontFamily: "'Inter', monospace" }}>

            {/* ── HEADER ─────────────────────────────── */}
            <div style={{ textAlign: 'center', paddingBottom: '3mm', borderBottom: '2px solid #111', marginBottom: '3mm' }}>
              <div style={{ fontSize: '13pt', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase', lineHeight: 1.2 }}>
                {brand.restaurantName}
              </div>
              {brand.tagline && (
                <div style={{ fontSize: '7pt', color: '#555', marginTop: '1mm', fontStyle: 'italic' }}>
                  {brand.tagline}
                </div>
              )}
            </div>

            {/* ── ORDER INFO ─────────────────────────── */}
            <div style={{ fontSize: '7.5pt', marginBottom: '3mm', borderBottom: '1px dashed #999', paddingBottom: '3mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm' }}>
                <span style={{ color: '#555' }}>Order</span>
                <span style={{ fontWeight: '900' }}>#{String(inv.orderNumber).padStart(3, '0')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm' }}>
                <span style={{ color: '#555' }}>Date</span>
                <span>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm' }}>
                <span style={{ color: '#555' }}>Time</span>
                <span>{timeStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm' }}>
                <span style={{ color: '#555' }}>Type</span>
                <span style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {isDineIn ? '🍽 Dine-In' : '📦 Takeaway'}
                </span>
              </div>
              {isDineIn && inv.tableNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm' }}>
                  <span style={{ color: '#555' }}>Table</span>
                  <span style={{ fontWeight: '700' }}>Table {inv.tableNumber}</span>
                </div>
              )}
              {inv.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#555' }}>Phone</span>
                  <span style={{ fontWeight: '700' }}>{inv.customerPhone}</span>
                </div>
              )}
            </div>

            {/* ── ITEMS TABLE ────────────────────────── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3mm' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #111', borderTop: '1px solid #111' }}>
                  <th style={{ textAlign: 'left', padding: '1.5mm 0', fontSize: '7pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '1.5mm 0', fontSize: '7pt', fontWeight: '900', width: '7mm' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '1.5mm 0', fontSize: '7pt', fontWeight: '900' }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px dotted #ddd' }}>
                    <td style={{ padding: '1.8mm 1mm 1.8mm 0', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', lineHeight: 1.2 }}>{item.menuItem.name}</div>
                      {item.notes && (
                        <div style={{ fontSize: '6.5pt', color: '#777', fontStyle: 'italic', marginTop: '0.5mm' }}>
                          ↳ {item.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '1.8mm 0', verticalAlign: 'top', color: '#444' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', padding: '1.8mm 0', verticalAlign: 'top', whiteSpace: 'nowrap', fontWeight: '600' }}>
                      {brand.currency}{(item.menuItem.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── TOTALS ─────────────────────────────── */}
            <div style={{ borderTop: '1px dashed #999', paddingTop: '2.5mm', fontSize: '7.5pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <span style={{ color: '#555' }}>Subtotal</span>
                <span>{brand.currency}{(inv.subtotal ?? inv.total).toFixed(2)}</span>
              </div>
              {inv.taxAmount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                  <span style={{ color: '#555' }}>Tax</span>
                  <span>{brand.currency}{inv.taxAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {inv.serviceChargeAmount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                  <span style={{ color: '#555' }}>Service Charge</span>
                  <span>{brand.currency}{inv.serviceChargeAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {inv.additionalFeeAmount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                  <span style={{ color: '#555' }}>{brand.additionalFeeName || 'Fee'}</span>
                  <span>{brand.currency}{inv.additionalFeeAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {/* Grand total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111', paddingTop: '2mm', marginTop: '1.5mm', fontWeight: '900', fontSize: '11pt', letterSpacing: '0.5px' }}>
                <span style={{ textTransform: 'uppercase' }}>Total</span>
                <span>{brand.currency}{inv.total.toFixed(2)}</span>
              </div>
            </div>

            {/* ── FOOTER ─────────────────────────────── */}
            <div style={{ marginTop: '5mm', paddingTop: '2.5mm', borderTop: '1px dashed #999', textAlign: 'center', fontSize: '7pt', color: '#555' }}>
              <div style={{ fontWeight: '700', fontSize: '8pt', marginBottom: '1mm', color: '#111' }}>
                Thank you for your visit! 🙏
              </div>
              {brand.tagline && (
                <div style={{ fontStyle: 'italic', marginBottom: '2mm' }}>{brand.tagline}</div>
              )}
              <div style={{ letterSpacing: '4px', fontSize: '6pt', color: '#aaa', marginTop: '2mm' }}>
                ✦ ✦ ✦ ✦ ✦ ✦ ✦
              </div>
            </div>

          </div>
        );
      })()}
      </div>
    </div>
  );
}

