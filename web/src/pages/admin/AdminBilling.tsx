import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Plus, Receipt, Search, X } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { Invoice, InvoiceStatus, InvoiceType, PaymentMethod } from '../../types'
import { Button } from '../../components/ui/Button'
import { HouseholdPicker } from '../../components/admin/HouseholdPicker'
import { cn, formatDate } from '../../lib/utils'
import { effectiveInvoiceStatus } from '../../lib/activity'
import {
  applyPaymentToOpenInvoices,
  markInvoicePaidInSupabase,
  pushInvoiceToSupabase,
  syncBillingFromSupabase,
} from '../../lib/supabaseBilling'
import { syncAdminDirectoryFromSupabase } from '../../lib/supabaseDirectory'

type Panel = 'none' | 'invoice' | 'payment'
type ListTab = 'invoices' | 'payments'
type StatusFilter = 'all' | 'open' | 'overdue' | 'paid' | 'draft'

export function AdminBilling() {
  const households = useContentStore((s) => s.households)
  const invoices = useContentStore((s) => s.invoices)
  const transactions = useContentStore((s) => s.transactions)
  const [searchParams] = useSearchParams()
  const preselect = searchParams.get('household') || ''

  const [panel, setPanel] = useState<Panel>(preselect ? 'invoice' : 'none')
  const [tab, setTab] = useState<ListTab>('invoices')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [invoiceHouseholdId, setInvoiceHouseholdId] = useState(preselect)
  const [paymentHouseholdId, setPaymentHouseholdId] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    void syncAdminDirectoryFromSupabase()
  }, [])

  useEffect(() => {
    if (!preselect) return
    setInvoiceHouseholdId(preselect)
    setPanel('invoice')
    setTab('invoices')
  }, [preselect])

  const totals = useMemo(() => {
    const open = invoices.filter((i) => {
      const s = effectiveInvoiceStatus(i)
      return s === 'open' || s === 'overdue'
    })
    const paid = invoices.filter((i) => i.status === 'paid')
    return {
      openCount: open.length,
      openAmount: open.reduce((s, i) => s + i.amount, 0),
      paidAmount: paid.reduce((s, i) => s + i.amount, 0),
      txnCount: transactions.length,
    }
  }, [invoices, transactions])

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invoices
      .slice()
      .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt))
      .filter((inv) => {
        const status = effectiveInvoiceStatus(inv)
        if (statusFilter !== 'all' && status !== statusFilter) return false
        if (!q) return true
        const hh = households.find((h) => h.id === inv.householdId)
        return (
          inv.title.toLowerCase().includes(q) ||
          inv.description.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          hh?.familyName.toLowerCase().includes(q) ||
          hh?.primaryName.toLowerCase().includes(q) ||
          hh?.email.toLowerCase().includes(q) ||
          hh?.phone.toLowerCase().includes(q) ||
          hh?.members.some((m) => m.name.toLowerCase().includes(q))
        )
      })
  }, [invoices, households, query, statusFilter])

  const filteredTxns = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .filter((txn) => {
        if (!q) return true
        const hh = households.find((h) => h.id === txn.householdId)
        return (
          txn.note?.toLowerCase().includes(q) ||
          txn.reference?.toLowerCase().includes(q) ||
          hh?.familyName.toLowerCase().includes(q) ||
          hh?.primaryName.toLowerCase().includes(q) ||
          hh?.email.toLowerCase().includes(q) ||
          hh?.members.some((m) => m.name.toLowerCase().includes(q))
        )
      })
  }, [transactions, households, query])

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: invoices.length,
      open: 0,
      overdue: 0,
      paid: 0,
      draft: 0,
    }
    for (const inv of invoices) {
      const s = effectiveInvoiceStatus(inv)
      if (s === 'open' || s === 'overdue' || s === 'paid' || s === 'draft') counts[s] += 1
    }
    return counts
  }, [invoices])

  const selectedInvoiceHousehold = households.find((h) => h.id === invoiceHouseholdId)
  const selectedPaymentHousehold = households.find((h) => h.id === paymentHouseholdId)

  function closePanel() {
    setPanel('none')
    setInvoiceHouseholdId('')
    setPaymentHouseholdId('')
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!invoiceHouseholdId) return
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setFlash('')
    const result = await pushInvoiceToSupabase({
      householdId: invoiceHouseholdId,
      title: String(fd.get('title')),
      description: String(fd.get('description')),
      type: String(fd.get('type')) as InvoiceType,
      amount: Number(fd.get('amount')),
      status: String(fd.get('status')) as InvoiceStatus,
      dueDate: new Date(String(fd.get('dueDate'))).toISOString(),
      issuedAt: new Date(String(fd.get('issuedAt'))).toISOString(),
    })
    setBusy(false)
    if (!result.ok) {
      setFlash(result.error || 'Could not create invoice')
      return
    }
    await syncBillingFromSupabase()
    setFlash('Invoice created — the household will see the balance in their portal.')
    closePanel()
    setTab('invoices')
    setStatusFilter('open')
  }

  async function onLogPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!paymentHouseholdId) return
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setFlash('')
    const result = await applyPaymentToOpenInvoices(
      paymentHouseholdId,
      Number(fd.get('amount')),
      String(fd.get('method')) as PaymentMethod,
      String(fd.get('reference') || ''),
      String(fd.get('note') || ''),
    )
    setBusy(false)
    if (!result.ok) {
      setFlash(result.error || 'Could not log payment')
      return
    }
    await syncBillingFromSupabase()
    setFlash('Payment saved — balance updated for the household.')
    closePanel()
    setTab('payments')
  }

  return (
    <div className="pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl text-white sm:text-4xl">Billing</h1>
          <p className="mt-1.5 text-sm text-mist/70 sm:text-base">
            Create invoices, collect payments, keep a clean record per family.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:grid-cols-none">
          <Button
            variant="ghost"
            className="justify-center"
            disabled={busy}
            onClick={() => {
              setBusy(true)
              void syncAdminDirectoryFromSupabase().finally(() => setBusy(false))
            }}
          >
            {busy ? 'Syncing…' : 'Refresh'}
          </Button>
          <Button
            variant="ghost"
            className="justify-center"
            onClick={() => {
              setPanel('payment')
              setPayingId(null)
            }}
          >
            <Receipt className="h-4 w-4" /> Log payment
          </Button>
          <Button
            className="col-span-2 justify-center sm:col-auto"
            onClick={() => {
              setPanel('invoice')
              setPayingId(null)
            }}
          >
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        </div>
      </div>

      {flash && (
        <p className="mt-4 rounded-xl border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-marigold">
          {flash}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[
          { label: 'Open', value: totals.openCount, hint: 'Need attention' },
          { label: 'Amount due', value: `$${totals.openAmount.toLocaleString()}`, hint: 'Outstanding' },
          { label: 'Collected', value: `$${totals.paidAmount.toLocaleString()}`, hint: 'Paid invoices' },
          { label: 'Payments', value: totals.txnCount, hint: 'Logged' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 sm:rounded-2xl sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-mist/55 sm:text-xs sm:tracking-wider">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl text-white sm:text-3xl">{stat.value}</p>
            <p className="mt-0.5 hidden text-xs text-mist/40 sm:block">{stat.hint}</p>
          </div>
        ))}
      </div>

      {panel !== 'none' && (
        <div className="mt-5 rounded-2xl border border-marigold/25 bg-white/[0.04] p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-marigold">
                {panel === 'invoice' ? 'New invoice' : 'Log payment'}
              </p>
              <p className="mt-1 text-sm text-mist/60">
                {panel === 'invoice'
                  ? 'Bill a household with a clear reason and due date.'
                  : 'Record money received (cash, check, card, PayPal).'}
              </p>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-lg p-2 text-mist/60 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {panel === 'invoice' ? (
            <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-mist/55">Household</label>
                <HouseholdPicker
                  households={households}
                  value={invoiceHouseholdId}
                  onChange={setInvoiceHouseholdId}
                  required
                />
                {selectedInvoiceHousehold && (
                  <p className="mt-2 text-xs text-mist/50">
                    {selectedInvoiceHousehold.email} · {selectedInvoiceHousehold.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Title</label>
                <input name="title" className="admin-field" placeholder="e.g. 2026 Annual membership" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Amount ($)</label>
                <input name="amount" type="number" min="1" step="0.01" className="admin-field" placeholder="0.00" required />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-mist/55">Reason</label>
                <textarea
                  name="description"
                  className="admin-field"
                  rows={2}
                  placeholder="What this invoice is for"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Type</label>
                <select name="type" className="admin-field" defaultValue="membership">
                  <option value="membership">Membership / annual</option>
                  <option value="donation">Donation</option>
                  <option value="event">Event</option>
                  <option value="expense">Expense</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Status</label>
                <select name="status" className="admin-field" defaultValue="open">
                  <option value="open">Open — amount owed</option>
                  <option value="draft">Draft</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Already paid</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Issued</label>
                <input
                  name="issuedAt"
                  type="datetime-local"
                  className="admin-field"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Due</label>
                <input name="dueDate" type="datetime-local" className="admin-field" required />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row">
                <Button type="button" variant="ghost" className="justify-center" onClick={closePanel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="justify-center sm:min-w-[10rem]"
                  disabled={busy || !invoiceHouseholdId}
                >
                  {busy ? 'Saving…' : 'Save invoice'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={onLogPayment} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-mist/55">Who paid?</label>
                <HouseholdPicker
                  households={households}
                  value={paymentHouseholdId}
                  onChange={setPaymentHouseholdId}
                  name="paymentHouseholdId"
                  required
                />
                {selectedPaymentHousehold && (
                  <p className="mt-2 text-xs text-mist/50">
                    {selectedPaymentHousehold.members.map((m) => m.name).join(', ') || 'No members listed'}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Amount ($)</label>
                <input name="amount" type="number" min="0.01" step="0.01" className="admin-field" placeholder="0.00" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Method</label>
                <select name="method" className="admin-field" defaultValue="cash">
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Proof / reference</label>
                <input name="reference" className="admin-field" placeholder="Check #, receipt ID…" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist/55">Note</label>
                <input name="note" className="admin-field" placeholder="What this payment was for" />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row">
                <Button type="button" variant="ghost" className="justify-center" onClick={closePanel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="justify-center sm:min-w-[10rem]"
                  disabled={busy || !paymentHouseholdId}
                >
                  {busy ? 'Saving…' : 'Save payment'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {(
          [
            ['invoices', 'Invoices', filteredInvoices.length],
            ['payments', 'Payments', filteredTxns.length],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              tab === id ? 'bg-saffron text-night' : 'text-mist/70 hover:bg-white/5 hover:text-white',
            )}
          >
            {label}
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[11px]',
                tab === id ? 'bg-night/15 text-night' : 'bg-white/10 text-mist/60',
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/40" />
        <input
          className="admin-field pl-10"
          placeholder={
            tab === 'invoices'
              ? 'Search invoice #, family, person, reason…'
              : 'Search payment, family, reference…'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {tab === 'invoices' && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              ['all', 'All'],
              ['open', 'Open'],
              ['overdue', 'Overdue'],
              ['paid', 'Paid'],
              ['draft', 'Draft'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs transition',
                statusFilter === id
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-mist/60 hover:bg-white/10 hover:text-mist',
              )}
            >
              {label}
              <span className="ml-1.5 opacity-60">{statusCounts[id]}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'invoices' ? (
        <div className="mt-4 space-y-3">
          {filteredInvoices.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-mist/55">
              No invoices match this view.
            </p>
          )}
          {filteredInvoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              paying={payingId === inv.id}
              onStartPay={() => {
                setPayingId(inv.id)
                setPanel('none')
              }}
              onCancelPay={() => setPayingId(null)}
              onMarkPaid={(method, reference, note) => {
                void (async () => {
                  setBusy(true)
                  const result = await markInvoicePaidInSupabase(inv.id, method, reference, note)
                  setBusy(false)
                  if (!result.ok) {
                    setFlash(result.error || 'Could not mark paid')
                    return
                  }
                  setFlash('Marked paid — household balance updated.')
                  setPayingId(null)
                })()
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filteredTxns.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-mist/55">
              No payments match this search.
            </p>
          )}
          {filteredTxns.map((txn) => {
            const hh = households.find((h) => h.id === txn.householdId)
            return (
              <div
                key={txn.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium tabular-nums text-white">
                      ${txn.amount.toLocaleString()}
                      <span className="ml-2 text-sm font-normal capitalize text-mist/55">{txn.method}</span>
                      {txn.status === 'pending' ? (
                        <span className="ml-2 text-xs font-normal text-marigold">Pending review</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-mist/60">
                      {hh?.familyName || 'Unknown family'}
                      {hh?.primaryName ? ` · ${hh.primaryName}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-mist/45">{formatDate(txn.createdAt)}</p>
                </div>
                {(txn.reference || txn.note) && (
                  <p className="mt-2 text-xs leading-relaxed text-mist/45">
                    {txn.reference ? `Ref: ${txn.reference}` : ''}
                    {txn.reference && txn.note ? ' · ' : ''}
                    {txn.note}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InvoiceCard({
  invoice,
  paying,
  onStartPay,
  onCancelPay,
  onMarkPaid,
}: {
  invoice: Invoice
  paying: boolean
  onStartPay: () => void
  onCancelPay: () => void
  onMarkPaid: (method: PaymentMethod, reference?: string, note?: string) => void
}) {
  const households = useContentStore((s) => s.households)
  const hh = households.find((h) => h.id === invoice.householdId)
  const status = effectiveInvoiceStatus(invoice)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">{invoice.title}</p>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-sm text-mist/60">
            {invoice.invoiceNumber}
            {hh ? ` · ${hh.familyName} · ${hh.primaryName}` : ''}
          </p>
          <p className="mt-2 font-display text-2xl text-white">${invoice.amount.toLocaleString()}</p>
          {invoice.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-mist/55">{invoice.description}</p>
          )}
          <p className="mt-2 text-xs text-mist/40">
            Issued {formatDate(invoice.issuedAt)} · Due {formatDate(invoice.dueDate)}
            {invoice.paidAt ? ` · Paid ${formatDate(invoice.paidAt)}` : ''}
          </p>
        </div>
        {status !== 'paid' && !paying && (
          <Button size="sm" className="w-full shrink-0 sm:w-auto" onClick={onStartPay}>
            <CheckCircle2 className="h-4 w-4" /> Mark paid
          </Button>
        )}
      </div>

      {paying && (
        <form
          className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            onMarkPaid(
              String(fd.get('method')) as PaymentMethod,
              String(fd.get('reference') || '') || undefined,
              String(fd.get('note') || '') || undefined,
            )
          }}
        >
          <select name="method" className="admin-field" defaultValue="cash">
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="card">Card</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </select>
          <input name="reference" className="admin-field" placeholder="Proof / receipt #" />
          <input name="note" className="admin-field sm:col-span-2 lg:col-span-1" placeholder="Payment note" />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button type="submit" size="sm" className="flex-1 justify-center">
              Confirm
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancelPay}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === 'paid'
      ? 'bg-marigold/15 text-marigold'
      : status === 'overdue'
        ? 'bg-lotus/20 text-[#e8c4a0]'
        : status === 'draft'
          ? 'bg-white/10 text-mist/60'
          : 'bg-temple/40 text-mist'

  return (
    <span className={cn('rounded-md px-2 py-0.5 text-[11px] capitalize', styles)}>{status}</span>
  )
}
