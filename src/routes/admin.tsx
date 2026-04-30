import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, UtensilsCrossed, Tag, Palette, Save, X, ImageIcon, ShoppingCart, Clock, Maximize, Hash, Package, Bell, Check, QrCode, Download, Printer, ExternalLink, Search, GripVertical, Settings, RotateCw, ReceiptText, Percent, Coins } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import type { MenuItem, Category } from '@/lib/menu-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Link } from '@tanstack/react-router';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Admin — Savor' },
      { name: 'description', content: 'Restaurant admin panel for full menu and branding control' },
    ],
  }),
  component: AdminPage,
});

type Tab = 'items' | 'categories' | 'branding' | 'qr' | 'analytics' | 'settings';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Analytics', icon: ShoppingCart },
    { id: 'items', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'qr', label: 'Table QR Codes', icon: QrCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />
      <div className="flex-1 overflow-auto w-full p-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your restaurant's menu, categories, and branding</p>

        <WaiterCallsPanel />

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'gradient-primary text-primary-foreground shadow-ambient-sm'
                    : 'bg-card text-muted-foreground hover:bg-surface-low'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'items' && <MenuItemsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'branding' && <BrandingTab />}
          {activeTab === 'qr' && <QrCodesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

function AnalyticsTab() {
  const { orders, brand } = useMenu();

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top items
    const itemMap = new Map<string, number>();
    orders.forEach(o => {
      o.items.forEach(item => {
        const name = item.menuItem.name;
        itemMap.set(name, (itemMap.get(name) || 0) + item.quantity);
      });
    });
    
    const topItemsData = Array.from(itemMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Revenue over time (last 7 days)
    const dailyMap = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 0);
    }

    orders.forEach(o => {
      const dateKey = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, dailyMap.get(dateKey)! + o.total);
      }
    });

    const revenueData = Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    // Order type distribution
    const dineInCount = orders.filter(o => o.orderType === 'dine-in').length;
    const takeawayCount = orders.filter(o => o.orderType === 'takeaway').length;
    
    const typeData = [
      { name: 'Dine In', value: dineInCount },
      { name: 'Takeaway', value: takeawayCount }
    ];

    return { totalRevenue, totalOrders, avgOrderValue, topItemsData, revenueData, typeData };
  }, [orders]);

  const COLORS = ['#426564', '#7BA09F', '#A3C1C0', '#D1E0DF', '#EDF2F2'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Total Revenue</p>
            <h3 className="mt-2 font-display text-3xl font-bold">{brand.currency}{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</p>
            <h3 className="mt-2 font-display text-3xl font-bold">{stats.totalOrders}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg. Order Value</p>
            <h3 className="mt-2 font-display text-3xl font-bold">{brand.currency}{stats.avgOrderValue.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardContent className="p-6">
            <h4 className="mb-6 font-display text-base font-bold">Revenue (Last 7 Days)</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${brand.currency}${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#426564" strokeWidth={3} dot={{ r: 4, fill: '#426564' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Items Chart */}
        <Card>
          <CardContent className="p-6">
            <h4 className="mb-6 font-display text-base font-bold">Top 5 Items (by Quantity)</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topItemsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted)/0.2)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11 }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#426564" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Types */}
        <Card>
          <CardContent className="p-6">
            <h4 className="mb-6 font-display text-base font-bold">Order Type Split</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table Summary */}
        <Card>
          <CardContent className="p-6 overflow-auto">
            <h4 className="mb-4 font-display text-base font-bold">Recent Orders Summary</h4>
            <div className="min-w-[300px]">
               <table className="w-full text-sm">
                 <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Order #</th>
                      <th className="pb-2 font-medium">Items</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 font-medium">#{o.orderNumber}</td>
                        <td className="py-2.5 text-muted-foreground">
                          {o.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ').slice(0, 30)}...
                        </td>
                        <td className="py-2.5 text-right font-bold">{brand.currency}{o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MenuItemsTab() {
  const { items, categories, addItem, updateItem, removeItem, brand } = useMenu();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openNew = () => {
    setEditing({
      id: isSupabaseConfigured() ? crypto.randomUUID() : `m-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id ?? '',
      available: true,
      preparationTime: 10,
    });
    setIsNew(true);
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    if (isNew) {
      addItem(editing);
      toast.success("Item added successfully");
    } else {
      updateItem(editing);
      toast.success("Item updated successfully");
    }
    setEditing(null);
    setIsNew(false);
  };

  const filteredItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const catA = categories.find(c => c.id === a.categoryId);
      const catB = categories.find(c => c.id === b.categoryId);
      if (catA && catB && catA.id !== catB.id) {
        return (catA.order || 0) - (catB.order || 0);
      }
      return a.name.localeCompare(b.name);
    });

    if (!searchQuery.trim()) return sorted;

    const query = searchQuery.toLowerCase();
    return sorted.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query) ||
      categories.find(c => c.id === item.categoryId)?.name.toLowerCase().includes(query)
    );
  }, [items, categories, searchQuery]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-card border border-border/40 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline-block">{filteredItems.length} of {items.length} items</span>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Add Item</Button>
      </div>

            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Menu Item' : 'Edit Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
              <input value={editing?.name ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={editing?.categoryId ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, categoryId: e.target.value } : null)} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
              <textarea value={editing?.description ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)} rows={2} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price ($)</label>
              <input type="number" step="0.01" value={editing?.price ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Prep Time (min)</label>
              <input type="number" value={editing?.preparationTime ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, preparationTime: parseInt(e.target.value) || 0 } : null)} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Image URL (optional)</label>
              <div className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input value={editing?.image ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, image: e.target.value || undefined } : null)} placeholder="https://example.com/photo.jpg" className="flex-1 rounded-xl bg-surface-low px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary" />
                {editing?.image && <img src={editing.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing?.available ?? true} onChange={e => setEditing(prev => prev ? { ...prev, available: e.target.checked } : null)} className="rounded" />
                Available
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-2 justify-end pt-4">
              <Button variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}>Cancel</Button>
              <Button onClick={save}>{isNew ? 'Add Item' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {filteredItems.map(item => {
          const cat = categories.find(c => c.id === item.categoryId);
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ambient-sm">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-low text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">{item.name}</span>
                  {!item.available && <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Unavailable</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{cat?.icon} {cat?.name} · {brand.currency}{item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setIsNew(false); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (itemToDelete) {
                  removeItem(itemToDelete);
                  setItemToDelete(null);
                  toast.success("Item deleted successfully");
                }
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const FOOD_ICONS = [
  '🥗', '🍽️', '🍝', '🍰', '🥤', '🥟', '🥩', '🍔', '🍕', '🍜', '🍣', '🍦', 
  '☕', '🍺', '🥪', '🌮', '🥙', '🍤', '🍛', '🍲', '🥯', '🥐', '🍳', '🥞', 
  '🍖', '🍗', '🥓', '🍟', '🍘', '🍱', '🍵', '🍶', '🍷', '🍸', '🍹', '🥘',
  '🥨', '🥖', '🧀', '🥡', '🍚', '🥣'
];

function CategoriesTab() {
  const { categories, addCategory, updateCategory, removeCategory, reorderCategories } = useMenu();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openNew = () => {
    setEditing({ id: isSupabaseConfigured() ? crypto.randomUUID() : `cat-${Date.now()}`, name: '', icon: '📋', order: categories.length + 1 });
    setIsNew(true);
    setShowIconPicker(false);
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    if (isNew) {
      addCategory(editing);
      toast.success("Category added successfully");
    } else {
      updateCategory(editing);
      toast.success("Category updated successfully");
    }
    setEditing(null);
    setIsNew(false);
    setShowIconPicker(false);
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex(c => c.id === active.id);
      const newIndex = sortedCategories.findIndex(c => c.id === over.id);
      
      const newSorted = arrayMove(sortedCategories, oldIndex, newIndex);
      // Update the 'order' property for each category
      const updated = newSorted.map((cat, index) => ({
        ...cat,
        order: index + 1
      }));
      
      reorderCategories(updated);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{categories.length} categories</span>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Add Category</Button>
      </div>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be removed. If there are items or orders referencing it, it will be moved to the archive instead of being permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (categoryToDelete) {
                  removeCategory(categoryToDelete);
                  toast.success("Category removed successfully");
                  setCategoryToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing && (
        <Card className="mb-6">
          <CardContent className="flex gap-4 p-6 items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Category name" className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative" ref={pickerRef}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</label>
              <button 
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex h-[42px] min-w-[50px] items-center justify-center rounded-xl bg-surface-low text-xl hover:bg-muted transition-colors border border-border/10"
              >
                {editing.icon}
              </button>
              
              {showIconPicker && (
                <div className="absolute top-full right-0 z-50 mt-2 p-2 rounded-2xl bg-card border border-border shadow-ambient-lg min-w-[280px]">
                  <p className="mb-2 px-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">Choose an icon</p>
                  <div className="grid grid-cols-6 gap-1 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {FOOD_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setEditing({ ...editing, icon });
                          setShowIconPicker(false);
                        }}
                        className={`flex aspect-square items-center justify-center rounded-lg text-lg hover:bg-primary/10 transition-colors ${editing.icon === icon ? 'bg-primary/20 ring-1 ring-primary' : ''}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button onClick={save}><Save className="h-4 w-4" />{isNew ? 'Add' : 'Save'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={sortedCategories.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedCategories.map(cat => (
              <SortableCategoryItem 
                key={cat.id} 
                cat={cat} 
                onEdit={() => { setEditing(cat); setIsNew(false); }}
                onRemove={() => setCategoryToDelete(cat.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableCategoryItemProps {
  cat: Category;
  onEdit: () => void;
  onRemove: () => void;
}

function SortableCategoryItem({ cat, onEdit, onRemove }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ambient-sm group ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <span className="text-2xl">{cat.icon}</span>
      <span className="flex-1 font-display text-sm font-semibold text-foreground">{cat.name}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/cache/invalidate', { method: 'POST' });
      if (response.ok) {
        toast.success("Cache cleared successfully. Refreshing page...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Failed to clear cache.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error clearing cache.");
    } finally {
      setIsClearing(false);
    }
  };

  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    // We use dynamic import for storage utility
    import('@/lib/storage').then(m => {
      m.clearStorage();
      toast.success("All local data cleared. Restarting...");
      setTimeout(() => window.location.reload(), 1500);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold text-foreground">System Maintenance</h3>
          <p className="mt-1 text-sm text-muted-foreground">Perform technical operations and manage application state.</p>
          
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-surface-low p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <RotateCw className={`h-5 w-5 text-primary ${isClearing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Server-Side Multi-User Cache</p>
                  <p className="text-xs text-muted-foreground">The menu is cached for 5 minutes on the server for performance. It is now automatically cleared whenever you save changes.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  <Check className="h-3 w-3" />
                  Auto-Sync Active
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleClearCache} 
                  disabled={isClearing}
                  className="rounded-xl border-primary/20 hover:bg-primary/10 h-10 px-6 shrink-0"
                >
                  {isClearing ? 'Clearing...' : 'Force Refresh'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-destructive/5 p-4 border border-destructive/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-destructive/10 p-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset to Factory Defaults</p>
                  <p className="text-xs text-muted-foreground">Wipe all local settings and menu data. This cannot be undone.</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowResetDialog(true)}
                className="rounded-xl h-10 px-6 shrink-0"
              >
                Reset Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will wipe all your local menu items, categories, and branding settings. 
              Only data already synced to the server will remain in the cloud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrandingTab() {
  const { brand, updateBrand } = useMenu();
  const [form, setForm] = useState(brand);

  return (
    <Card>
      <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Restaurant Name</label>
          <input value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tagline</label>
          <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Accent Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="h-10 w-10 rounded-xl border-0 bg-transparent cursor-pointer" />
            <input value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="flex-1 rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Currency Symbol</label>
          <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} placeholder="$" className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Total Tables</label>
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input type="number" min={1} max={200} value={form.totalTables ?? 20} onChange={e => setForm({ ...form, totalTables: parseInt(e.target.value) || 1 })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Menu Scale — {form.menuScale}%</label>
          <div className="flex items-center gap-4">
            <Maximize className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={70}
              max={130}
              step={5}
              value={form.menuScale}
              onChange={e => setForm({ ...form, menuScale: parseInt(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <button
              onClick={() => setForm({ ...form, menuScale: 100 })}
              className="rounded-lg bg-surface-low px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hero Image URL (optional)</label>
          <div className="flex items-center gap-3">
            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input value={form.heroImageUrl ?? ''} onChange={e => setForm({ ...form, heroImageUrl: e.target.value || undefined })} placeholder="https://example.com/hero.jpg" className="flex-1 rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {form.heroImageUrl && (
            <img src={form.heroImageUrl} alt="Hero preview" className="mt-3 h-32 w-full rounded-xl object-cover" />
          )}
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-2xl bg-surface-low p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Online Ordering</p>
                <p className="text-xs text-muted-foreground">Allow customers to place orders from the digital menu</p>
              </div>
            </div>
            <button
              onClick={() => setForm({ ...form, onlineOrderingEnabled: !form.onlineOrderingEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                form.onlineOrderingEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                form.onlineOrderingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="rounded-2xl bg-surface-low p-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Ordering Mode</p>
                <p className="text-xs text-muted-foreground">Control which order types are available</p>
              </div>
            </div>
            <div className="flex gap-2 rounded-xl bg-card p-1">
              {(['dine-in', 'takeaway', 'both'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setForm({ ...form, orderingMode: mode })}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    (form.orderingMode ?? 'both') === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {mode === 'dine-in' ? '🍽️ Dine In' : mode === 'takeaway' ? '📦 Takeaway' : '🔄 Both'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-2xl bg-surface-low p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Preparation Time</p>
                <p className="text-xs text-muted-foreground">Show estimated prep time on menu items</p>
              </div>
            </div>
            <button
              onClick={() => setForm({ ...form, showPrepTime: !form.showPrepTime })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                form.showPrepTime ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                form.showPrepTime ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-2xl bg-surface-low p-4">
            <div className="flex items-center gap-3">
              <Printer className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Auto Print Invoice</p>
                <p className="text-xs text-muted-foreground">Automatically print invoice when order is sent to kitchen</p>
              </div>
            </div>
            <button
              onClick={() => setForm({ ...form, autoPrintInvoice: !form.autoPrintInvoice })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                form.autoPrintInvoice ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                form.autoPrintInvoice ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        {form.autoPrintInvoice && (
          <div className="sm:col-span-2">
            <div className="rounded-2xl bg-surface-low p-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Invoice Size</label>
              <div className="flex gap-2 rounded-xl bg-card p-1">
                {(['58mm', '80mm'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setForm({ ...form, invoiceSize: size })}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      form.invoiceSize === size ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="sm:col-span-2">
          <div className="rounded-2xl bg-surface-low p-4">
            <div className="mb-3 flex items-center gap-3">
              <Maximize className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Board Display Controls</p>
                <p className="text-xs text-muted-foreground">Manage signage speed, layout, and what guests see on /board</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Board Rotation Speed — {form.boardCycleSeconds}s
                </label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={form.boardCycleSeconds}
                  onChange={e => setForm({ ...form, boardCycleSeconds: parseInt(e.target.value) || 15 })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Board Columns</label>
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="number"
                    min={2}
                    max={4}
                    value={form.boardColumns}
                    onChange={e => setForm({ ...form, boardColumns: Math.min(4, Math.max(2, parseInt(e.target.value) || 3)) })}
                    className="w-full rounded-xl bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Board Currency Symbol</label>
                <input
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full rounded-xl bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Board Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.boardBackgroundColor}
                    onChange={e => setForm({ ...form, boardBackgroundColor: e.target.value })}
                    className="h-10 w-10 rounded-xl border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    value={form.boardBackgroundColor}
                    onChange={e => setForm({ ...form, boardBackgroundColor: e.target.value })}
                    className="w-full rounded-xl bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <label className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm">
                <span>Show item photos</span>
                <input
                  type="checkbox"
                  checked={form.boardShowPhotos}
                  onChange={e => setForm({ ...form, boardShowPhotos: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm">
                <span>Show price</span>
                <input
                  type="checkbox"
                  checked={form.boardShowPrice}
                  onChange={e => setForm({ ...form, boardShowPrice: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm">
                <span>Show description</span>
                <input
                  type="checkbox"
                  checked={form.boardShowDescription}
                  onChange={e => setForm({ ...form, boardShowDescription: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm">
                <span>Show prep time on board</span>
                <input
                  type="checkbox"
                  checked={form.boardShowPrepTime}
                  onChange={e => setForm({ ...form, boardShowPrepTime: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="rounded-2xl border border-border/40 bg-surface-low p-6">
            <div className="mb-6 flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground uppercase tracking-wider">Tax, Service & Fees</p>
                <p className="text-xs text-muted-foreground">Manage taxes, service charges, and additional order fees</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tax Section */}
              <div className="rounded-xl bg-card p-4 border border-border/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Taxes</span>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, taxEnabled: !form.taxEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      form.taxEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      form.taxEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {form.taxEnabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex rounded-lg bg-surface-low p-1">
                      {(['percentage', 'fixed'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, taxType: type })}
                          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            form.taxType === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                          }`}
                        >
                          {type === 'percentage' ? '%' : 'Fixed'}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={form.taxRate}
                        onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg bg-surface-low px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Rate"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase">
                        {form.taxType === 'percentage' ? '%' : form.currency}
                      </span>
                    </div>
                  </div>
                )}
                {form.taxEnabled && (
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.taxApplyDineIn} 
                        onChange={e => setForm({ ...form, taxApplyDineIn: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Dine In</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.taxApplyTakeaway} 
                        onChange={e => setForm({ ...form, taxApplyTakeaway: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Takeaway</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Service Charge Section */}
              <div className="rounded-xl bg-card p-4 border border-border/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Service Charge</span>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, serviceChargeEnabled: !form.serviceChargeEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      form.serviceChargeEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      form.serviceChargeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {form.serviceChargeEnabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex rounded-lg bg-surface-low p-1">
                      {(['percentage', 'fixed'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, serviceChargeType: type })}
                          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            form.serviceChargeType === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                          }`}
                        >
                          {type === 'percentage' ? '%' : 'Fixed'}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={form.serviceChargeRate}
                        onChange={e => setForm({ ...form, serviceChargeRate: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg bg-surface-low px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Rate"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase">
                        {form.serviceChargeType === 'percentage' ? '%' : form.currency}
                      </span>
                    </div>
                  </div>
                )}
                {form.serviceChargeEnabled && (
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.serviceChargeApplyDineIn} 
                        onChange={e => setForm({ ...form, serviceChargeApplyDineIn: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Dine In</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.serviceChargeApplyTakeaway} 
                        onChange={e => setForm({ ...form, serviceChargeApplyTakeaway: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Takeaway</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Additional Fees Section */}
              <div className="rounded-xl bg-card p-4 border border-border/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Additional Fee</span>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, additionalFeeEnabled: !form.additionalFeeEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      form.additionalFeeEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      form.additionalFeeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {form.additionalFeeEnabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] uppercase font-bold text-muted-foreground">Fee Name</label>
                      <input
                        value={form.additionalFeeName}
                        onChange={e => setForm({ ...form, additionalFeeName: e.target.value })}
                        className="w-full rounded-lg bg-surface-low px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Eco Fee"
                      />
                    </div>
                    <div className="flex rounded-lg bg-surface-low p-1">
                      {(['percentage', 'fixed'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, additionalFeeType: type })}
                          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            form.additionalFeeType === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                          }`}
                        >
                          {type === 'percentage' ? '%' : 'Fixed'}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={form.additionalFeeAmount}
                        onChange={e => setForm({ ...form, additionalFeeAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg bg-surface-low px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Amount"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase">
                        {form.additionalFeeType === 'percentage' ? '%' : form.currency}
                      </span>
                    </div>
                  </div>
                )}
                {form.additionalFeeEnabled && (
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.additionalFeeApplyDineIn} 
                        onChange={e => setForm({ ...form, additionalFeeApplyDineIn: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Dine In</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.additionalFeeApplyTakeaway} 
                        onChange={e => setForm({ ...form, additionalFeeApplyTakeaway: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Takeaway</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-end sm:col-span-2">
          <Button onClick={() => {
            updateBrand(form);
            toast.success("Branding settings saved successfully");
          }} className="w-full">
            <Save className="h-4 w-4" />
            Save Branding
          </Button>
          <Button asChild variant="outline" className="ml-4 w-full">
            <Link to="/board" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Board
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WaiterCallsPanel() {
  const { waiterCalls, acknowledgeCall, clearCall } = useMenu();
  const active = waiterCalls.filter(c => !c.acknowledged);
  const prevCount = useRef(active.length);
  const [, force] = useState(0);

  // Re-render every 30s so timestamps stay fresh
  useEffect(() => {
    const id = setInterval(() => force(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Sound + toast when a new call arrives in this same tab
  useEffect(() => {
    if (active.length > prevCount.current) {
      try {
        const Ctx = window.AudioContext ?? window.webkitAudioContext;
        if (Ctx) {
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
        }
      } catch {
        // ignore audio failures
      }
      const newest = active[active.length - 1];
      if (newest) toast.info(`🔔 Table ${newest.tableNumber} needs a waiter`);
    }
    prevCount.current = active.length;
  }, [active]);

  if (active.length === 0) return null;

  const formatAge = (d: Date) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <div className="mt-6 rounded-2xl bg-warning/10 p-5 shadow-ambient-sm">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-5 w-5 text-warning animate-pulse" />
        <h2 className="font-display text-base font-bold text-foreground">
          {active.length} {active.length === 1 ? 'Table needs' : 'Tables need'} attention
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {active.map(call => (
          <div key={call.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-ambient-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-display font-bold">
              {call.tableNumber}
            </div>
            <div className="flex-1 min-w-0">
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

function QrCodesTab() {
  const { brand } = useMenu();
  const totalTables = brand.totalTables ?? 20;
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const tables = Array.from({ length: totalTables }, (_, i) => i + 1);

  const downloadQR = (table: number) => {
    const svg = document.getElementById(`qr-table-${table}`) as unknown as SVGSVGElement | null;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.restaurantName.replace(/\s+/g, '-').toLowerCase()}-table-${table}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`QR Code for Table ${table} downloaded`);
  };

  const printAll = () => window.print();

  if (!origin) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div>
          <p className="text-sm text-muted-foreground">
            Print and place these QR codes on each table. Customers scan to open the menu with their table number pre-filled.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">URL pattern: <code className="rounded bg-surface-low px-1.5 py-0.5">{origin}/t1</code>, <code className="rounded bg-surface-low px-1.5 py-0.5">{origin}/t2</code> …</p>
        </div>
        <Button onClick={printAll}><Printer className="h-4 w-4" />Print All</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-6">
        {tables.map(t => {
          const url = `${origin}/t${t}`;
          return (
            <div key={t} className="rounded-2xl bg-card p-5 shadow-ambient-sm flex flex-col items-center gap-3 print:break-inside-avoid print:shadow-none">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{brand.restaurantName}</p>
                <p className="font-display text-xl font-bold text-foreground">Table {t}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG id={`qr-table-${t}`} value={url} size={140} level="M" />
              </div>
              <p className="text-[10px] text-muted-foreground break-all text-center">{url}</p>
              <Button variant="ghost" size="sm" onClick={() => downloadQR(t)} className="print:hidden">
                <Download className="h-3.5 w-3.5" />
                Download SVG
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
