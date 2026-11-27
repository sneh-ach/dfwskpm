import { supabase, type HouseholdRow } from './supabase'
import type { Household, HouseholdMember } from '../types'
import { useContentStore } from '../store/contentStore'

type MemberRow = {
  id: string
  household_id: string
  name: string
  relation: string
  age: number | null
  is_primary: boolean
  photo_url: string | null
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function mapHousehold(row: HouseholdRow, members: MemberRow[]): Household {
  return {
    id: row.id,
    familyName: row.family_name,
    primaryName: row.primary_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 || undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    photo: row.photo_url || undefined,
    notes: row.notes || undefined,
    status: row.status,
    source: row.source || undefined,
    needsReview: row.needs_review,
    members: members.map(
      (m): HouseholdMember => ({
        id: m.id,
        name: m.name,
        relation: m.relation,
        age: m.age ?? undefined,
        isPrimary: m.is_primary,
        photo: m.photo_url || undefined,
      }),
    ),
    donations: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchHouseholdById(householdId: string): Promise<Household | null> {
  if (!supabase) return null
  const { data: row, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .maybeSingle()
  if (error || !row) {
    if (error) console.error('fetchHouseholdById', error.message)
    return null
  }
  const { data: members } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })
  return mapHousehold(row as HouseholdRow, (members || []) as MemberRow[])
}

/** Pull household into the local content store so Member/Admin UI can render it. */
export async function hydrateHousehold(householdId: string): Promise<Household | null> {
  const hh = await fetchHouseholdById(householdId)
  if (!hh) return null
  const existing = useContentStore.getState().households.find((h) => h.id === hh.id)
  useContentStore.getState().upsertHousehold({
    ...hh,
    donations: existing?.donations ?? [],
  })
  return hh
}

/** Admin/staff: load every household + members from Supabase into the local store. */
export async function syncHouseholdsFromSupabase(): Promise<number> {
  if (!supabase) return 0

  const [{ data: rows, error }, { data: members, error: membersError }] = await Promise.all([
    supabase.from('households').select('*').order('created_at', { ascending: false }),
    supabase.from('household_members').select('*').order('created_at', { ascending: true }),
  ])

  if (error) {
    console.error('syncHouseholdsFromSupabase', error.message)
    return 0
  }
  if (membersError) console.error('syncHouseholdMembers', membersError.message)

  const byHousehold = new Map<string, MemberRow[]>()
  for (const m of (members || []) as MemberRow[]) {
    const list = byHousehold.get(m.household_id) || []
    list.push(m)
    byHousehold.set(m.household_id, list)
  }

  const remote = ((rows || []) as HouseholdRow[]).map((row) =>
    mapHousehold(row, byHousehold.get(row.id) || []),
  )

  const local = useContentStore.getState().households
  const remoteIds = new Set(remote.map((h) => h.id))
  const mergedRemote = remote.map((hh) => ({
    ...hh,
    donations: local.find((l) => l.id === hh.id)?.donations ?? [],
  }))
  // Keep any purely local draft households (non-UUID ids) that were never pushed
  const localOnly = local.filter((h) => !remoteIds.has(h.id) && !isUuid(h.id))

  useContentStore.setState({ households: [...mergedRemote, ...localOnly] })
  return mergedRemote.length
}

export async function pushHouseholdToSupabase(hh: Household): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!supabase) return { ok: true, id: hh.id }

  const payload = {
    family_name: hh.familyName,
    primary_name: hh.primaryName,
    email: hh.email.toLowerCase().trim(),
    phone: hh.phone || '',
    address_line1: hh.addressLine1 || '',
    address_line2: hh.addressLine2 || null,
    city: hh.city || '',
    state: hh.state || 'TX',
    zip: hh.zip || '',
    photo_url: hh.photo || null,
    notes: hh.notes || null,
    status: hh.status,
    source: hh.source || 'admin',
    needs_review: Boolean(hh.needsReview),
    updated_at: new Date().toISOString(),
  }

  let householdId = isUuid(hh.id) ? hh.id : null

  if (householdId) {
    const { error } = await supabase.from('households').update(payload).eq('id', householdId)
    if (error) return { ok: false, error: error.message }
  } else {
    const { data, error } = await supabase.from('households').insert(payload).select('id').single()
    if (error || !data) return { ok: false, error: error?.message || 'Insert failed' }
    householdId = data.id as string
  }

  // Replace members for a clean sync
  await supabase.from('household_members').delete().eq('household_id', householdId)
  if (hh.members.length) {
    const { error: membersError } = await supabase.from('household_members').insert(
      hh.members.map((m, i) => ({
        household_id: householdId,
        name: m.name,
        relation: m.relation || 'Family',
        age: m.age ?? null,
        is_primary: Boolean(m.isPrimary) || i === 0,
        photo_url: m.photo || null,
      })),
    )
    if (membersError) return { ok: false, error: membersError.message }
  }

  await hydrateHousehold(householdId)
  return { ok: true, id: householdId }
}

export async function markHouseholdReviewedInSupabase(id: string) {
  if (!supabase || !isUuid(id)) return
  await supabase
    .from('households')
    .update({ needs_review: false, updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function deleteHouseholdInSupabase(id: string) {
  if (!supabase || !isUuid(id)) return
  await supabase.from('households').delete().eq('id', id)
}
