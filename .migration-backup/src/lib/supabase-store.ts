import type { BrandSettings, Category, MenuItem, Order, OrderItem } from '@/lib/menu-data';
import { defaultBrand, defaultCategories, defaultMenuItems, type WaiterCall } from '@/lib/menu-data';
import { getSupabaseClient } from '@/lib/supabase';

type DbCategory = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_archived?: boolean;
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
  is_archived?: boolean;
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
  tax_enabled?: boolean | null;
  tax_rate?: number | string | null;
  tax_type?: 'percentage' | 'fixed' | null;
  service_charge_enabled?: boolean | null;
  service_charge_rate?: number | string | null;
  service_charge_type?: 'percentage' | 'fixed' | null;
  additional_fee_enabled?: boolean | null;
  additional_fee_name?: string | null;
  additional_fee_amount?: number | string | null;
  additional_fee_type?: 'percentage' | 'fixed' | null;
  tax_apply_dine_in?: boolean | null;
  tax_apply_takeaway?: boolean | null;
  service_charge_apply_dine_in?: boolean | null;
  service_charge_apply_takeaway?: boolean | null;
  additional_fee_apply_dine_in?: boolean | null;
  additional_fee_apply_takeaway?: boolean | null;
};

type DbOrder = {
  id: string;
  order_number: number | null;
  status: 'awaiting_approval' | 'pending' | 'preparing' | 'ready' | 'served' | 'ready_to_pickup' | 'picked';
  order_type: 'dine-in' | 'takeaway';
  table_number: number | null;
  total: number | string;
  subtotal?: number | string;
  tax_amount?: number | string;
  service_charge_amount?: number | string;
  additional_fee_amount?: number | string;
  customer_phone?: string | null;
  created_at: string;
  updated_at: string;
};

type DbOrderItem = {
  quantity: number;
  notes: string | null;
  unit_price: number | string;
  menu_items: DbMenuItem & { categories?: DbCategory | null };
};

type DbWaiterCall = {
  id: string;
  table_number: number;
  acknowledged: boolean;
  created_at: string;
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
    archived: row.is_archived,
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
    archived: row.is_archived,
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
    taxEnabled: row.tax_enabled ?? defaultBrand.taxEnabled,
    taxRate: toNumber(row.tax_rate ?? defaultBrand.taxRate),
    taxType: row.tax_type ?? defaultBrand.taxType,
    serviceChargeEnabled: row.service_charge_enabled ?? defaultBrand.serviceChargeEnabled,
    serviceChargeRate: toNumber(row.service_charge_rate ?? defaultBrand.serviceChargeRate),
    serviceChargeType: row.service_charge_type ?? defaultBrand.serviceChargeType,
    additionalFeeEnabled: row.additional_fee_enabled ?? defaultBrand.additionalFeeEnabled,
    additionalFeeName: row.additional_fee_name ?? defaultBrand.additionalFeeName,
    additionalFeeAmount: toNumber(row.additional_fee_amount ?? defaultBrand.additionalFeeAmount),
    additionalFeeType: row.additional_fee_type ?? defaultBrand.additionalFeeType,
    taxApplyDineIn: row.tax_apply_dine_in ?? defaultBrand.taxApplyDineIn,
    taxApplyTakeaway: row.tax_apply_takeaway ?? defaultBrand.taxApplyTakeaway,
    serviceChargeApplyDineIn: row.service_charge_apply_dine_in ?? defaultBrand.serviceChargeApplyDineIn,
    serviceChargeApplyTakeaway: row.service_charge_apply_takeaway ?? defaultBrand.serviceChargeApplyTakeaway,
    additionalFeeApplyDineIn: row.additional_fee_apply_dine_in ?? defaultBrand.additionalFeeApplyDineIn,
    additionalFeeApplyTakeaway: row.additional_fee_apply_takeaway ?? defaultBrand.additionalFeeApplyTakeaway,
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
    subtotal: order.subtotal ? toNumber(order.subtotal) : undefined,
    taxAmount: order.tax_amount ? toNumber(order.tax_amount) : undefined,
    serviceChargeAmount: order.service_charge_amount ? toNumber(order.service_charge_amount) : undefined,
    additionalFeeAmount: order.additional_fee_amount ? toNumber(order.additional_fee_amount) : undefined,
    customerPhone: order.customer_phone ?? undefined,
    items,
  };
}

