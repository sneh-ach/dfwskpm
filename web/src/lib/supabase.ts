import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type ProfileRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'editor' | 'member'
  avatar_url: string | null
  household_id: string | null
  created_at: string
}

export type HouseholdRow = {
  id: string
  family_name: string
  primary_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  zip: string
  photo_url: string | null
  notes: string | null
  status: 'active' | 'inactive'
  source: 'signup' | 'admin' | null
  needs_review: boolean
  created_at: string
  updated_at: string
}
