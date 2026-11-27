import { supabase, type ProfileRow } from './supabase'
import type { User } from '../types'
import { useAuthStore } from '../store/authStore'
import { syncHouseholdsFromSupabase } from './supabaseHouseholds'

/** Admin: merge member profiles into the auth user directory for lookup. */
export async function syncMemberProfilesFromSupabase(): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'member')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('syncMemberProfilesFromSupabase', error.message)
    return 0
  }

  const remoteUsers: User[] = ((data || []) as ProfileRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    password: '',
    phone: p.phone || undefined,
    avatar: p.avatar_url || undefined,
    role: 'member',
    householdId: p.household_id || undefined,
    createdAt: p.created_at,
  }))

  useAuthStore.setState((s) => {
    const byId = new Map(s.users.map((u) => [u.id, u]))
    for (const remote of remoteUsers) {
      const existing = byId.get(remote.id)
      byId.set(remote.id, existing ? { ...existing, ...remote, password: existing.password } : remote)
    }
    return { users: [...byId.values()] }
  })

  return remoteUsers.length
}

export async function syncAdminDirectoryFromSupabase() {
  await Promise.all([syncHouseholdsFromSupabase(), syncMemberProfilesFromSupabase()])
}
