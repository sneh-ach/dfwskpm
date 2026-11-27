import type { Household, Invoice, MemberRequest, PaymentTransaction } from '../types'

export type ActivityItem = {
  id: string
  at: string
  title: string
  detail: string
  tone: 'info' | 'money' | 'alert' | 'ok'
}

/** Build a household activity timeline from synced temple records. */
export function buildHouseholdActivity(input: {
  household?: Household
  invoices: Invoice[]
  transactions: PaymentTransaction[]
  requests: MemberRequest[]
}): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const inv of input.invoices) {
    items.push({
      id: `inv-${inv.id}`,
      at: inv.issuedAt,
      title: `Invoice ${inv.invoiceNumber}`,
      detail: `${inv.title} · $${inv.amount.toLocaleString()} · ${inv.status}`,
      tone: inv.status === 'overdue' ? 'alert' : inv.status === 'paid' ? 'ok' : 'money',
    })
    if (inv.paidAt) {
      items.push({
        id: `inv-paid-${inv.id}`,
        at: inv.paidAt,
        title: 'Invoice marked paid',
        detail: `${inv.invoiceNumber} · $${inv.amount.toLocaleString()}`,
        tone: 'ok',
      })
    }
  }

  for (const txn of input.transactions) {
    items.push({
      id: `txn-${txn.id}`,
      at: txn.createdAt,
      title: 'Payment recorded',
      detail: `$${txn.amount.toLocaleString()} · ${txn.method}${txn.reference ? ` · ${txn.reference}` : ''}${txn.note ? ` · ${txn.note}` : ''}`,
      tone: 'money',
    })
  }

  for (const req of input.requests) {
    items.push({
      id: `req-${req.id}`,
      at: req.createdAt,
      title: req.status === 'resolved' ? 'Request resolved' : 'Request sent to temple',
      detail: `${req.subject}`,
      tone: req.status === 'resolved' ? 'ok' : 'info',
    })
  }

  if (input.household) {
    items.push({
      id: `hh-${input.household.id}-created`,
      at: input.household.createdAt,
      title: 'Household registered',
      detail: `${input.household.familyName} family`,
      tone: 'info',
    })
    if (input.household.updatedAt !== input.household.createdAt) {
      items.push({
        id: `hh-${input.household.id}-updated`,
        at: input.household.updatedAt,
        title: 'Household details updated',
        detail: 'Address, contact, or family members changed',
        tone: 'info',
      })
    }
  }

  return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 25)
}

export function effectiveInvoiceStatus(inv: Invoice): Invoice['status'] {
  if (inv.status === 'open' && +new Date(inv.dueDate) < Date.now()) return 'overdue'
  return inv.status
}
