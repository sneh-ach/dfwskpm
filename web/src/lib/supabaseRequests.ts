import { supabase } from './supabase'
import type { MemberRequest, MemberRequestType } from '../types'
import { useContentStore } from '../store/contentStore'

type RequestRow = {
  id: string
  household_id: string
  user_id: string | null
  name: string
  email: string
  type: string
  subject: string
  message: string
  status: string
  created_at: string
  resolved_at: string | null
}

function mapRequest(row: RequestRow): MemberRequest {
  return {
    id: row.id,
    householdId: row.household_id,
    userId: row.user_id || '',
    name: row.name,
    email: row.email,
    type: row.type as MemberRequestType,
    subject: row.subject,
    message: row.message,
    status: row.status === 'resolved' ? 'resolved' : 'open',
    createdAt: row.created_at,
    resolvedAt: row.resolved_at || undefined,
  }
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export async function syncMemberRequestsFromSupabase() {
  if (!supabase) return
  const { data, error } = await supabase
    .from('member_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('syncMemberRequestsFromSupabase', error.message)
    return
  }
  const remote = ((data || []) as RequestRow[]).map(mapRequest)
  const local = useContentStore.getState().memberRequests || []
  const byId = new Map<string, MemberRequest>()
  for (const r of remote) byId.set(r.id, r)
  for (const r of local) {
    if (!byId.has(r.id) && !isUuid(r.id)) byId.set(r.id, r)
  }
  useContentStore.setState({ memberRequests: [...byId.values()] })
}

export async function pushMemberRequestToSupabase(
  req: Omit<MemberRequest, 'id' | 'createdAt' | 'status' | 'resolvedAt'>,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    useContentStore.getState().addMemberRequest(req)
    return { ok: true }
  }
  if (!isUuid(req.householdId)) {
    useContentStore.getState().addMemberRequest(req)
    return { ok: true }
  }

  const { data, error } = await supabase
    .from('member_requests')
    .insert({
      household_id: req.householdId,
      user_id: req.userId && isUuid(req.userId) ? req.userId : null,
      name: req.name,
      email: req.email,
      type: req.type || 'general',
      subject: req.subject,
      message: req.message,
      status: 'open',
    })
    .select('*')
    .single()

  if (error || !data) return { ok: false, error: error?.message || 'Could not send request' }
  const mapped = mapRequest(data as RequestRow)
  useContentStore.setState((s) => ({
    memberRequests: [mapped, ...(s.memberRequests || []).filter((r) => r.id !== mapped.id)],
  }))
  return { ok: true }
}

export async function resolveMemberRequestInSupabase(id: string) {
  useContentStore.getState().resolveMemberRequest(id)
  if (!supabase || !isUuid(id)) return
  await supabase
    .from('member_requests')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
}
