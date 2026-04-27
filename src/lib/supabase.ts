import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_DEFAULTS } from '@/lib/supabase-config';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ??
  SUPABASE_DEFAULTS.url;

const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  SUPABASE_DEFAULTS.publishableKey;

let _client: SupabaseClient | null = null;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=');
    const json = atob(padded);
    const payload = JSON.parse(json);
    if (!payload || typeof payload !== 'object') return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isUnsafeClientKey(key: string): boolean {
  const trimmed = key.trim();
  // Never allow service-role secrets in the browser bundle.
  if (trimmed.startsWith('sb_secret_')) return true;
  // Allow the new publishable key format
  if (trimmed.startsWith('sb_publishable_')) return false;

  // Also allow the legacy anon JWT key format, but block service_role
  if (trimmed.startsWith('eyJ')) {
    const payload = decodeJwtPayload(trimmed);
    const role = payload?.role;
    if (role === 'service_role') return true;
    // allow anon/authenticated keys
    return false;
  }

  // Anything else is unexpected in client code
  return true;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (isUnsafeClientKey(supabaseKey!)) {
    console.error(
      '[supabase] Refusing to initialize client: invalid/unsafe key. Use sb_publishable_* or an anon JWT (not service_role).',
    );
    return null;
  }
  if (_client) return _client;
  _client = createClient(supabaseUrl!, supabaseKey!);
  return _client;
}

