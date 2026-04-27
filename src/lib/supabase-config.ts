export const SUPABASE_DEFAULTS = {
  // Keep defaults empty so credentials only come from env vars.
  // Client should use VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY.
  url: '',
  publishableKey: '',
} as const;

