import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, hasSupabaseEnv } from '../config/env'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy web-app/.env.example to web-app/.env.local first.',
    )
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          Accept: 'application/json; charset=utf-8',
        },
      },
    })
  }

  return supabaseClient
}
