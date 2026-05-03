import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Clock3 } from 'lucide-react';
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
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0">
          {/* Gradient top strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
          <div className="p-5 border-b bg-surface-low/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                  {active.length > 0 ? (
                    <>
                      <span className="absolute inset-0 rounded-2xl bg-blue-500 opacity-20 animate-ping" />
                      <span className="animate-bell-ring">
                        <Bell className="h-6 w-6 text-blue-500" />
                      </span>
                    </>
                  ) : (
                    <Bell className="h-6 w-6 text-blue-500/50" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-lg font-black tracking-tight">
                    Waiter Requests
                  </DialogTitle>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {active.length === 0 ? 'All clear' : `${active.length} table${active.length > 1 ? 's' : ''} waiting`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-low hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/10">
          <AnimatePresence mode="popLayout">
            {active.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-5">
                  <Check className="h-9 w-9 text-green-500" />
                </div>
                <h3 className="text-base font-black text-foreground">All Tables Set</h3>
                <p className="text-sm text-muted-foreground mt-2">No active service requests.</p>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-8 rounded-xl font-bold">
                  Close Panel
                </Button>
              </motion.div>
            ) : (
              active.map((call) => (
                <motion.div 
                  key={call.id}
                  layout
                  initial={{ opacity: 0, x: -10, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-ambient-sm border border-blue-200/40 dark:border-blue-900/30 hover:border-blue-400/40 transition-colors"
                >
                  {/* Table number badge */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display font-black bg-blue-500/10 text-blue-600 text-2xl">
                    {call.tableNumber}
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-foreground">Table {call.tableNumber}</h3>
                    <p className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mt-0.5">
                      <Clock3 className="h-3 w-3" />
                      {formatAge(call.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => acknowledgeCall(call.id)} 
                      className="rounded-xl h-10 px-4 font-bold shadow-ambient-sm active:scale-95 transition-all gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Done
                    </Button>
                    <button
                      onClick={() => clearCall(call.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Dismiss call"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
