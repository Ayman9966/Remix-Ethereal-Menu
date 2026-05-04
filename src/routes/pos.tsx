import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { ApprovalDialog } from '@/components/ApprovalDialog';
import { WaiterCallsDialog } from '@/components/WaiterCallsDialog';
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
  const { items, categories, addOrder, brand, searchQuery, orders, waiterCalls, posViewMode, setPosViewMode } = useMenu();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showWaiterCallsDialog, setShowWaiterCallsDialog] = useState(false);
  const awaiting_orders = orders.filter((o) => o.status === 'awaiting_approval');
  const active_waiter_calls = waiterCalls.filter(c => !c.acknowledged);

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
    <div className="flex h-screen flex-col min-h-0 overflow-hidden relative bg-background">
      <AppHeader 
        onOpenApprovals={() => setShowApprovalDialog(true)} 
        awaitingCount={awaiting_orders.length}
        onOpenWaiterCalls={() => setShowWaiterCallsDialog(true)}
        waiterCallsCount={active_waiter_calls.length}
      />
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

      <WaiterCallsDialog
        open={showWaiterCallsDialog}
        onOpenChange={setShowWaiterCallsDialog}
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

