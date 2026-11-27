import { supabase, type ProfileRow } from './supabase'
import type { Role, User } from '../types'

export function profileToUser(profile: ProfileRow): Omit<User, 'password'> {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || undefined,
    role: profile.role as Role,
    avatar: profile.avatar_url || undefined,
    householdId: profile.household_id || undefined,
    createdAt: profile.created_at,
  }
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.error('fetchProfile', error.message)
    return null
  }
  return data as ProfileRow | null
}

export async function ensureSessionUser(): Promise<Omit<User, 'password'> | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const session = data.session
  if (!session?.user) return null
  const profile = await fetchProfile(session.user.id)
  if (!profile) {
    return {
      id: session.user.id,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Member',
      email: session.user.email || '',
      role: (session.user.user_metadata?.role as Role) || 'member',
      createdAt: session.user.created_at,
    }
  }
  return profileToUser(profile)
}
