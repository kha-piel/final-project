import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_AI_API_BASE_URL: z.string().url().optional(),
})

const parsedEnv = envSchema.parse(import.meta.env)

export const env = {
  supabaseUrl: parsedEnv.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: parsedEnv.VITE_SUPABASE_ANON_KEY ?? '',
  aiApiBaseUrl: parsedEnv.VITE_AI_API_BASE_URL ?? '',
}

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}
