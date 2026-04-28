import type { BrandSettings, Category, MenuItem, Order, OrderItem } from '@/lib/menu-data';
import { defaultBrand, defaultCategories, defaultMenuItems } from '@/lib/menu-data';
import { getSupabaseClient } from '@/lib/supabase';

type DbCategory = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
};

type DbMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category_id: string;
  image_url: string | null;
  available: boolean;
  preparation_time: number;
};

type DbBrandSettings = {
  restaurant_name: string;
  tagline: string;
  accent_color: string;
  logo_url: string | null;
  hero_image_url: string | null;
  online_ordering_enabled: boolean;
  show_prep_time: boolean;
  menu_scale: number;
  currency: string;
  total_tables: number;
  ordering_mode: 'dine-in' | 'takeaway' | 'both';
  board_background_color?: string | null;
  board_cycle_seconds?: number | null;
  board_columns?: number | null;
  board_show_photos?: boolean | null;
  board_show_price?: boolean | null;
  board_show_description?: boolean | null;
  board_show_prep_time?: boolean | null;
  auto_print_invoice?: boolean | null;
  invoice_size?: '58mm' | '80mm' | null;
};

type DbOrder = {
  id: string;
  order_number: number | null;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  order_type: 'dine-in' | 'takeaway';
  table_number: number | null;
  total: number | string;
  created_at: string;
  updated_at: string;
};

type DbOrderItem = {
  quantity: number;
  notes: string | null;
  unit_price: number | string;
  menu_items: DbMenuItem & { categories?: DbCategory | null };
};

function toNumber(v: number | string): number {
  return typeof v === 'number' ? v : Number(v);
}

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    order: row.sort_order,
  };
}

function mapMenuItem(row: DbMenuItem): MenuItem {
  const fallbackImage = defaultMenuItems.find((i) => i.name === row.name)?.image;
  const storedImage = row.image_url ?? undefined;

  // Avoid persisting/using Vite hashed asset paths from old builds.
  // If Supabase has a relative /assets/... URL, prefer the local fallback.
  const image =
    storedImage && (storedImage.startsWith('http://') || storedImage.startsWith('https://'))
      ? storedImage
      : fallbackImage ?? storedImage;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: toNumber(row.price),
    categoryId: row.category_id,
    image,
    available: row.available,
    preparationTime: row.preparation_time,
  };
}

function mapBrand(row: DbBrandSettings, nextOrderNumber: number): BrandSettings {
  return {
    restaurantName: row.restaurant_name,
    tagline: row.tagline,
    accentColor: row.accent_color,
    logoUrl: row.logo_url ?? undefined,
    heroImageUrl: row.hero_image_url ?? undefined,
    onlineOrderingEnabled: row.online_ordering_enabled,
    showPrepTime: row.show_prep_time,
    menuScale: row.menu_scale,
    currency: row.currency,
    totalTables: row.total_tables,
    orderingMode: row.ordering_mode,
    boardBackgroundColor: row.board_background_color ?? defaultBrand.boardBackgroundColor,
    boardCycleSeconds: row.board_cycle_seconds ?? defaultBrand.boardCycleSeconds,
    boardColumns: row.board_columns ?? defaultBrand.boardColumns,
    boardShowPhotos: row.board_show_photos ?? defaultBrand.boardShowPhotos,
    boardShowPrice: row.board_show_price ?? defaultBrand.boardShowPrice,
    boardShowDescription: row.board_show_description ?? defaultBrand.boardShowDescription,
    boardShowPrepTime: row.board_show_prep_time ?? defaultBrand.boardShowPrepTime,
    autoPrintInvoice: row.auto_print_invoice ?? defaultBrand.autoPrintInvoice,
    invoiceSize: row.invoice_size ?? defaultBrand.invoiceSize,
    nextOrderNumber,
  };
}

