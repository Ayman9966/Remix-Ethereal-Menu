import { createFileRoute } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppHeader';
import { useMenu } from '@/hooks/use-menu-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, UtensilsCrossed, Tag, Palette, Save, X, ImageIcon, ShoppingCart, Clock, Maximize, Hash, Package, Bell, Check, QrCode, Download, Printer, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { MenuItem, Category } from '@/lib/menu-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Link } from '@tanstack/react-router';

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

type Tab = 'items' | 'categories' | 'branding' | 'qr';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('items');

  const tabs: { id: Tab; label: string; icon: typeof UtensilsCrossed }[] = [
    { id: 'items', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'qr', label: 'Table QR Codes', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-5xl p-6">
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
          {activeTab === 'items' && <MenuItemsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'branding' && <BrandingTab />}
          {activeTab === 'qr' && <QrCodesTab />}
        </div>
      </div>
    </div>
  );
}

function MenuItemsTab() {
  const { items, categories, addItem, updateItem, removeItem, brand } = useMenu();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);

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
    if (isNew) addItem(editing);
    else updateItem(editing);
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{items.length} items</span>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Add Item</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={editing.categoryId} onChange={e => setEditing({ ...editing, categoryId: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
              <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price ($)</label>
              <input type="number" step="0.01" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Prep Time (min)</label>
              <input type="number" value={editing.preparationTime} onChange={e => setEditing({ ...editing, preparationTime: parseInt(e.target.value) || 0 })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Image URL (optional)</label>
              <div className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input value={editing.image ?? ''} onChange={e => setEditing({ ...editing, image: e.target.value || undefined })} placeholder="https://example.com/photo.jpg" className="flex-1 rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                {editing.image && <img src={editing.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.available} onChange={e => setEditing({ ...editing, available: e.target.checked })} className="rounded" />
                Available
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={save}><Save className="h-4 w-4" />{isNew ? 'Add Item' : 'Save'}</Button>
              <Button variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="h-4 w-4" />Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map(item => {
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
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { categories, addCategory, updateCategory, removeCategory } = useMenu();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setEditing({ id: isSupabaseConfigured() ? crypto.randomUUID() : `cat-${Date.now()}`, name: '', icon: '📋', order: categories.length + 1 });
    setIsNew(true);
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    if (isNew) addCategory(editing);
    else updateCategory(editing);
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{categories.length} categories</span>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Add Category</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardContent className="flex gap-4 p-6 items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</label>
              <input value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} className="w-full rounded-xl bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button onClick={save}><Save className="h-4 w-4" />{isNew ? 'Add' : 'Save'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ambient-sm">
            <span className="text-2xl">{cat.icon}</span>
            <span className="flex-1 font-display text-sm font-semibold text-foreground">{cat.name}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(cat); setIsNew(false); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeCategory(cat.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
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
        <div className="flex items-end sm:col-span-2">
          <Button onClick={() => updateBrand(form)} className="w-full">
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
