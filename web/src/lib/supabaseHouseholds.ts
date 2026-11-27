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
