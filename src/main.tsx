import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase'
import './index.css'
import './styles.css'

// Check Supabase connection status
if (!isSupabaseConfigured()) {
  console.warn('[supabase] Project URL or Key is missing. Falling back to local storage.');
} else {
  const client = getSupabaseClient();
  if (client) {
    console.log('[supabase] Client initialized successfully.');
  }
}

const router = getRouter()

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
