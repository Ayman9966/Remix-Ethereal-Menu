import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Bell, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface WaiterCallsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaiterCallsDialog({ open, onOpenChange }: WaiterCallsDialogProps) {
  const { waiterCalls, acknowledgeCall, clearCall } = useMenu();
  const active = waiterCalls.filter((c) => !c.acknowledged);
  const [, force] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const formatAge = (d: Date) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 border-b shrink-0 bg-surface-low/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">
                  Table Attention Requests
                </DialogTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  {active.length} ACTIVE CALLS TO HANDLE
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-muted/20">
          <AnimatePresence mode="popLayout">
            {active.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-surface-low flex items-center justify-center mb-6">
                  <Check className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-base font-black text-foreground">All Tables Set</h3>
                <p className="text-sm font-bold text-muted-foreground mt-2">No active service requests at the moment.</p>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-8 rounded-xl font-bold">Close Panel</Button>
              </motion.div>
            ) : (
              active.map((call) => (
                <motion.div 
                  key={call.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-ambient-sm border border-border/50 group hover:border-primary/30 transition-colors"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display font-black gradient-primary text-primary-foreground text-xl shadow-ambient-sm">
                    {call.tableNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-foreground">Table {call.tableNumber}</h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{formatAge(call.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => acknowledgeCall(call.id)} 
                      className="rounded-xl h-10 px-4 font-bold shadow-ambient-sm active:scale-95 transition-all"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Done
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => clearCall(call.id)} 
                      className="rounded-xl h-10 w-10 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
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
