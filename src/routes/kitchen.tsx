import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, ChefHat, Bell, Package, AlertCircle } from 'lucide-react';
import type { Order } from '@/lib/menu-data';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/kitchen')({
  head: () => ({
    meta: [
      { title: 'Kitchen Display — Savor' },
      { name: 'description', content: 'Real-time kitchen order display system' },
    ],
  }),
  component: KitchenPage,
});

function KitchenPage() {
  const { orders, updateOrder } = useMenu();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = [...orders]
    .filter(o => o.status !== 'served' && o.status !== 'picked')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const readyOrders = activeOrders.filter(o => o.status === 'ready' || o.status === 'ready_to_pickup');

  const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    pending: { label: 'New', color: 'bg-warning text-warning-foreground', icon: Bell },
    preparing: { label: 'Cooking', color: 'gradient-primary text-primary-foreground', icon: ChefHat },
    ready: { label: 'Ready', color: 'bg-success text-success-foreground', icon: CheckCircle },
    ready_to_pickup: { label: 'Ready to Pickup', color: 'bg-success text-success-foreground', icon: Package },
    served: { label: 'Served', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
    picked: { label: 'Picked Up', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
  };

  const statusColumns = [
    { title: 'New', orders: pendingOrders },
    { title: 'Cooking', orders: preparingOrders },
    { title: 'Ready', orders: readyOrders },
  ];

  const nextStatus = (order: Order) => {
    const status = order.status;
    const isTakeaway = order.orderType === 'takeaway';

    if (status === 'pending') return 'preparing';
    if (status === 'preparing') return isTakeaway ? 'ready_to_pickup' : 'ready';
    if (status === 'ready') return 'served';
    if (status === 'ready_to_pickup') return 'picked';
    return null;
  };

  const getElapsedMinutes = (date: Date) => {
    return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  };

  const getElapsed = (date: Date) => {
    const mins = getElapsedMinutes(date);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  const LATE_THRESHOLD_MINUTES = 10;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Kitchen Display</h1>
            <p className="mt-1 text-sm text-muted-foreground">{activeOrders.length} active orders</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 shadow-ambient-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-card shadow-ambient-sm">
            <div className="text-center">
              <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No active orders</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {statusColumns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{col.title} ({col.orders.length})</h3>
                <div className="space-y-4">
                  {col.orders.map(order => {
                    const config = statusConfig[order.status];
                    const next = nextStatus(order);
                    const elapsedMins = getElapsedMinutes(order.createdAt);
                    const isLate = elapsedMins >= LATE_THRESHOLD_MINUTES && (order.status === 'pending' || order.status === 'preparing');
                    const Icon = config?.icon || CheckCircle;
                    
                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl bg-card p-6 shadow-ambient-sm transition-all duration-300 border-2 ${
                          isLate 
                            ? 'border-red-500 bg-red-50/10' 
                            : order.status === 'pending' 
                              ? 'border-warning/30 animate-pulse-subtle' 
                              : 'border-transparent'
                        }`}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-lg font-bold text-primary">#{String(order.orderNumber ?? '?').padStart(3, '0')}</span>
                            <span className="text-sm text-muted-foreground">
                              {order.orderType === 'takeaway' ? '📦 Takeaway' : `Table ${order.tableNumber}`}
                            </span>
                            {isLate && (
                              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                LATE
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{getElapsed(order.createdAt)}</span>
                        </div>

                        <div className="space-y-2.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-surface-low px-4 py-2.5">
                              <span className="text-sm text-foreground">{item.menuItem.name}</span>
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-xs font-bold text-primary">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {next && (
                          <Button
                            className="mt-5 w-full"
                            variant={order.status === 'pending' ? 'default' : 'success'}
                            onClick={() => {
                              updateOrder({ ...order, status: next });
                              const labels: Record<string, string> = {
                                preparing: 'Cooking started',
                                ready: 'Order is ready',
                                ready_to_pickup: 'Order ready for pickup',
                                served: 'Order served',
                                picked: 'Order picked up'
                              };
                              toast.success(labels[next as string] || `Order updated to ${next}`);
                            }}
                          >
                            {next === 'preparing' && 'Start Preparing'}
                            {(next === 'ready' || next === 'ready_to_pickup') && (order.orderType === 'takeaway' ? 'Ready to Pickup' : 'Mark Ready')}
                            {(next === 'served' || next === 'picked') && (order.orderType === 'takeaway' ? 'Mark Picked' : 'Mark Served')}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