function mapOrder(order: DbOrder, items: OrderItem[]): Order {
  return {
    id: order.id,
    orderNumber: order.order_number ?? 0,
    status: order.status,
    orderType: order.order_type,
    tableNumber: order.table_number ?? undefined,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    total: toNumber(order.total),
    items,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultCategories;
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,icon,sort_order')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultMenuItems;
  const { data, error } = await supabase
    .from('menu_items')
    .select('id,name,description,price,category_id,image_url,available,preparation_time')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function fetchBrandSettings(): Promise<BrandSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultBrand;

  const { data: brandRows, error: brandErr } = await supabase
    .from('brand_settings')
    .select(
      'restaurant_name,tagline,accent_color,logo_url,hero_image_url,online_ordering_enabled,show_prep_time,menu_scale,currency,total_tables,ordering_mode,board_background_color,board_cycle_seconds,board_columns,board_show_photos,board_show_price,board_show_description,board_show_prep_time,auto_print_invoice,invoice_size',
    )
    .limit(1);
  let brandRow: DbBrandSettings | null = (brandRows?.[0] as DbBrandSettings) ?? null;

  // Backward compatibility: older DB schemas may not have board_* columns yet.
  if (brandErr) {
    const { data: legacyRows, error: legacyErr } = await supabase
      .from('brand_settings')
      .select(
        'restaurant_name,tagline,accent_color,logo_url,hero_image_url,online_ordering_enabled,show_prep_time,menu_scale,currency,total_tables,ordering_mode',
      )
      .limit(1);
    if (legacyErr) throw legacyErr;
    brandRow = (legacyRows?.[0] as DbBrandSettings) ?? null;
  }

  const { data: maxOrderRow, error: maxOrderErr } = await supabase
    .from('orders')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1);
  if (maxOrderErr) throw maxOrderErr;
  const nextOrderNumber = (maxOrderRow?.[0]?.order_number ?? 0) + 1;

  return brandRow
    ? mapBrand(brandRow as DbBrandSettings, nextOrderNumber)
    : { ...defaultBrand, nextOrderNumber };
}

export async function fetchOrders(limit = 200): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: orderRows, error: orderErr } = await supabase
    .from('orders')
    .select('id,order_number,status,order_type,table_number,total,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (orderErr) throw orderErr;

  const orders: Order[] = [];
  for (const o of (orderRows ?? []) as DbOrder[]) {
    const { data: orderItemRows, error: oiErr } = await supabase
      .from('order_items')
      .select(
        'quantity,notes,unit_price,menu_items(id,name,description,price,category_id,image_url,available,preparation_time,categories(id,name,icon,sort_order))',
      )
      .eq('order_id', o.id);
    if (oiErr) throw oiErr;

    const itemsForOrder: OrderItem[] = ((orderItemRows ?? []) as any[]).map((r) => {
      const menuItemRaw = Array.isArray(r.menu_items) ? r.menu_items[0] : r.menu_items;
      return {
        quantity: r.quantity,
        notes: r.notes ?? undefined,
        menuItem: mapMenuItem(menuItemRaw as DbMenuItem),
      };
    });

    orders.push(mapOrder(o, itemsForOrder));
  }

  return orders;
}

