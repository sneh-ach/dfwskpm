import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Receipt, Trash2, Users } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import { useAuthStore } from '../../store/authStore'
import type { Household } from '../../types'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { formatDate, uid } from '../../lib/utils'

export function AdminHouseholds() {
  const households = useContentStore((s) => s.households)
  const upsertHousehold = useContentStore((s) => s.upsertHousehold)
  const deleteHousehold = useContentStore((s) => s.deleteHousehold)
  const addDonation = useContentStore((s) => s.addDonation)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'review' | 'active' | 'inactive'>('all')
  const invoices = useContentStore((s) => s.invoices)
  const transactions = useContentStore((s) => s.transactions)
  const markHouseholdReviewed = useContentStore((s) => s.markHouseholdReviewed)
  const users = useAuthStore((s) => s.users)
  const needsReviewCount = households.filter((h) => h.needsReview).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return households.filter((h) => {
      if (filter === 'review' && !h.needsReview) return false
      if (filter === 'active' && h.status !== 'active') return false
      if (filter === 'inactive' && h.status !== 'inactive') return false
      if (!q) return true
      const blob = [
        h.familyName,
        h.primaryName,
        h.email,
        h.phone,
        h.addressLine1,
        h.city,
        h.zip,
        h.notes || '',
        ...h.members.map((m) => m.name),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [households, query, filter])

  const selected = households.find((h) => h.id === selectedId) ?? null

  const stats = useMemo(() => {
    const active = households.filter((h) => h.status === 'active')
    const people = households.reduce((sum, h) => sum + h.members.length, 0)
    const donated = households.reduce(
      (sum, h) => sum + h.donations.reduce((s, d) => s + d.amount, 0),
      0,
    )
    return { families: households.length, active: active.length, people, donated }
  }, [households])

  function onAddHousehold(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = upsertHousehold({
      familyName: String(fd.get('familyName') || ''),
      primaryName: String(fd.get('primaryName') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      addressLine1: String(fd.get('addressLine1') || ''),
      addressLine2: String(fd.get('addressLine2') || ''),
      city: String(fd.get('city') || ''),
      state: String(fd.get('state') || 'TX'),
      zip: String(fd.get('zip') || ''),
      members: [
        {
          id: uid('hm'),
          name: String(fd.get('primaryName') || ''),
          relation: 'Head of household',
          isPrimary: true,
        },
      ],
      donations: [],
      notes: String(fd.get('notes') || ''),
      status: 'active',
      source: 'admin',
      needsReview: false,
    })
    setSelectedId(id)
    setAdding(false)
  }

  function onAddDonation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    const fd = new FormData(e.currentTarget)
    addDonation(selected.id, {
      amount: Number(fd.get('amount') || 0),
      date: new Date(String(fd.get('date') || new Date().toISOString())).toISOString(),
      method: String(fd.get('method') || 'Cash'),
      note: String(fd.get('note') || ''),
    })
    e.currentTarget.reset()
  }

  function saveHousehold(patch: Partial<Household>) {
    if (!selected) return
    upsertHousehold({ ...selected, ...patch })
  }

  const showDetailMobile = Boolean(selectedId)

  return (
    <div className="pb-2">
      <div className={showDetailMobile ? 'hidden lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-3' : 'flex flex-wrap items-center justify-between gap-3'}>
        <div>
          <h1 className="font-display text-3xl text-white sm:text-4xl">Households</h1>
          <p className="mt-1.5 text-sm text-mist/70 sm:mt-2 sm:text-base">
            Family directory — addresses, members, and donation history in one place.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add family
        </Button>
      </div>

      <div className={showDetailMobile ? 'mt-6 hidden gap-3 sm:grid-cols-2 xl:grid-cols-5 lg:grid' : 'mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 xl:grid-cols-5'}>
        {[
          ['Families', stats.families],
          ['Needs review', needsReviewCount],
          ['Active', stats.active],
          ['People', stats.people],
          ['Donations tracked', `$${stats.donated.toLocaleString()}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-mist/60">{label}</p>
            <p className="mt-1 font-display text-3xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={onAddHousehold} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <input name="familyName" className="admin-field" placeholder="Family name" required />
          <input name="primaryName" className="admin-field" placeholder="Primary contact" required />
          <input name="email" type="email" className="admin-field" placeholder="Email" required />
          <input name="phone" className="admin-field" placeholder="Phone" required />
          <input name="addressLine1" className="admin-field md:col-span-2" placeholder="Address line 1" required />
          <input name="addressLine2" className="admin-field md:col-span-2" placeholder="Address line 2" />
          <input name="city" className="admin-field" placeholder="City" required />
          <input name="state" className="admin-field" placeholder="State" defaultValue="TX" required />
          <input name="zip" className="admin-field" placeholder="ZIP" required />
          <input name="notes" className="admin-field" placeholder="Admin notes" />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save household</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className={showDetailMobile ? 'mt-6 hidden flex-wrap gap-2 lg:flex' : 'mt-5 flex flex-wrap gap-2 sm:mt-6'}>
        {(
          [
            ['all', 'All'],
            ['review', `Needs review (${needsReviewCount})`],
            ['active', 'Active'],
            ['inactive', 'Inactive'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              filter === id ? 'bg-saffron text-night' : 'bg-white/5 text-mist'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={showDetailMobile ? 'hidden lg:block' : ''}>
        <input
          className="admin-field mt-4"
          placeholder="Search families, members, address, phone, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className={showDetailMobile ? 'hidden space-y-2 lg:block' : 'space-y-2'}>
          {filtered.map((hh) => (
            <button
              key={hh.id}
              type="button"
              onClick={() => setSelectedId(hh.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition sm:p-4 ${
                selectedId === hh.id
                  ? 'border-saffron/50 bg-saffron/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <Avatar
                name={hh.primaryName}
                src={hh.photo || hh.members.find((m) => m.isPrimary)?.photo}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-white">{hh.familyName} family</p>
                  {hh.needsReview && (
                    <span className="rounded-full bg-marigold/20 px-2 py-0.5 text-[10px] text-marigold">New</span>
                  )}
                </div>
                <p className="truncate text-sm text-mist/60">
                  {hh.primaryName} · {hh.members.length} members
                </p>
                <p className="mt-1 truncate text-xs text-mist/45">
                  {hh.city}, {hh.state}
                  {hh.source ? ` · via ${hh.source}` : ''}
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-mist/55">
              No families match.
            </p>
          )}
        </div>

        {selected ? (
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4 sm:space-y-6 sm:p-5">
            <button
              type="button"
              className="mb-1 inline-flex items-center gap-1.5 text-sm text-mist/70 lg:hidden"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="h-4 w-4" /> All families
            </button>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-marigold">Household</p>
                <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">{selected.familyName}</h2>
                <p className="text-mist/70">{selected.primaryName}</p>
                {(() => {
                  const linked = users.find((u) => u.householdId === selected.id)
                  return (
                    <p className="mt-2 text-xs text-mist/50">
                      {linked
                        ? `Member login linked · ${linked.email}`
                        : 'No member login linked yet (admin-added family)'}
                      {' · '}Updated {formatDate(selected.updatedAt, { weekday: undefined })}
                    </p>
                  )
                })()}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {selected.needsReview && (
                  <Button size="sm" className="col-span-2 justify-center sm:col-auto" onClick={() => markHouseholdReviewed(selected.id)}>
                    Mark reviewed
                  </Button>
                )}
                <Link to={`/admin/lookup?hh=${selected.id}`} className="contents sm:block">
                  <Button size="sm" variant="ghost" className="w-full justify-center sm:w-auto">
                    Lookup
                  </Button>
                </Link>
                <Link to={`/admin/billing?household=${selected.id}`} className="contents sm:block">
                  <Button size="sm" className="w-full justify-center sm:w-auto">
                    <Receipt className="h-4 w-4" /> Invoice
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  className="justify-center"
                  onClick={() => {
                    if (confirm('Delete this household?')) {
                      deleteHousehold(selected.id)
                      setSelectedId(null)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>

            {selected.needsReview && (
              <div className="rounded-xl border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-marigold">
                New signup awaiting review — confirm contact details, then mark reviewed.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Email" value={selected.email} onChange={(email) => saveHousehold({ email })} />
              <Field label="Phone" value={selected.phone} onChange={(phone) => saveHousehold({ phone })} />
              <Field
                label="Address"
                value={selected.addressLine1}
                onChange={(addressLine1) => saveHousehold({ addressLine1 })}
                className="md:col-span-2"
              />
              <Field label="City" value={selected.city} onChange={(city) => saveHousehold({ city })} />
              <Field label="State" value={selected.state} onChange={(state) => saveHousehold({ state })} />
              <Field label="ZIP" value={selected.zip} onChange={(zip) => saveHousehold({ zip })} />
              <label className="text-sm">
                <span className="mb-1 block text-mist/60">Status</span>
                <select
                  className="admin-field"
                  value={selected.status}
                  onChange={(e) => saveHousehold({ status: e.target.value as Household['status'] })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                <span className="mb-1 block text-mist/60">Internal notes (staff only)</span>
                <textarea
                  className="admin-field"
                  rows={3}
                  value={selected.notes || ''}
                  onChange={(e) => saveHousehold({ notes: e.target.value })}
                  placeholder="Private notes about this family…"
                />
              </label>
            </div>

            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 font-display text-xl text-white">
                <Users className="h-5 w-5 text-saffron" /> Family members ({selected.members.length})
              </h3>
              <div className="space-y-2">
                {selected.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2">
                    <Avatar name={m.name} src={m.photo || (m.isPrimary ? selected.photo : undefined)} size="sm" />
                    <div>
                      <p className="text-white">{m.name}</p>
                      <p className="text-xs text-mist/60">
                        {m.relation}
                        {m.age ? ` · age ${m.age}` : ''}
                        {m.isPrimary ? ' · primary' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  saveHousehold({
                    members: [
                      ...selected.members,
                      {
                        id: uid('hm'),
                        name: String(fd.get('name') || ''),
                        relation: String(fd.get('relation') || 'Family'),
                        age: fd.get('age') ? Number(fd.get('age')) : undefined,
                      },
                    ],
                  })
                  e.currentTarget.reset()
                }}
              >
                <input name="name" className="admin-field" placeholder="Member name" required />
                <input name="relation" className="admin-field" placeholder="Relation" required />
                <Button type="submit" size="sm" className="justify-center">
                  Add
                </Button>
              </form>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-display text-xl text-white">Invoices & payments</h3>
                <Link to={`/admin/billing?household=${selected.id}`} className="text-xs text-marigold hover:underline">
                  Open billing
                </Link>
              </div>
              <div className="mb-4 space-y-2">
                {invoices.filter((i) => i.householdId === selected.id).length === 0 && (
                  <p className="text-sm text-mist/55">No invoices yet for this family.</p>
                )}
                {invoices
                  .filter((i) => i.householdId === selected.id)
                  .map((inv) => (
                    <div key={inv.id} className="rounded-lg border border-white/10 px-3 py-2.5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white">{inv.title}</p>
                        <p className="shrink-0 font-medium text-white">${inv.amount.toLocaleString()}</p>
                      </div>
                      <p className="mt-0.5 text-mist/55">
                        {inv.invoiceNumber} · {inv.status}
                      </p>
                    </div>
                  ))}
                {transactions
                  .filter((t) => t.householdId === selected.id)
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="text-xs text-mist/50">
                      Payment ${t.amount} · {t.method} · {formatDate(t.createdAt)}
                    </div>
                  ))}
              </div>
              <h3 className="mb-3 font-display text-xl text-white">Donation history</h3>
              <div className="space-y-2">
                {selected.donations.length === 0 && (
                  <p className="text-sm text-mist/55">No donations recorded yet.</p>
                )}
                {selected.donations.map((d) => (
                  <div key={d.id} className="rounded-lg border border-white/10 px-3 py-2.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-white">${d.amount.toLocaleString()}</span>
                      <span className="text-mist/55">
                        {formatDate(d.date, { weekday: undefined })} · {d.method}
                      </span>
                    </div>
                    {d.note && <p className="mt-1 text-mist/45">{d.note}</p>}
                  </div>
                ))}
              </div>
              <form onSubmit={onAddDonation} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input name="amount" type="number" min="1" step="0.01" className="admin-field" placeholder="Amount" required />
                <input name="date" type="date" className="admin-field" required defaultValue={new Date().toISOString().slice(0, 10)} />
                <input name="method" className="admin-field" placeholder="Method" defaultValue="Cash" />
                <Button type="submit" size="sm" className="justify-center">
                  Log donation
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <p className="hidden rounded-2xl border border-dashed border-white/15 p-10 text-mist/60 lg:block">
            Select a household.
          </p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="mb-1 block text-mist/60">{label}</span>
      <input className="admin-field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
