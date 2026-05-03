import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalDialog({ open, onOpenChange }: ApprovalDialogProps) {
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
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
          <AnimatePresence mode="popLayout">
            {awaiting.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-surface-low flex items-center justify-center mb-6">
                  <Check className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-base font-black text-foreground">Zero Pending Orders</h3>
                <p className="text-sm font-bold text-muted-foreground max-w-[240px] mt-2">All online orders have been processed. Great job!</p>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-8 rounded-xl font-bold">Close Panel</Button>
              </motion.div>
            ) : (
              awaiting.map((order) => (
                <motion.div 
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-3xl bg-card border border-border/50 shadow-ambient-sm overflow-hidden group hover:border-primary/30 transition-colors"
                >
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
                        toast.error(`Order #${order.orderNumber} rejected.`);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
