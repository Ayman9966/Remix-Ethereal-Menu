import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_DEFAULTS } from '@/lib/supabase-config';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  SUPABASE_DEFAULTS.url;

const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  SUPABASE_DEFAULTS.publishableKey;

let _client: SupabaseClient | null = null;

/**
 * Checks if the key is a secret service-role key.
 * These should NEVER be used in the client/browser.
 */
function isServiceRoleKey(key: string): boolean {
  return key.trim().startsWith('sb_secret_') || key.trim().includes('service_role');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Security: check if we are in the browser
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser && isServiceRoleKey(supabaseKey!)) {
    console.error(
      '[supabase] CRITICAL: Service role key detected in browser context. Blocking initialization for security.',
    );
    return null;
  }

  if (_client) return _client;

  _client = createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

