import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL  || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)
export const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Xiomi Detalles'
export const STORE_WA   = import.meta.env.VITE_STORE_WA   || '51999888777'
