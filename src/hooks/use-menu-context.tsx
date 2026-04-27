import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
  upsertMenuItem,
  deleteMenuItem,
  upsertCategory,
  deleteCategory,
  upsertBrandSettings,
  createOrder,
  updateOrderStatus,
} from '@/lib/supabase-store';

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
  updateOrder: (order: Order) => void;
  addOrder: (order: Omit<Order, 'orderNumber'>) => void;
  updateBrand: (brand: BrandSettings) => void;
  callWaiter: (tableNumber: number) => { ok: boolean; cooldownSeconds: number };
  acknowledgeCall: (id: string) => void;
  clearCall: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  const [items, setItems] = useState<MenuItem[]>(() => loadFromStorage('items', defaultMenuItems));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', defaultCategories));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', sampleOrders));
  const [brand, setBrand] = useState<BrandSettings>(() => loadFromStorage('brand', defaultBrand));
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(() => loadFromStorage('waiterCalls', [] as WaiterCall[]));
  const [searchQuery, setSearchQuery] = useState('');
  const lastSeenIds = useRef<Set<string>>(new Set(waiterCalls.map(c => c.id)));

  // Initial load from Supabase (fallback to localStorage/defaults)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    fetchBootstrapData()
      .then((data) => {
        if (cancelled) return;
        setCategories(data.categories);
        setItems(data.items);
        setBrand(data.brand);
        setOrders(data.orders);
      })
      .catch(() => {
        // If Supabase isn't ready (schema not applied / RLS / network), keep local fallback
        return;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase Realtime: keep local state in sync across tabs/devices
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let cancelled = false;
    const timers = new Map<string, number>();

    const refetchAll = async () => {
      const data = await fetchBootstrapData();
      if (cancelled) return;
      setCategories(data.categories);
      setItems(data.items);
      setBrand(data.brand);
      setOrders(data.orders);
    };

    const schedule = (key: string, fn: () => Promise<void>) => {
      const existing = timers.get(key);
      if (existing) window.clearTimeout(existing);
      const id = window.setTimeout(() => {
        timers.delete(key);
        fn().catch(() => undefined);
      }, 250);
      timers.set(key, id);
    };

    const channel = supabase
      .channel('savor-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        schedule('categories', async () => {
          const next = await fetchCategories();
          if (!cancelled) setCategories(next);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        schedule('menu_items', async () => {
          const next = await fetchMenuItems();
          if (!cancelled) setItems(next);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_settings' }, () => {
        schedule('brand_settings', async () => {
          const next = await fetchBrandSettings();
          if (!cancelled) setBrand(next);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        schedule('orders', async () => {
          const next = await fetchOrders();
          if (!cancelled) setOrders(next);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        schedule('order_items', async () => {
          const next = await fetchOrders();
          if (!cancelled) setOrders(next);
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // This helps confirm realtime is actually active on clients.
          // (We keep it silent to avoid TV / kiosk noise.)
        }
      });

    // Fallback: when returning to tab / kiosk wakes up, re-hydrate from Supabase
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      refetchAll().catch(() => undefined);
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    // Fallback polling (covers cases where Realtime isn't enabled/publishing)
    const poll = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      refetchAll().catch(() => undefined);
    }, 30_000);

    return () => {
      cancelled = true;
      for (const id of timers.values()) window.clearTimeout(id);
      window.clearInterval(poll);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist to localStorage on every change
  useEffect(() => { saveToStorage('items', items); }, [items]);
  useEffect(() => { saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { saveToStorage('orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('brand', brand); }, [brand]);
  useEffect(() => { saveToStorage('waiterCalls', waiterCalls); }, [waiterCalls]);

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
            newOnes.forEach(c => toast.info(`🔔 Table ${c.tableNumber} needs a waiter`));
          }
          lastSeenIds.current = new Set(next.map(c => c.id));
          setWaiterCalls(next);
        } catch {
          return;
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setItems(prev => [...prev, item]);
    upsertMenuItem(item).catch((e: unknown) => {
      toast.error('Supabase: failed to save menu item', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const updateItem = useCallback((item: MenuItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    upsertMenuItem(item).catch((e: unknown) => {
      toast.error('Supabase: failed to update menu item', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    deleteMenuItem(id).catch((e: unknown) => {
      toast.error('Supabase: failed to delete menu item', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const addCategory = useCallback((cat: Category) => {
    setCategories(prev => [...prev, cat]);
    upsertCategory(cat).catch((e: unknown) => {
      toast.error('Supabase: failed to save category', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const updateCategory = useCallback((cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    upsertCategory(cat).catch((e: unknown) => {
      toast.error('Supabase: failed to update category', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const removeCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    deleteCategory(id).catch((e: unknown) => {
      toast.error('Supabase: failed to delete category', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);
  const updateOrder = useCallback((order: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    updateOrderStatus(order.id, order.status).catch((e: unknown) => {
      toast.error('Supabase: failed to update order status', {
        description: e instanceof Error ? e.message : String(e),
      });
      // Re-sync from Supabase to avoid stale optimistic state after write failure.
      fetchOrders()
        .then((fresh) => setOrders(fresh))
        .catch(() => undefined);
    });
  }, []);
  const addOrder = useCallback((order: Omit<Order, 'orderNumber'>) => {
    // Optimistic local update (orderNumber will be fixed by Supabase order_number)
    const localId = `ord-${Date.now()}`;
    let optimisticOrderNumber = 1;
    setBrand((prev) => {
      optimisticOrderNumber = prev.nextOrderNumber ?? 1;
      return { ...prev, nextOrderNumber: optimisticOrderNumber + 1 };
    });
    setOrders((prevOrders) => [
      { ...order, id: localId, orderNumber: optimisticOrderNumber } as Order,
      ...prevOrders,
    ]);
    createOrder(order)
      .then((saved) => {
        setOrders((prev) => prev.map((o) => (o.id === localId ? saved : o)));
      })
      .catch((e: unknown) => {
        toast.error('Supabase: failed to create order', { description: e instanceof Error ? e.message : String(e) });
      });
  }, []);
  const updateBrand = useCallback((b: BrandSettings) => {
    setBrand(b);
    upsertBrandSettings(b).catch((e: unknown) => {
      toast.error('Supabase: failed to update branding', { description: e instanceof Error ? e.message : String(e) });
    });
  }, []);

  const callWaiter = useCallback((tableNumber: number) => {
    const COOLDOWN_MS = 60_000;
    const now = Date.now();
    let result = { ok: true, cooldownSeconds: 0 };
    setWaiterCalls(prev => {
      const recent = prev.find(c =>
        c.tableNumber === tableNumber &&
        now - new Date(c.createdAt).getTime() < COOLDOWN_MS
      );
      if (recent) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - new Date(recent.createdAt).getTime())) / 1000);
        result = { ok: false, cooldownSeconds: remaining };
        return prev;
      }
      const call: WaiterCall = {
        id: `call-${now}`,
        tableNumber,
        createdAt: new Date(),
        acknowledged: false,
      };
      lastSeenIds.current.add(call.id);
      return [...prev, call];
    });
    return result;
  }, []);

  const acknowledgeCall = useCallback((id: string) => {
    setWaiterCalls(prev => prev.map(c => c.id === id ? { ...c, acknowledged: true } : c));
  }, []);

  const clearCall = useCallback((id: string) => {
    setWaiterCalls(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <MenuContext.Provider value={{
      items, categories, orders, brand, waiterCalls,
      addItem, updateItem, removeItem,
      addCategory, updateCategory, removeCategory,
      updateOrder, addOrder, updateBrand,
      callWaiter, acknowledgeCall, clearCall,
      searchQuery, setSearchQuery,
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
