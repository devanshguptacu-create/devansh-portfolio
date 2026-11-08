import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anon)

// True if the visitor arrived through a password-recovery email link (captured before the client clears the URL).
export const openedFromRecoveryLink = typeof window !== 'undefined' && /type=recovery/.test(window.location.hash + window.location.search)

// Only the public anon key is used. All access is governed by RLS in the database.
export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
