import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type MenuItem, type Category, type Order, type BrandSettings, type WaiterCall,
  defaultMenuItems, defaultCategories, sampleOrders, defaultBrand,
} from '@/lib/menu-data';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { toast } from 'sonner';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchBootstrapData,
  fetchBrandSettings,
  fetchCategories,
  fetchMenuItems,
  fetchOrders,
  fetchWaiterCalls,
  fetchAdditionalData,
  createWaiterCall,
  updateWaiterCall,
  deleteWaiterCall,
} from '@/lib/supabase-store';
import { syncEngine } from '@/lib/sync-engine';
import { useOnlineStatus } from './use-online-status';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface MenuContextType {
  items: MenuItem[];
  categories: Category[];
  orders: Order[];
  brand: BrandSettings;
  waiterCalls: WaiterCall[];
  addItem: (item: MenuItem) => void;
  updateItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (newCategories: Category[]) => void;
  updateOrder: (order: Order) => void;
  addOrder: (order: Omit<Order, 'orderNumber'>) => void;
  updateBrand: (brand: BrandSettings) => void;
  callWaiter: (tableNumber: number) => { ok: boolean; cooldownSeconds: number };
  acknowledgeCall: (id: string) => void;
  clearCall: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  posViewMode: 'pos' | 'history';
  setPosViewMode: (mode: 'pos' | 'history') => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  pendingChangesCount: number;
  isLoading: boolean;
  isFirstEverLoad: boolean;
}

const MenuContext = createContext<MenuContextType | null>(null);