function mapWaiterCall(row: DbWaiterCall): WaiterCall {
  return {
    id: row.id,
    tableNumber: row.table_number,
    acknowledged: row.acknowledged,
    createdAt: new Date(row.created_at),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultCategories;
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,icon,sort_order,is_archived')
    .or('is_archived.is.null,is_archived.eq.false')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultMenuItems;
  const { data, error } = await supabase
    .from('menu_items')
    .select('id,name,description,price,category_id,image_url,available,preparation_time,is_archived')
    .or('is_archived.is.null,is_archived.eq.false')
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
      'restaurant_name,tagline,accent_color,logo_url,hero_image_url,online_ordering_enabled,show_prep_time,menu_scale,currency,total_tables,ordering_mode,board_background_color,board_cycle_seconds,board_columns,board_show_photos,board_show_price,board_show_description,board_show_prep_time,auto_print_invoice,invoice_size,tax_enabled,tax_rate,tax_type,service_charge_enabled,service_charge_rate,service_charge_type,additional_fee_enabled,additional_fee_name,additional_fee_amount,additional_fee_type,tax_apply_dine_in,tax_apply_takeaway,service_charge_apply_dine_in,service_charge_apply_takeaway,additional_fee_apply_dine_in,additional_fee_apply_takeaway',
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
    .select(`
      id,
      order_number,
      status,
      order_type,
      table_number,
      total,
      subtotal,
      tax_amount,
      service_charge_amount,
      additional_fee_amount,
      customer_phone,
      created_at,
      updated_at,
      order_items (
        quantity,
        notes,
        unit_price,
        menu_items (
          id,
          name,
          description,
          price,
          category_id,
          image_url,
          available,
          preparation_time
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (orderErr) throw orderErr;

  return (orderRows ?? []).map((o: any) => {
    const itemsForOrder: OrderItem[] = (o.order_items || []).map((r: any) => ({
      quantity: r.quantity,
      notes: r.notes ?? undefined,
      menuItem: mapMenuItem(r.menu_items as DbMenuItem),
    }));

    return mapOrder(o as DbOrder, itemsForOrder);
  });
}

export async function fetchWaiterCalls(): Promise<WaiterCall[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('waiter_calls')
    .select('id,table_number,acknowledged,created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(mapWaiterCall);
}

export async function fetchBootstrapData(): Promise<{
  categories: Category[];
  items: MenuItem[];
  brand: BrandSettings;
}> {
  // Try to fetch from server-side cache first
  try {
    const response = await fetch('/api/bootstrap');
    if (response.ok) {
      const data = await response.json();
      
      const categories = (data.categories ?? []).map(mapCategory);
      const items = (data.items ?? []).map(mapMenuItem);
      const brand = data.brand ? mapBrand(data.brand, 0) : defaultBrand; // Should ideally fetch nextOrderNumber separately or handle it

      return { categories, items, brand };
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
    };
  }

  const [categories, items] = await Promise.all([fetchCategories(), fetchMenuItems()]);
  const brand = await fetchBrandSettings();

  return { categories, items, brand };
}

export async function fetchAdditionalData(): Promise<{
  orders: Order[];
  waiterCalls: WaiterCall[];
}> {
  try {
    const response = await fetch('/api/additional-data');
    if (response.ok) {
      const data = await response.json();

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
          subtotal: o.subtotal,
          tax_amount: o.tax_amount,
          service_charge_amount: o.service_charge_amount,
          additional_fee_amount: o.additional_fee_amount,
          customer_phone: o.customer_phone,
          created_at: o.created_at,
          updated_at: o.updated_at
        };
        return mapOrder(dbOrder, mappedItems);
      });
      
      const waiterCalls = (data.waiter_calls ?? []).map(mapWaiterCall);

      return { orders, waiterCalls };
    }
  } catch (e) {
    console.warn("Failed to fetch additional data from server cache, falling back to direct Supabase:", e);
  }

  const [orders, waiterCalls] = await Promise.all([
    fetchOrders(),
    fetchWaiterCalls()
  ]);

  return { orders, waiterCalls };
}

export async function createWaiterCall(tableNumber: number): Promise<WaiterCall> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('waiter_calls')
    .insert({ table_number: tableNumber })
    .select()
    .single();
  if (error) throw error;
  return mapWaiterCall(data);
}

export async function updateWaiterCall(id: string, updates: Partial<WaiterCall>): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from('waiter_calls')
    .update({
      acknowledged: updates.acknowledged,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteWaiterCall(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('waiter_calls').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertCategory(cat: Category | Category[]): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  const toUpsert = Array.isArray(cat) 
    ? cat.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        sort_order: c.order,
        is_archived: c.archived ?? false,
      }))
    : {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        sort_order: cat.order,
        is_archived: cat.archived ?? false,
      };

  const { error } = await supabase.from('categories').upsert(toUpsert);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    // If foreign key constraint fails, archive it instead
    if (error.code === '23503') {
      const { error: archiveError } = await supabase
        .from('categories')
        .update({ is_archived: true })
        .eq('id', id);
      if (archiveError) throw archiveError;
      return;
    }
    throw error;
  }
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
    is_archived: item.archived ?? false,
  });
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) {
    // If foreign key constraint fails, archive it instead
    if (error.code === '23503') {
      const { error: archiveError } = await supabase
        .from('menu_items')
        .update({ is_archived: true })
        .eq('id', id);
      if (archiveError) throw archiveError;
      return;
    }
    throw error;
  }
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
    tax_enabled: brand.taxEnabled,
    tax_rate: brand.taxRate,
    tax_type: brand.taxType,
    service_charge_enabled: brand.serviceChargeEnabled,
    service_charge_rate: brand.serviceChargeRate,
    service_charge_type: brand.serviceChargeType,
    additional_fee_enabled: brand.additionalFeeEnabled,
    additional_fee_name: brand.additionalFeeName,
    additional_fee_amount: brand.additionalFeeAmount,
    additional_fee_type: brand.additionalFeeType,
    tax_apply_dine_in: brand.taxApplyDineIn,
    tax_apply_takeaway: brand.taxApplyTakeaway,
    service_charge_apply_dine_in: brand.serviceChargeApplyDineIn,
    service_charge_apply_takeaway: brand.serviceChargeApplyTakeaway,
    additional_fee_apply_dine_in: brand.additionalFeeApplyDineIn,
    additional_fee_apply_takeaway: brand.additionalFeeApplyTakeaway,
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
      subtotal: order.subtotal ?? 0,
      tax_amount: order.taxAmount ?? 0,
      service_charge_amount: order.serviceChargeAmount ?? 0,
      additional_fee_amount: order.additionalFeeAmount ?? 0,
      customer_phone: order.customerPhone ?? null,
    })
    .select('id,order_number,status,order_type,table_number,total,subtotal,tax_amount,service_charge_amount,additional_fee_amount,customer_phone,created_at,updated_at')
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

export async function fetchArchivedCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,icon,sort_order,is_archived')
    .eq('is_archived', true)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchArchivedMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('menu_items')
    .select('id,name,description,price,category_id,image_url,available,preparation_time,is_archived')
    .eq('is_archived', true)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function permanentDeleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function permanentDeleteMenuItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function restoreCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('categories').update({ is_archived: false }).eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

export async function restoreMenuItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').update({ is_archived: false }).eq('id', id);
  if (error) throw error;
  fetch('/api/cache/invalidate', { method: 'POST' }).catch(() => undefined);
}

