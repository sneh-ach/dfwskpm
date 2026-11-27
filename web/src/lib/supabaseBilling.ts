import { supabase } from './supabase'
import type { Invoice, InvoiceStatus, InvoiceType, PaymentMethod, PaymentTransaction } from '../types'
import { useContentStore } from '../store/contentStore'

type InvoiceRow = {
  id: string
  household_id: string
  invoice_number: string
  title: string
  description: string
  type: string
  amount: number | string
  status: string
  due_date: string
  issued_at: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

type TxnRow = {
  id: string
  household_id: string
  invoice_id: string | null
  amount: number | string
  method: string
  status: string
  reference: string | null
  note: string | null
  created_at: string
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    householdId: row.household_id,
    invoiceNumber: row.invoice_number,
    title: row.title,
    description: row.description,
    type: row.type as InvoiceType,
    amount: Number(row.amount),
    status: row.status as InvoiceStatus,
    dueDate: row.due_date,
    issuedAt: row.issued_at,
    paidAt: row.paid_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTxn(row: TxnRow): PaymentTransaction {
  return {
    id: row.id,
    householdId: row.household_id,
    invoiceId: row.invoice_id || undefined,
    amount: Number(row.amount),
    method: row.method as PaymentMethod,
    status: row.status as PaymentTransaction['status'],
    reference: row.reference || undefined,
    note: row.note || undefined,
    createdAt: row.created_at,
  }
}

/** Push any browser-only invoices (non-UUID ids) for real households so members can see them. */
export async function migrateLocalInvoicesToSupabase() {
  if (!supabase) return
  const local = useContentStore.getState().invoices.filter(
    (i) => !isUuid(i.id) && isUuid(i.householdId),
  )
  for (const inv of local) {
    const result = await pushInvoiceToSupabase({
      householdId: inv.householdId,
      title: inv.title,
      description: inv.description,
      type: inv.type,
      amount: inv.amount,
      status: inv.status,
      dueDate: inv.dueDate,
      issuedAt: inv.issuedAt,
      paidAt: inv.paidAt,
      invoiceNumber: inv.invoiceNumber,
    })
    if (result.ok && result.id) {
      useContentStore.setState((s) => ({
        invoices: s.invoices.filter((i) => i.id !== inv.id),
      }))
    }
  }
}

export async function syncBillingFromSupabase(householdId?: string) {
  if (!supabase) return

  let invoiceQuery = supabase.from('invoices').select('*').order('issued_at', { ascending: false })
  let txnQuery = supabase.from('transactions').select('*').order('created_at', { ascending: false })
  if (householdId) {
    invoiceQuery = invoiceQuery.eq('household_id', householdId)
    txnQuery = txnQuery.eq('household_id', householdId)
  }

  const [{ data: invoiceRows, error: invError }, { data: txnRows, error: txnError }] = await Promise.all([
    invoiceQuery,
    txnQuery,
  ])

  if (invError) console.error('sync invoices', invError.message)
  if (txnError) console.error('sync transactions', txnError.message)

  const remoteInvoices = ((invoiceRows || []) as InvoiceRow[]).map(mapInvoice)
  const remoteTxns = ((txnRows || []) as TxnRow[]).map(mapTxn)

  const local = useContentStore.getState()
  if (householdId) {
    // Member view: Supabase is source of truth for this household — drop stale local-only rows
    const otherInvoices = local.invoices.filter((i) => i.householdId !== householdId)
    const otherTxns = local.transactions.filter((t) => t.householdId !== householdId)
    useContentStore.setState({
      invoices: [...otherInvoices, ...remoteInvoices],
      transactions: [...otherTxns, ...remoteTxns],
    })
    return
  }

  // Admin: keep non-UUID local drafts for households that are not yet in Supabase
  const remoteOnlyKeepLocal = local.invoices.filter((i) => !isUuid(i.id) && !isUuid(i.householdId))
  const remoteOnlyKeepLocalTxn = local.transactions.filter(
    (t) => !isUuid(t.id) && !isUuid(t.householdId),
  )
  useContentStore.setState({
    invoices: [...remoteInvoices, ...remoteOnlyKeepLocal],
    transactions: [...remoteTxns, ...remoteOnlyKeepLocalTxn],
  })
}

export async function pushInvoiceToSupabase(
  invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'> & {
    id?: string
    invoiceNumber?: string
  },
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!supabase) {
    const id = useContentStore.getState().upsertInvoice(invoice)
    return { ok: true, id }
  }

  const existingLocal = invoice.id
    ? useContentStore.getState().invoices.find((i) => i.id === invoice.id)
    : undefined

  const year = new Date().getFullYear()
  const invoiceNumber =
    invoice.invoiceNumber ||
    existingLocal?.invoiceNumber ||
    `INV-${year}-${String(useContentStore.getState().invoices.length + 1).padStart(3, '0')}`

  const payload = {
    household_id: invoice.householdId,
    invoice_number: invoiceNumber,
    title: invoice.title,
    description: invoice.description || '',
    type: invoice.type || 'other',
    amount: invoice.amount,
    status: invoice.status || 'open',
    due_date: invoice.dueDate,
    issued_at: invoice.issuedAt,
    paid_at: invoice.paidAt || null,
    updated_at: new Date().toISOString(),
  }

  if (invoice.id && isUuid(invoice.id)) {
    const { error } = await supabase.from('invoices').update(payload).eq('id', invoice.id)
    if (error) return { ok: false, error: error.message }
    useContentStore.getState().upsertInvoice({ ...invoice, id: invoice.id, invoiceNumber })
    return { ok: true, id: invoice.id }
  }

  const { data, error } = await supabase.from('invoices').insert(payload).select('*').single()
  if (error || !data) return { ok: false, error: error?.message || 'Could not create invoice' }
  const mapped = mapInvoice(data as InvoiceRow)
  useContentStore.getState().upsertInvoice(mapped)
  return { ok: true, id: mapped.id }
}