// Play a soft "ding" using Web Audio (no asset needed)
function playDing() {
  try {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
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
    return;
  }
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isOnline } = useOnlineStatus();

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    initialData: () => loadFromStorage('categories', defaultCategories),
  });
  const categories = categoriesQuery.data ?? defaultCategories;

  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: fetchMenuItems,
    initialData: () => loadFromStorage('items', defaultMenuItems),
  });
  const items = itemsQuery.data ?? defaultMenuItems;

  const brandQuery = useQuery({
    queryKey: ['brand'],
    queryFn: fetchBrandSettings,
    initialData: () => loadFromStorage('brand', defaultBrand),
  });
  const brand = brandQuery.data ?? defaultBrand;

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(200),
    initialData: () => loadFromStorage('orders', sampleOrders),
    refetchInterval: 30000,
  });
  const serverOrders = ordersQuery.data ?? sampleOrders;

  const waiterCallsQuery = useQuery({
    queryKey: ['waiterCalls'],
    queryFn: fetchWaiterCalls,
    initialData: () => loadFromStorage('waiterCalls', []),
    refetchInterval: 20000,
  });
  const waiterCalls = waiterCallsQuery.data ?? [];

  // isLoading should only be true if we don't have any cached data AND we are still fetching for the first time.
  // We check if we have results in the cache first.
  const hasCachedData = useRef(!!localStorage.getItem('savor_bootstrapped')).current;
  
  const isFirstEverLoad = !hasCachedData;
  
  const isLoading = isFirstEverLoad && (
    categoriesQuery.isLoading || 
    itemsQuery.isLoading || 
    brandQuery.isLoading
  );

  useEffect(() => {
    if (!categoriesQuery.isLoading && !itemsQuery.isLoading && !brandQuery.isLoading) {
      localStorage.setItem('savor_bootstrapped', 'true');
    }
  }, [categoriesQuery.isLoading, itemsQuery.isLoading, brandQuery.isLoading]);

  const [searchQuery, setSearchQuery] = useState('');
  const [posViewMode, setPosViewMode] = useState<'pos' | 'history'>('pos');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [syncQueue, setSyncQueue] = useState<any[]>([]); 
  const [recentlyCompleted, setRecentlyCompleted] = useState<Record<string, { status: string, timestamp: number }>>({});
  
  const lastSeenIds = useRef<Set<string>>(new Set(waiterCalls.map((c: any) => c.id)));
  const lastMutationRef = useRef<number>(0);
  const syncQueueRef = useRef<any[]>([]);
  const isOnlineRef = useRef(isOnline);
  
  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);

  const markMutation = useCallback(() => {
    lastMutationRef.current = Date.now();
  }, []);

  // Persist query results back to localStorage for offline boot
  useEffect(() => { if (categories) saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { if (items) saveToStorage('items', items); }, [items]);
  useEffect(() => { if (brand) saveToStorage('brand', brand); }, [brand]);
  useEffect(() => { if (serverOrders) saveToStorage('orders', serverOrders); }, [serverOrders]);
  useEffect(() => { if (waiterCalls) saveToStorage('waiterCalls', waiterCalls); }, [waiterCalls]);

  // Helper to merge server data with pending local mutations
  const mergeWithPending = useCallback((serverOrders: Order[], currentQueue: any[], completed: Record<string, { status: string, timestamp: number }>) => {
    const now = Date.now();
    
    // 1. Start with server orders, applying pending status updates
    const merged = serverOrders.map(order => {
      // Check current sync queue for status updates
      const pendingUpdates = currentQueue
        .filter(op => op.type === 'UPDATE_ORDER_STATUS' && op.payload.id === order.id)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const recent = completed[order.id];

      // CRITICAL: If server returns an order with 0 items, but we recently created it locally (or heard about it via INSERT),
      // we prefer the data that has items to prevent flickering. 
      if (order.items.length === 0 && recent && (recent as any).originalData?.items?.length > 0) {
        return { ...(recent as any).originalData, status: pendingUpdates.length > 0 ? pendingUpdates[0].payload.status : order.status } as Order;
      }

      if (pendingUpdates.length > 0) {
        return { ...order, status: pendingUpdates[0].payload.status };
      }

      // Check recently completed updates
      if (recent && now - recent.timestamp < 5000) {
        return { ...order, status: recent.status };
      }

      return order;
    });

    // 2. Add pending NEW orders from the queue
    const pendingNewOrders = currentQueue
      .filter(op => op.type === 'CREATE_ORDER')
      .map(op => {
        return {
          ...op.payload,
          orderNumber: op.payload.orderNumber || 0,
          createdAt: new Date(op.payload.createdAt || now),
          updatedAt: new Date(op.payload.updatedAt || op.payload.createdAt || now)
        } as Order;
      });

    // 3. Add RECENTLY created orders that might not be in server list yet
    const recentlyCreatedOrders = Object.values(completed)
      .filter((c: any) => c.isNew && now - c.timestamp < 10000)
      .map((c: any) => c.originalData as Order);

    // Combine everything, avoiding duplicates
    const finalOrders = [...merged];
    
    // Add pending from queue (highest priority for local interactivity)
    pendingNewOrders.forEach(pending => {
      if (!finalOrders.some(o => o.id === pending.id)) {
        finalOrders.unshift(pending);
      }
    });

    // Add recently completed results (migration bridge)
    recentlyCreatedOrders.forEach(recent => {
      if (!finalOrders.some(o => o.id === recent.id)) {
        finalOrders.unshift(recent);
      }
    });

    return finalOrders;
  }, []);

  const mergedOrders = useMemo(() => mergeWithPending(serverOrders, syncQueue, recentlyCompleted), [serverOrders, syncQueue, recentlyCompleted, mergeWithPending]);

  // Listen to sync engine status
  useEffect(() => {
    syncEngine.setStatusCallback((status, count, queue) => {
      // Detect completed operations
      const prevQueue = syncQueueRef.current;
      const completedIds = prevQueue
        .filter(prevOp => !queue.some(currOp => currOp.id === prevOp.id))
        .filter(op => op.type === 'UPDATE_ORDER_STATUS');

      if (completedIds.length > 0) {
        setRecentlyCompleted(prev => {
          const next = { ...prev };
          completedIds.forEach(op => {
            next[op.payload.id] = { status: op.payload.status, timestamp: Date.now() };
          });
          return next;
        });
      }

      setSyncStatus(status === 'synced' ? (isOnlineRef.current ? 'synced' : 'offline') : status);
      setPendingChangesCount(count);
      setSyncQueue(queue);
      syncQueueRef.current = queue;
    });

    syncEngine.setOperationCompleteCallback((type, payload, result) => {
      if (type === 'CREATE_ORDER' && result && result.id) {
        // Migration: The localId (payload.id) is now realId (result.id)
        const localId = payload.id;
        const realId = result.id;

        // Keep track of this as "recently created" so it doesn't vanish before next fetch
        setRecentlyCompleted(prev => ({
          ...prev,
          [realId]: { status: result.status, timestamp: Date.now(), isNew: true, originalData: result }
        }));

        // Update localStorage for takeaway tracking
        const saved = localStorage.getItem('my_takeaway_orders');
        if (saved) {
          try {
            const ids: string[] = JSON.parse(saved);
            const idx = ids.indexOf(localId);
            if (idx !== -1) {
              ids[idx] = realId;
              localStorage.setItem('my_takeaway_orders', JSON.stringify(ids));
              // Dispatch storage event so current tab's state updates if it's listening
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'my_takeaway_orders',
                newValue: JSON.stringify(ids)
              }));
            }
          } catch (e) {
            console.error('Migration failed:', e);
          }
        }
      }
    });

    return () => {
      syncEngine.setStatusCallback(() => {});
      syncEngine.setOperationCompleteCallback(() => {});
    };
  }, []); // Run once

  // Periodically clean up recentlyCompleted
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setRecentlyCompleted(prev => {
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, data]) => {
          if (now - data.timestamp > 7000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncEngine.processQueue();
    }
  }, [isOnline]);

  // Supabase Realtime: keep local state in sync across tabs/devices
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let cancelled = false;

    const channel = supabase
      .channel('savor-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        if (Date.now() - lastMutationRef.current < 2000) return;
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        if (Date.now() - lastMutationRef.current < 2000) return;
        queryClient.invalidateQueries({ queryKey: ['items'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_settings' }, () => {
        if (Date.now() - lastMutationRef.current < 2000) return;
        queryClient.invalidateQueries({ queryKey: ['brand'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT' && (payload.new as any).status === 'awaiting_approval') {
          playDing();
        }
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, (payload) => {
        if (payload.eventType === 'INSERT' && !(payload.new as any).acknowledged) {
          playDing();
        }
        queryClient.invalidateQueries({ queryKey: ['waiterCalls'] });
      })
      .subscribe();

    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      queryClient.invalidateQueries();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Cross-tab sync via storage event — admin tab hears calls from menu tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.endsWith('waiterCalls') && e.newValue) {
        try {
          const parsed: unknown = JSON.parse(e.newValue);
          const next: WaiterCall[] = Array.isArray(parsed)
            ? parsed.map((c): WaiterCall => {
                const obj = (c ?? {}) as Record<string, unknown>;
                return {
                  id: String(obj.id ?? ''),
                  tableNumber: Number(obj.tableNumber ?? 0),
                  createdAt: new Date(String(obj.createdAt ?? Date.now())),
                  acknowledged: Boolean(obj.acknowledged),
                };
              })
            : [];
          const newOnes = next.filter(c => !c.acknowledged && !lastSeenIds.current.has(c.id));
          if (newOnes.length > 0) {
            playDing();
          }
          lastSeenIds.current = new Set(next.map(c => c.id));
          queryClient.setQueryData(['waiterCalls'], next);
        } catch {
          return;
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [queryClient]);

  const addItem = useCallback((item: MenuItem) => {
    markMutation();
    queryClient.setQueryData(['items'], (prev: MenuItem[] | undefined) => [...(prev || []), item]);
    syncEngine.enqueue('UPSERT_ITEM', item);
  }, [markMutation, queryClient]);

  const updateItem = useCallback((item: MenuItem) => {
    markMutation();
    queryClient.setQueryData(['items'], (prev: MenuItem[] | undefined) => 
      prev?.map(i => i.id === item.id ? item : i) || [item]
    );
    syncEngine.enqueue('UPSERT_ITEM', item);
  }, [markMutation, queryClient]);

  const removeItem = useCallback((id: string) => {
    markMutation();
    queryClient.setQueryData(['items'], (prev: MenuItem[] | undefined) => 
      prev?.filter(i => i.id !== id) || []
    );
    syncEngine.enqueue('DELETE_ITEM', { id });
  }, [markMutation, queryClient]);

  const addCategory = useCallback((cat: Category) => {
    markMutation();
    queryClient.setQueryData(['categories'], (prev: Category[] | undefined) => [...(prev || []), cat]);
    syncEngine.enqueue('UPSERT_CATEGORY', cat);
  }, [markMutation, queryClient]);

  const updateCategory = useCallback((cat: Category) => {
    markMutation();
    queryClient.setQueryData(['categories'], (prev: Category[] | undefined) => 
      prev?.map(c => c.id === cat.id ? cat : c) || [cat]
    );
    syncEngine.enqueue('UPSERT_CATEGORY', cat);
  }, [markMutation, queryClient]);

  const removeCategory = useCallback((id: string) => {
    markMutation();
    queryClient.setQueryData(['categories'], (prev: Category[] | undefined) => 
      prev?.filter(c => c.id !== id) || []
    );
    syncEngine.enqueue('DELETE_CATEGORY', { id });
  }, [markMutation, queryClient]);

  const reorderCategories = useCallback((newCats: Category[]) => {
    markMutation();
    queryClient.setQueryData(['categories'], newCats);
    syncEngine.enqueue('BULK_UPSERT_CATEGORIES', newCats);
  }, [markMutation, queryClient]);

  const updateOrder = useCallback((order: Order) => {
    queryClient.setQueryData(['orders'], (prev: Order[] | undefined) => 
      prev?.map((o) => (o.id === order.id ? order : o)) || [order]
    );
    syncEngine.enqueue('UPDATE_ORDER_STATUS', { id: order.id, status: order.status });
  }, [queryClient]);

  const addOrder = useCallback((order: Omit<Order, 'orderNumber'>) => {
    const localId = `ord-${Date.now()}`;
    let optimisticOrderNumber = 1;
    
    // We update the brand query data optimistically for the order number
    queryClient.setQueryData(['brand'], (prev: BrandSettings | undefined) => {
      if (!prev) return prev;
      optimisticOrderNumber = prev.nextOrderNumber ?? 1;
      return { ...prev, nextOrderNumber: optimisticOrderNumber + 1 };
    });

    const newOrder = { ...order, id: localId, orderNumber: optimisticOrderNumber } as Order;
    
    queryClient.setQueryData(['orders'], (prev: Order[] | undefined) => [newOrder, ...(prev || [])]);
    syncEngine.enqueue('CREATE_ORDER', order);
  }, [queryClient]);

  const updateBrand = useCallback((b: BrandSettings) => {
    markMutation();
    queryClient.setQueryData(['brand'], b);
    syncEngine.enqueue('UPSERT_BRAND', b);
  }, [markMutation, queryClient]);

  const callWaiter = useCallback((tableNumber: number) => {
    const COOLDOWN_MS = 60_000;
    const now = Date.now();
    let result = { ok: true, cooldownSeconds: 0 };
    
    // Check local cooldown first
    const recent = waiterCalls.find((c: any) =>
      c.tableNumber === tableNumber &&
      now - new Date(c.createdAt).getTime() < COOLDOWN_MS
    );
    
    if (recent) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - new Date(recent.createdAt).getTime())) / 1000);
      result = { ok: false, cooldownSeconds: remaining };
      return result;
    }
    
    // Create call in Supabase
    createWaiterCall(tableNumber).catch(err => {
      console.error('Failed to call waiter:', err);
      toast.error('Failed to notify staff. Please try again.');
    });
    
    return result;
  }, [waiterCalls]);

  const acknowledgeCall = useCallback((id: string) => {
    queryClient.setQueryData(['waiterCalls'], (prev: WaiterCall[] | undefined) => 
      prev?.map(c => c.id === id ? { ...c, acknowledged: true } : c)
    );
    updateWaiterCall(id, { acknowledged: true }).catch(err => {
      console.error('Failed to acknowledge call:', err);
    });
  }, [queryClient]);

  const clearCall = useCallback((id: string) => {
    queryClient.setQueryData(['waiterCalls'], (prev: WaiterCall[] | undefined) => 
      prev?.filter(c => c.id !== id)
    );
    deleteWaiterCall(id).catch(err => {
      console.error('Failed to delete call:', err);
    });
  }, [queryClient]);

  return (
    <MenuContext.Provider value={{
      items, categories, orders: mergedOrders, brand, waiterCalls,
      addItem, updateItem, removeItem,
      addCategory, updateCategory, removeCategory, reorderCategories,
      updateOrder, addOrder, updateBrand,
      callWaiter, acknowledgeCall, clearCall,
      searchQuery, setSearchQuery,
      posViewMode, setPosViewMode,
      syncStatus, pendingChangesCount,
      isLoading,
      isFirstEverLoad,
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
