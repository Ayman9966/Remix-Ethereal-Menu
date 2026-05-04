const STORAGE_KEYS = {
  items: 'savor_menu_items',
  categories: 'savor_categories',
  orders: 'savor_orders',
  brand: 'savor_brand',
  pendingChanges: 'savor_pending_changes',
  waiterCalls: 'savor_waiter_calls',
  syncQueue: 'savor_sync_queue',
} as const;

type WithCreatedAt = { createdAt: string | Date };

function reviveCreatedAt<T extends WithCreatedAt>(value: unknown): T[] | null {
  if (!Array.isArray(value)) return null;
  return value.map((v) => {
    if (v && typeof v === 'object' && 'createdAt' in v) {
      const obj = v as Record<string, unknown>;
      const createdAtRaw = obj.createdAt;
      const createdAt =
        createdAtRaw instanceof Date
          ? createdAtRaw
          : typeof createdAtRaw === 'string'
            ? new Date(createdAtRaw)
            : new Date();
      return { ...(v as object), createdAt } as T;
    }
    return v as T;
  });
}

export function loadFromStorage<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    // Restore Date objects for orders
    if (key === 'orders') {
      const revived = reviveCreatedAt(parsed);
      if (revived) return revived as T;
    }
    if (key === 'waiterCalls') {
      const revived = reviveCreatedAt(parsed);
      if (revived) return revived as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
      return;
    }
  });
}