export async function markInvoicePaidInSupabase(
  invoiceId: string,
  method: PaymentMethod,
  reference?: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    useContentStore.getState().markInvoicePaid(invoiceId, method, reference, note)
    return { ok: true }
  }

  if (!isUuid(invoiceId)) {
    useContentStore.getState().markInvoicePaid(invoiceId, method, reference, note)
    return { ok: true }
  }

  const { error } = await supabase.rpc('mark_invoice_paid', {
    p_invoice_id: invoiceId,
    p_method: method,
    p_reference: reference || null,
    p_note: note || null,
  })
  if (error) return { ok: false, error: error.message }

  await syncBillingFromSupabase()
  return { ok: true }
}

export async function pushTransactionToSupabase(
  txn: Omit<PaymentTransaction, 'id' | 'createdAt'> & { id?: string },
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!supabase) {
    useContentStore.getState().addTransaction(txn)
    return { ok: true }
  }

  const payload = {
    household_id: txn.householdId,
    invoice_id: txn.invoiceId && isUuid(txn.invoiceId) ? txn.invoiceId : null,
    amount: txn.amount,
    method: txn.method || 'other',
    status: txn.status || 'completed',
    reference: txn.reference || null,
    note: txn.note || null,
  }

  const { data, error } = await supabase.from('transactions').insert(payload).select('*').single()
  if (error || !data) return { ok: false, error: error?.message || 'Could not save payment' }
  const mapped = mapTxn(data as TxnRow)
  useContentStore.setState((s) => ({
    transactions: s.transactions.some((t) => t.id === mapped.id)
      ? s.transactions.map((t) => (t.id === mapped.id ? mapped : t))
      : [mapped, ...s.transactions],
  }))
  return { ok: true, id: mapped.id }
}

/** Apply a logged payment to the oldest open invoice when amounts match closely. */
export async function applyPaymentToOpenInvoices(
  householdId: string,
  amount: number,
  method: PaymentMethod,
  reference?: string,
  note?: string,
) {
  const open = useContentStore
    .getState()
    .invoices.filter(
      (i) =>
        i.householdId === householdId && (i.status === 'open' || i.status === 'overdue' || i.status === 'draft'),
    )
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))

  const exact = open.find((i) => Math.abs(i.amount - amount) < 0.009)
  if (exact) {
    return markInvoicePaidInSupabase(exact.id, method, reference, note || `Payment for ${exact.invoiceNumber}`)
  }

  return pushTransactionToSupabase({
    householdId,
    amount,
    method,
    status: 'completed',
    reference,
    note,
  })
}
