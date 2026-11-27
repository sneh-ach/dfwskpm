import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Search,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useContentStore } from '../../store/contentStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { buildHouseholdActivity, effectiveInvoiceStatus } from '../../lib/activity'
import { buildEmailVars, openMailto, renderTemplate } from '../../lib/email'
import { cn, formatDate } from '../../lib/utils'

type DetailTab = 'overview' | 'family' | 'billing' | 'activity' | 'email'

type LookupPerson = {
  key: string
  name: string
  relation: string
  photo?: string
  age?: number
  isPrimary?: boolean
  householdId: string
  email: string
  phone: string
  familyName: string
  city: string
  state: string
  status: string
  needsReview?: boolean
  userId?: string
}

export function AdminMemberLookup() {
  const households = useContentStore((s) => s.households)
  const invoices = useContentStore((s) => s.invoices)
  const transactions = useContentStore((s) => s.transactions)
  const requests = useContentStore((s) => s.memberRequests) || []
  const templates = useContentStore((s) => s.emailTemplates) || []
  const settings = useContentStore((s) => s.settings)
  const logEmail = useContentStore((s) => s.logEmail)
  const users = useAuthStore((s) => s.users)
  const currentUser = useAuthStore((s) => s.currentUser)
  const [searchParams, setSearchParams] = useSearchParams()
  const preselect = searchParams.get('hh') || ''

  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(
    preselect ? `hh:${preselect}` : null,
  )
  const [tab, setTab] = useState<DetailTab>('overview')
  const [tplId, setTplId] = useState(templates[0]?.id || '')
  const [customMessage, setCustomMessage] = useState('')

  const people = useMemo(() => {
    const list: LookupPerson[] = []
    for (const hh of households) {
      const linked = users.find((u) => u.householdId === hh.id && u.role === 'member')
      if (!hh.members.length) {
        list.push({
          key: `hh:${hh.id}`,
          name: hh.primaryName,
          relation: 'Primary',
          photo: hh.photo || linked?.avatar,
          isPrimary: true,
          householdId: hh.id,
          email: hh.email,
          phone: hh.phone,
          familyName: hh.familyName,
          city: hh.city,
          state: hh.state,
          status: hh.status,
          needsReview: hh.needsReview,
          userId: linked?.id,
        })
        continue
      }
      for (const m of hh.members) {
        list.push({
          key: `${hh.id}:${m.id}`,
          name: m.name,
          relation: m.relation,
          photo: m.photo || (m.isPrimary ? hh.photo || linked?.avatar : undefined),
          age: m.age,
          isPrimary: m.isPrimary,
          householdId: hh.id,
          email: hh.email,
          phone: hh.phone,
          familyName: hh.familyName,
          city: hh.city,
          state: hh.state,
          status: hh.status,
          needsReview: hh.needsReview,
          userId: m.isPrimary ? linked?.id : undefined,
        })
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [households, users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return people
    return people.filter((p) =>
      [p.name, p.familyName, p.email, p.phone, p.relation, p.city, p.state]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [people, query])

  const selected =
    people.find((p) => p.key === selectedKey) ||
    (preselect ? people.find((p) => p.householdId === preselect) : undefined) ||
    null

  const household = selected
    ? households.find((h) => h.id === selected.householdId)
    : undefined

  const hhInvoices = invoices
    .filter((i) => i.householdId === household?.id)
    .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt))
  const hhTxns = transactions
    .filter((t) => t.householdId === household?.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  const hhRequests = requests.filter((r) => r.householdId === household?.id)
  const activity = buildHouseholdActivity({
    household,
    invoices: hhInvoices,
    transactions: hhTxns,
    requests: hhRequests,
  })

  const openBalance = hhInvoices
    .filter((i) => {
      const status = effectiveInvoiceStatus(i)
      return status === 'open' || status === 'overdue'
    })
    .reduce((s, i) => s + i.amount, 0)

  const linkedUser = users.find((u) => u.householdId === household?.id && u.role === 'member')

  function selectPerson(p: LookupPerson) {
    setSelectedKey(p.key)
    setTab('overview')
    setSearchParams(p.householdId ? { hh: p.householdId } : {})
  }

  function sendEmail(mode: 'mailto' | 'copy') {
    if (!household || !selected) return
    const tpl = templates.find((t) => t.id === tplId) || templates[0]
    if (!tpl) return
    const openInv = hhInvoices.find((i) => {
      const status = effectiveInvoiceStatus(i)
      return status === 'open' || status === 'overdue'
    })
    const vars = buildEmailVars({
      settings,
      household,
      name: selected.name,
      message: customMessage,
      invoiceTitle: openInv?.title,
      invoiceAmount: openInv ? `$${openInv.amount.toLocaleString()}` : '',
      invoiceDue: openInv ? formatDate(openInv.dueDate, { weekday: undefined }) : '',
    })
    const rendered = renderTemplate(tpl, vars)
    logEmail({
      to: household.email,
      toName: selected.name,
      householdId: household.id,
      templateId: tpl.id,
      subject: rendered.subject,
      body: rendered.body,
      status: mode === 'mailto' ? 'opened_mail' : 'copied',
      createdBy: currentUser?.email,
    })
    if (mode === 'mailto') {
      openMailto(household.email, rendered.subject, rendered.body)
    } else {
      void navigator.clipboard.writeText(
        `To: ${household.email}\nSubject: ${rendered.subject}\n\n${rendered.body}`,
      )
      alert('Email draft copied — paste into Gmail.')
    }
  }

  const showDetail = Boolean(selected && household)

  return (
    <div className="pb-2">
      <div className={showDetail ? 'hidden lg:block' : ''}>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Member lookup</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-mist/70 sm:text-base">
          Search any person — see photo, household, billing history, activity, and email them from a
          template.
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/40" />
          <input
            className="admin-field pl-10"
            placeholder="Search name, family, email, phone, city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <p className="mt-3 text-xs text-mist/45">
          {filtered.length} people · {households.length} households
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className={showDetail ? 'hidden space-y-2 lg:block' : 'space-y-2'}>
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-mist/55">
              No members match.
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => selectPerson(p)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                selected?.key === p.key
                  ? 'border-saffron/50 bg-saffron/10'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20',
              )}
            >
              <Avatar name={p.name} src={p.photo} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{p.name}</p>
                  {p.needsReview && (
                    <span className="rounded bg-marigold/20 px-1.5 py-0.5 text-[10px] text-marigold">
                      New
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-mist/55">
                  {p.familyName} · {p.relation}
                  {p.age ? ` · ${p.age}` : ''}
                </p>
                <p className="truncate text-xs text-mist/40">
                  {p.city}, {p.state}
                </p>
              </div>
            </button>
          ))}
        </div>

        {showDetail && household && selected ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <button
              type="button"
              className="mb-3 text-sm text-mist/70 lg:hidden"
              onClick={() => {
                setSelectedKey(null)
                setSearchParams({})
              }}
            >
              ← All members
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <Avatar
                  name={selected.name}
                  src={selected.photo || household.photo || linkedUser?.avatar}
                  size="xl"
                />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-marigold">Member</p>
                  <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">{selected.name}</h2>
                  <p className="text-sm text-mist/65">
                    {household.familyName} family · {selected.relation}
                    {selected.age ? ` · age ${selected.age}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-mist/45">
                    {linkedUser ? `Login: ${linkedUser.email}` : 'No portal login linked'}
                    {household.needsReview ? ' · Needs review' : ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Link to={`/admin/billing?household=${household.id}`}>
                  <Button size="sm" className="w-full justify-center sm:w-auto">
                    <Receipt className="h-4 w-4" /> Invoice
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-center"
                  onClick={() => setTab('email')}
                >
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Balance due', `$${openBalance.toLocaleString()}`],
                ['Invoices', String(hhInvoices.length)],
                ['Payments', String(hhTxns.length)],
                ['Members', String(household.members.length)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-mist/50">{label}</p>
                  <p className="mt-0.5 font-display text-xl text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {(
                [
                  ['overview', 'Overview'],
                  ['family', 'Family'],
                  ['billing', 'Billing'],
                  ['activity', 'Activity'],
                  ['email', 'Email'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
                    tab === id ? 'bg-saffron text-night' : 'text-mist/65 hover:text-white',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tab === 'overview' && (
                <div className="space-y-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Info icon={Mail} label="Email" value={household.email} />
                    <Info icon={Phone} label="Phone" value={household.phone} />
                    <Info
                      icon={MapPin}
                      label="Address"
                      value={`${household.addressLine1}${household.addressLine2 ? `, ${household.addressLine2}` : ''}, ${household.city}, ${household.state} ${household.zip}`}
                      className="sm:col-span-2"
                    />
                    <Info icon={Users} label="Status" value={household.status} />
                    <Info
                      icon={CreditCard}
                      label="Directory"
                      value={`${household.source || '—'} · updated ${formatDate(household.updatedAt, { weekday: undefined })}`}
                    />
                  </div>
                  {household.notes && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wider text-mist/50">Staff notes</p>
                      <p className="mt-1 text-mist/75">{household.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'family' && (
                <div className="space-y-2">
                  {household.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <Avatar name={m.name} src={m.photo} size="md" />
                      <div className="min-w-0">
                        <p className="font-medium text-white">{m.name}</p>
                        <p className="text-xs text-mist/55">
                          {m.relation}
                          {m.age ? ` · age ${m.age}` : ''}
                          {m.isPrimary ? ' · primary' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/admin/households"
                    className="mt-2 inline-block text-sm text-marigold hover:underline"
                  >
                    Edit household record →
                  </Link>
                </div>
              )}

              {tab === 'billing' && (
                <div className="space-y-4">
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-mist/70">
                    Amount owed:{' '}
                    <span className="font-medium tabular-nums text-white">
                      ${openBalance.toLocaleString()}
                    </span>
                  </p>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-mist/50">Invoices</p>
                    {hhInvoices.length === 0 && (
                      <p className="text-sm text-mist/55">No invoices yet.</p>
                    )}
                    <div className="space-y-2">
                      {hhInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm"
                        >
                          <div className="flex justify-between gap-2">
                            <p className="text-white">{inv.title}</p>
                            <p className="shrink-0 tabular-nums text-white">
                              ${inv.amount.toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-0.5 text-xs text-mist/50">
                            {inv.invoiceNumber} · {effectiveInvoiceStatus(inv)} · due{' '}
                            {formatDate(inv.dueDate, { weekday: undefined })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-mist/50">Payments</p>
                    {hhTxns.length === 0 && (
                      <p className="text-sm text-mist/55">No payments logged.</p>
                    )}
                    <div className="space-y-1.5">
                      {hhTxns.map((t) => (
                        <p key={t.id} className="text-sm text-mist/65">
                          ${t.amount.toLocaleString()} · {t.method}
                          {t.status === 'pending' ? ' · pending review' : ''} ·{' '}
                          {formatDate(t.createdAt, { weekday: undefined })}
                          {t.reference ? ` · ${t.reference}` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-mist/50">Donations</p>
                    {household.donations.length === 0 && (
                      <p className="text-sm text-mist/55">No donation history.</p>
                    )}
                    {household.donations.map((d) => (
                      <p key={d.id} className="text-sm text-mist/65">
                        ${d.amount.toLocaleString()} · {d.method} ·{' '}
                        {formatDate(d.date, { weekday: undefined })}
                        {d.note ? ` · ${d.note}` : ''}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'activity' && (
                <div className="space-y-2">
                  {activity.length === 0 && (
                    <p className="text-sm text-mist/55">No activity yet.</p>
                  )}
                  {activity.slice(0, 40).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex justify-between gap-2">
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="shrink-0 text-[11px] text-mist/40">
                          {formatDate(item.at, { weekday: undefined })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-mist/55">{item.detail}</p>
                    </div>
                  ))}
                  {hhRequests.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-2 text-xs uppercase tracking-wider text-mist/50">Requests</p>
                      {hhRequests.map((r) => (
                        <div key={r.id} className="mb-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
                          <p className="text-white">
                            {r.subject} · {r.status}
                          </p>
                          <p className="mt-1 text-mist/55">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'email' && (
                <div className="space-y-3">
                  <p className="text-sm text-mist/65">
                    Opens your Gmail / mail app with a filled template (from{' '}
                    {settings.emailFrom || settings.email}). Full auto-send can connect later via
                    Gmail API.
                  </p>
                  <label className="block text-sm">
                    <span className="mb-1 block text-mist/55">Template</span>
                    <select
                      className="admin-field"
                      value={tplId}
                      onChange={(e) => setTplId(e.target.value)}
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-mist/55">Extra message (for general template)</span>
                    <textarea
                      className="admin-field"
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Optional note to include…"
                    />
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="justify-center" onClick={() => sendEmail('mailto')}>
                      <Mail className="h-4 w-4" /> Open in Gmail / Mail
                    </Button>
                    <Button variant="ghost" className="justify-center" onClick={() => sendEmail('copy')}>
                      Copy draft
                    </Button>
                    <Link to="/admin/email" className="sm:ml-auto">
                      <Button variant="ghost" className="w-full justify-center sm:w-auto">
                        Manage templates
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="hidden rounded-2xl border border-dashed border-white/15 p-10 text-mist/55 lg:block">
            Select a member to see their full record.
          </p>
        )}
      </div>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Mail
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5', className)}>
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-mist/50">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}