export async function fetchBootstrapData(): Promise<{
  categories: Category[];
  items: MenuItem[];
  brand: BrandSettings;
  orders: Order[];
}> {
  // Try to fetch from server-side cache first
  try {
    const response = await fetch('/api/bootstrap');
    if (response.ok) {
      const data = await response.json();
      
      // Map the DB rows to our local types (same as in existing fetchers)
      // Note: we need to use the mapping functions defined in this file
      
      const categories = (data.categories ?? []).map(mapCategory);
      const items = (data.items ?? []).map(mapMenuItem);
      
      const orders = (data.orders ?? []).map((o: any) => {
        const mappedItems = (o.order_items || []).map((oi: any) => ({
          quantity: oi.quantity,
          notes: oi.notes ?? undefined,
          menuItem: mapMenuItem(oi.menu_items)
        }));
        // Map top level order props
        const dbOrder: DbOrder = {
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          order_type: o.order_type,
          table_number: o.table_number,
          total: o.total,
          created_at: o.created_at,
          updated_at: o.updated_at
        };
        return mapOrder(dbOrder, mappedItems);
      });
      
      const brand = data.brand ? mapBrand(data.brand, (data.orders?.[0]?.order_number ?? 0) + 1) : defaultBrand;

      return { categories, items, brand, orders };
    }
  } catch (e) {
    console.warn("Failed to fetch from server cache, falling back to direct Supabase:", e);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      categories: defaultCategories,
      items: defaultMenuItems,
      brand: defaultBrand,
      orders: [],
    };
  }

  const [categories, items] = await Promise.all([fetchCategories(), fetchMenuItems()]);

  // Ensure we always have at least seeded categories and items in Supabase
  if (categories.length === 0 && items.length === 0) {
    const seededCats = defaultCategories.map(c => ({
      name: c.name,
      icon: c.icon,
      sort_order: c.order
    }));
    await supabase.from('categories').insert(seededCats);
    return await fetchBootstrapData();
  }

  if (categories.length > 0 && items.length === 0) {
    const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const seeded = defaultMenuItems
      .map((i) => {
        const fallbackCatName =
          defaultCategories.find((c) => c.id === i.categoryId)?.name?.toLowerCase() ?? '';
        const category_id = byName.get(fallbackCatName);
        if (!category_id) return null;
        return {
          name: i.name,
          description: i.description,
          price: i.price,
          category_id,
          // Don't store Vite hashed asset URLs in the DB.
          // If you want images persisted, use a real URL or Supabase Storage.
          image_url: null,
          available: i.available,
          preparation_time: i.preparationTime,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (seeded.length > 0) {
      await supabase.from('menu_items').insert(seeded);
      return await fetchBootstrapData();
    }
  }
  const [brand, orders] = await Promise.all([fetchBrandSettings(), fetchOrders()]);

  return { categories, items, brand, orders };
}

export async function upsertCategory(cat: Category): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('categories').upsert({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    sort_order: cat.order,
  });
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function upsertMenuItem(item: MenuItem): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').upsert({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category_id: item.categoryId,
    image_url: item.image ?? null,
    available: item.available,
    preparation_time: item.preparationTime,
  });
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function upsertBrandSettings(brand: BrandSettings): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { data: existing, error: selErr } = await supabase.from('brand_settings').select('id').limit(1);
  if (selErr) throw selErr;

  const row = {
    restaurant_name: brand.restaurantName,
    tagline: brand.tagline,
    accent_color: brand.accentColor,
    logo_url: brand.logoUrl ?? null,
    hero_image_url: brand.heroImageUrl ?? null,
    online_ordering_enabled: brand.onlineOrderingEnabled,
    show_prep_time: brand.showPrepTime,
    menu_scale: brand.menuScale,
    currency: brand.currency,
    total_tables: brand.totalTables,
    ordering_mode: brand.orderingMode,
    board_background_color: brand.boardBackgroundColor,
    board_cycle_seconds: brand.boardCycleSeconds,
    board_columns: brand.boardColumns,
    board_show_photos: brand.boardShowPhotos,
    board_show_price: brand.boardShowPrice,
    board_show_description: brand.boardShowDescription,
    board_show_prep_time: brand.boardShowPrepTime,
    auto_print_invoice: brand.autoPrintInvoice,
    invoice_size: brand.invoiceSize,
  };
  const legacyRow = {
    restaurant_name: brand.restaurantName,
    tagline: brand.tagline,
    accent_color: brand.accentColor,
    logo_url: brand.logoUrl ?? null,
    hero_image_url: brand.heroImageUrl ?? null,
    online_ordering_enabled: brand.onlineOrderingEnabled,
    show_prep_time: brand.showPrepTime,
    menu_scale: brand.menuScale,
    currency: brand.currency,
    total_tables: brand.totalTables,
    ordering_mode: brand.orderingMode,
  };

  const id = existing?.[0]?.id as string | undefined;
  if (id) {
    const { error } = await supabase.from('brand_settings').update(row).eq('id', id);
    if (error) {
      const { error: legacyError } = await supabase.from('brand_settings').update(legacyRow).eq('id', id);
      if (legacyError) throw legacyError;
    }
  } else {
    const { error } = await supabase.from('brand_settings').insert(row);
    if (error) {
      const { error: legacyError } = await supabase.from('brand_settings').insert(legacyRow);
      if (legacyError) throw legacyError;
    }
  }
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function createOrder(order: Omit<Order, 'orderNumber'>): Promise<Order> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const fallback: Order = { ...order, orderNumber: 0, createdAt: new Date(), id: crypto.randomUUID() };
    return fallback;
  }

  const { data: insertedOrder, error: orderErr } = await supabase
    .from('orders')
    .insert({
      status: order.status,
      order_type: order.orderType,
      table_number: order.tableNumber ?? null,
      total: order.total,
    })
    .select('id,order_number,status,order_type,table_number,total,created_at,updated_at')
    .single();
  if (orderErr) throw orderErr;

  const oiRows = order.items.map((it) => ({
    order_id: insertedOrder.id,
    menu_item_id: it.menuItem.id,
    quantity: it.quantity,
    notes: it.notes ?? null,
    unit_price: it.menuItem.price,
  }));

  const { error: oiErr } = await supabase.from('order_items').insert(oiRows);
  if (oiErr) throw oiErr;

  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
  return mapOrder(insertedOrder as DbOrder, order.items);
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

