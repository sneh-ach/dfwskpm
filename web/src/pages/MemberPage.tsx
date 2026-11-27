import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  Users,
  X,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useContentStore } from '../store/contentStore'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { AvatarUpload } from '../components/ui/AvatarUpload'
import { formatDate, formatTime, isPublic } from '../lib/memberFilters'
import { buildHouseholdActivity, effectiveInvoiceStatus } from '../lib/activity'
import { hydrateHousehold } from '../lib/supabaseHouseholds'
import type { Invoice, MemberRequestType } from '../types'

export function MemberPage() {
  const user = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const updateMyHousehold = useAuthStore((s) => s.updateMyHousehold)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const settings = useContentStore((s) => s.settings)
  const households = useContentStore((s) => s.households)
  const allInvoices = useContentStore((s) => s.invoices)
  const allTransactions = useContentStore((s) => s.transactions)
  const allRequests = useContentStore((s) => s.memberRequests) || []
  const schedule = useContentStore((s) => s.schedule)
  const markInvoicePaid = useContentStore((s) => s.markInvoicePaid)
  const addMemberRequest = useContentStore((s) => s.addMemberRequest)
  const location = useLocation()
  const navigate = useNavigate()
  const [welcomeBanner, setWelcomeBanner] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (user?.householdId) void hydrateHousehold(user.householdId)
  }, [user?.householdId])

  useEffect(() => {
    const state = location.state as { message?: string; welcome?: boolean } | null
    const msg =
      state?.message || (state?.welcome ? 'Welcome — your household is registered.' : '')
    if (!msg) return
    setWelcomeBanner(msg)
    // Clear sticky router state so the banner does not return on refresh/navigation
    navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  const household = useMemo(
    () => (user?.householdId ? households.find((h) => h.id === user.householdId) : undefined),
    [households, user?.householdId],
  )

  const invoices = useMemo(
    () =>
      allInvoices
        .filter((i) => i.householdId === user?.householdId)
        .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt)),
    [allInvoices, user?.householdId],
  )

  const transactions = useMemo(
    () =>
      allTransactions
        .filter((t) => t.householdId === user?.householdId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [allTransactions, user?.householdId],
  )

  const events = useContentStore((s) => s.events)
    .filter((e) => isPublic(e.status) && new Date(e.end) > new Date())
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 4)

  const news = useContentStore((s) => s.news)
    .filter((n) => isPublic(n.status))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3)

  const [saved, setSaved] = useState(false)
  const [familySaved, setFamilySaved] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [receipt, setReceipt] = useState<Invoice | null>(null)
  const [avatar, setAvatar] = useState(user?.avatar || household?.photo || '')
  const [tab, setTab] = useState<'overview' | 'family' | 'payments' | 'activity' | 'requests' | 'profile'>(
    'overview',
  )

  const myRequests = useMemo(
    () => allRequests.filter((r) => r.householdId === user?.householdId),
    [allRequests, user?.householdId],
  )

  const activity = useMemo(
    () =>
      buildHouseholdActivity({
        household,
        invoices,
        transactions,
        requests: myRequests,
      }),
    [household, invoices, transactions, myRequests],
  )

  const openInvoices = invoices.filter((i) => {
    const status = effectiveInvoiceStatus(i)
    return status === 'open' || status === 'overdue'
  })
  const openBalance = openInvoices.reduce((sum, i) => sum + i.amount, 0)
  const donatedTotal = household?.donations.reduce((sum, d) => sum + d.amount, 0) ?? 0
  const publicSchedule = schedule.filter((s) => isPublic(s.status)).slice(0, 3)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-night">Sign in required</h1>
        <p className="mt-3 text-slate">Open your household portal after signing in.</p>
        <Link to="/login" className="mt-6 inline-block">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    updateProfile({
      name: String(fd.get('name') || ''),
      phone: String(fd.get('phone') || ''),
      avatar: avatar || undefined,
    })
    setSaved(true)
  }

  function payInvoice(invoiceId: string) {
    markInvoicePaid(invoiceId, 'paypal', `MEMBER-${Date.now()}`)
    window.open(settings.donatePaypal, '_blank', 'noreferrer')
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'family' as const, label: 'Family' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'activity' as const, label: 'Activity' },
    { id: 'requests' as const, label: 'Requests' },
    { id: 'profile' as const, label: 'Profile' },
  ]

  return (
    <div>
      <section className="bg-ink px-4 py-7 text-white sm:py-10 md:px-6 md:py-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
            <Avatar
              name={user.name}
              src={user.avatar || household?.photo || avatar}
              size="lg"
              className="ring-marigold/30"
            />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-marigold">Household portal</p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl">Pranam, {user.name}</h1>
              <p className="mt-1 text-sm text-mist/70">
                {household
                  ? `${household.familyName} family · ${household.city}, ${household.state}`
                  : user.email}
                {openBalance > 0 ? ` · $${openBalance.toLocaleString()} due` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/donate">
              <Button size="sm">
                <Heart className="h-4 w-4" /> Donate
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-30 border-b border-ink/8 bg-white/95 backdrop-blur sm:top-[4.25rem]">
        <div className="snap-row mx-auto flex max-w-7xl gap-1 px-4 py-2 md:px-6 md:py-2.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`snap-item shrink-0 rounded-full px-3.5 py-2 text-sm transition sm:px-4 ${
                tab === t.id ? 'bg-ink text-white' : 'text-slate hover:bg-paper hover:text-night'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-6 md:py-14">
        {welcomeBanner && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm text-night sm:mb-8 sm:p-5">
            <p className="font-medium">{welcomeBanner}</p>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-night/60 hover:bg-black/5 hover:text-night"
              aria-label="Dismiss"
              onClick={() => setWelcomeBanner('')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {!household && (
          <div className="mb-6 rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm text-night sm:mb-8 sm:p-5">
            <p className="font-medium">No household is linked to this login yet.</p>
            <p className="mt-1 text-slate">
              Please{' '}
              <Link to="/signup" className="text-saffron underline">
                register your household
              </Link>{' '}
              so the temple can keep your family details, invoices, and updates in one place.
            </p>
          </div>
        )}

        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              <Stat label="Family members" value={String(household?.members.length ?? 0)} icon={Users} />
              <Stat label="Balance due" value={`$${openBalance.toLocaleString()}`} icon={CreditCard} />
              <Stat label="Donations" value={`$${donatedTotal.toLocaleString()}`} icon={Heart} />
              <Stat label="Status" value={household?.status || 'unlinked'} icon={Home} />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 sm:mt-6 sm:flex-wrap sm:overflow-visible">
              {(
                [
                  ['family', 'Update family', Users],
                  ['payments', openBalance > 0 ? 'Pay balance' : 'View payments', CreditCard],
                  ['requests', 'Send request', MessageSquare],
                  ['profile', 'Edit profile', Home],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm text-slate hover:border-saffron hover:text-night"
                >
                  <Icon className="h-3.5 w-3.5 text-saffron" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5 sm:space-y-6">
              <Panel title="What you owe" action={openBalance > 0 ? `${openInvoices.length} open` : 'All clear'}>
                {openInvoices.length === 0 ? (
                  <p className="text-sm text-slate">No open invoices right now. Thank you for staying current.</p>
                ) : (
                  <div className="space-y-3">
                    {openInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-4"
                      >
                        <div>
                          <p className="font-medium text-night">{inv.title}</p>
                          <p className="mt-1 text-sm text-slate">
                            ${inv.amount.toLocaleString()} · due {formatDate(inv.dueDate, { weekday: undefined })}
                          </p>
                          <p className="mt-1 text-xs text-slate/70">{inv.description}</p>
                        </div>
                        <Button size="sm" onClick={() => payInvoice(inv.id)}>
                          Pay online
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Upcoming at the mandir"
                action={
                  <Link to="/calendar" className="text-sm text-saffron">
                    Calendar
                  </Link>
                }
              >
                {events.length === 0 ? (
                  <p className="text-sm text-slate">No upcoming events published yet.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((e) => (
                      <Link
                        key={e.id}
                        to={`/events/${e.id}`}
                        className="flex gap-3 rounded-xl border border-ink/10 p-3 transition hover:border-saffron/40"
                      >
                        <img src={e.image} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-medium text-night">{e.title}</p>
                          <p className="mt-1 text-sm text-slate">
                            {formatDate(e.start, { weekday: 'short' })} · {formatTime(e.start)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {household && (
                <Panel title={`${household.familyName} household`}>
                  <div className="flex items-start gap-2 text-sm text-slate">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                    <p>
                      {household.addressLine1}
                      {household.addressLine2 ? `, ${household.addressLine2}` : ''}
                      <br />
                      {household.city}, {household.state} {household.zip}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate">
                    <Phone className="h-4 w-4 text-saffron" />
                    {household.phone}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {household.members.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-paper py-1 pl-1 pr-2.5 text-xs text-night"
                      >
                        <Avatar
                          name={m.name}
                          src={m.photo || (m.isPrimary ? user.avatar || household.photo : undefined)}
                          size="sm"
                          className="!h-6 !w-6 ring-0"
                        />
                        {m.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="mt-3 text-sm text-saffron" onClick={() => setTab('family')}>
                    Edit family details →
                  </button>
                </Panel>
              )}

              {publicSchedule.length > 0 && (
                <Panel title="Temple hours">
                  <div className="space-y-2.5">
                    {publicSchedule.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-temple">{item.day}</p>
                          <p className="text-sm font-medium text-night">
                            {item.title} · {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel
                title="Latest news"
                action={
                  <Link to="/news" className="text-sm text-saffron">
                    All
                  </Link>
                }
              >
                <div className="space-y-2">
                  {news.slice(0, 3).map((n) => (
                    <Link
                      key={n.id}
                      to={`/news/${n.id}`}
                      className="block rounded-xl border border-ink/10 px-3 py-2.5 hover:border-saffron/40"
                    >
                      <p className="text-[11px] uppercase tracking-wider text-temple">{n.category}</p>
                      <p className="mt-0.5 text-sm font-medium text-night line-clamp-2">{n.title}</p>
                    </Link>
                  ))}
                </div>
              </Panel>

              <div className="grid grid-cols-2 gap-2.5">
                <Link to="/sermons" className="rounded-xl bg-temple p-4 text-white">
                  <BookOpen className="h-4 w-4 text-marigold" />
                  <p className="mt-2 font-display text-lg">Scripture</p>
                </Link>
                <Link to="/events" className="rounded-xl bg-ink p-4 text-white">
                  <CalendarDays className="h-4 w-4 text-marigold" />
                  <p className="mt-2 font-display text-lg">Events</p>
                </Link>
              </div>
            </div>
            </div>
          </div>
        )}

        {tab === 'family' && (
          <div className="mt-6 sm:mt-8">
            {!household ? (
              <Empty
                title="No household on file"
                body="Register your household to manage family details, address, and members here."
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <form
                  className="space-y-4 rounded-2xl border border-ink/8 bg-white p-5 md:p-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const result = updateMyHousehold({
                      familyName: String(fd.get('familyName') || ''),
                      primaryName: String(fd.get('primaryName') || ''),
                      phone: String(fd.get('phone') || ''),
                      addressLine1: String(fd.get('addressLine1') || ''),
                      addressLine2: String(fd.get('addressLine2') || ''),
                      city: String(fd.get('city') || ''),
                      state: String(fd.get('state') || ''),
                      zip: String(fd.get('zip') || ''),
                    })
                    if (result.ok) {
                      setFamilySaved(true)
                      window.setTimeout(() => setFamilySaved(false), 2500)
                    } else {
                      alert(result.error)
                    }
                  }}
                >
                  <div>
                    <h2 className="font-display text-2xl text-night">Address & contact</h2>
                    <p className="mt-1 text-sm text-slate">
                      Changes sync instantly to the temple household directory.
                    </p>
                  </div>
                  <input name="familyName" defaultValue={household.familyName} className="mem-field" placeholder="Family name" required />
                  <input name="primaryName" defaultValue={household.primaryName} className="mem-field" placeholder="Primary contact" required />
                  <input value={household.email} disabled className="mem-field opacity-60" />
                  <input name="phone" defaultValue={household.phone} className="mem-field" placeholder="Phone" required />
                  <input name="addressLine1" defaultValue={household.addressLine1} className="mem-field" placeholder="Street address" required />
                  <input name="addressLine2" defaultValue={household.addressLine2 || ''} className="mem-field" placeholder="Apt / suite" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input name="city" defaultValue={household.city} className="mem-field" placeholder="City" required />
                    <input name="state" defaultValue={household.state} className="mem-field" placeholder="State" required />
                    <input name="zip" defaultValue={household.zip} className="mem-field" placeholder="ZIP" required />
                  </div>
                  <Button type="submit">Save household details</Button>
                  {familySaved && <p className="text-sm text-temple">Saved — temple staff can see this update.</p>}
                </form>

                <Panel title={`Family members (${household.members.length})`}>
                  <div className="space-y-3">
                    {household.members.map((m) => (
                      <div key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-ink/10 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Avatar
                            name={m.name}
                            src={m.photo || (m.isPrimary ? user.avatar || household.photo : undefined)}
                            size="md"
                            className="ring-ink/10"
                          />
                          <div>
                            <p className="font-medium text-night">{m.name}</p>
                            <p className="mt-1 text-sm text-slate">
                              {m.relation}
                              {m.age ? ` · age ${m.age}` : ''}
                              {m.isPrimary ? ' · Primary' : ''}
                            </p>
                          </div>
                        </div>
                        {!m.isPrimary && (
                          <button
                            type="button"
                            className="text-xs text-lotus hover:underline"
                            onClick={() => {
                              if (!confirm(`Remove ${m.name} from household?`)) return
                              updateMyHousehold({
                                members: household.members.filter((x) => x.id !== m.id),
                              })
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <form
                    className="mt-5 grid gap-2 border-t border-ink/8 pt-4 sm:grid-cols-[1.2fr_1fr_auto]"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const name = String(fd.get('name') || '').trim()
                      if (!name) return
                      updateMyHousehold({
                        members: [
                          ...household.members,
                          {
                            id: `hm_${Date.now().toString(36)}`,
                            name,
                            relation: String(fd.get('relation') || 'Family'),
                            age: fd.get('age') ? Number(fd.get('age')) : undefined,
                          },
                        ],
                      })
                      e.currentTarget.reset()
                    }}
                  >
                    <input name="name" className="mem-field" placeholder="New member name" required />
                    <input name="relation" className="mem-field" placeholder="Relation" defaultValue="Family" required />
                    <Button type="submit" size="sm">
                      Add
                    </Button>
                  </form>
                </Panel>
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="mt-10 space-y-6">
            <Panel title="Invoices">
              {invoices.length === 0 ? (
                <p className="text-sm text-slate">No invoices yet for this household.</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-ink/10 p-4"
                    >
                      <div>
                        <p className="font-medium text-night">
                          {inv.invoiceNumber} · {inv.title}
                        </p>
                        <p className="mt-1 text-sm text-slate">{inv.description}</p>
                        <p className="mt-2 text-xs text-slate/70">
                          ${inv.amount.toLocaleString()} · {effectiveInvoiceStatus(inv)} · issued{' '}
                          {formatDate(inv.issuedAt, { weekday: undefined })} · due{' '}
                          {formatDate(inv.dueDate, { weekday: undefined })}
                          {inv.paidAt ? ` · paid ${formatDate(inv.paidAt, { weekday: undefined })}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="line" onClick={() => setReceipt(inv)}>
                          <Receipt className="h-4 w-4" /> Details
                        </Button>
                        {(effectiveInvoiceStatus(inv) === 'open' ||
                          effectiveInvoiceStatus(inv) === 'overdue') && (
                          <Button size="sm" onClick={() => payInvoice(inv.id)}>
                            Pay online
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Payment history">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate">No payments logged yet.</p>
              ) : (
                <div className="divide-y divide-ink/8 overflow-hidden rounded-xl border border-ink/8">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-night">
                          ${t.amount.toLocaleString()} · {t.method}
                        </p>
                        <p className="text-slate">
                          {t.note || 'Payment'}
                          {t.reference ? ` · ${t.reference}` : ''}
                        </p>
                      </div>
                      <p className="text-xs text-slate/70">{formatDate(t.createdAt, { weekday: undefined })}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {household && household.donations.length > 0 && (
              <Panel title="Donation records">
                <div className="space-y-2">
                  {household.donations.map((d) => (
                    <div key={d.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
                      <span className="text-night">
                        ${d.amount.toLocaleString()} · {d.method}
                      </span>
                      <span className="text-slate">
                        {formatDate(d.date, { weekday: undefined })}
                        {d.note ? ` · ${d.note}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="mt-10">
            <Panel title="Household activity" action={`${activity.length} recent`}>
              {activity.length === 0 ? (
                <p className="text-sm text-slate">Activity will appear here as invoices and updates sync.</p>
              ) : (
                <ol className="relative space-y-0 border-l border-ink/10 pl-5">
                  {activity.map((item) => (
                    <li key={item.id} className="relative pb-5 last:pb-0">
                      <span
                        className={`absolute -left-[1.55rem] mt-1.5 h-2.5 w-2.5 rounded-full ${
                          item.tone === 'alert'
                            ? 'bg-lotus'
                            : item.tone === 'money'
                              ? 'bg-saffron'
                              : item.tone === 'ok'
                                ? 'bg-temple'
                                : 'bg-ink/30'
                        }`}
                      />
                      <p className="text-xs text-slate/70">{formatDate(item.at)}</p>
                      <p className="mt-1 font-medium text-night">{item.title}</p>
                      <p className="mt-0.5 text-sm text-slate">{item.detail}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        )}

        {tab === 'requests' && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <form
              className="space-y-4 rounded-2xl border border-ink/8 bg-white p-5 md:p-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (!user.householdId) {
                  alert('Link a household before sending a request.')
                  return
                }
                const fd = new FormData(e.currentTarget)
                addMemberRequest({
                  householdId: user.householdId,
                  userId: user.id,
                  name: user.name,
                  email: user.email,
                  type: String(fd.get('type') || 'general') as MemberRequestType,
                  subject: String(fd.get('subject') || ''),
                  message: String(fd.get('message') || ''),
                })
                setRequestSent(true)
                e.currentTarget.reset()
                window.setTimeout(() => setRequestSent(false), 3000)
              }}
            >
              <div>
                <h2 className="font-display text-2xl text-night">Send a request</h2>
                <p className="mt-1 text-sm text-slate">Goes straight to the temple inbox with your household attached.</p>
              </div>
              <select name="type" className="mem-field" defaultValue="general">
                <option value="general">General question</option>
                <option value="billing">Billing / invoice</option>
                <option value="seva">Seva opportunity</option>
                <option value="update">Family info update</option>
                <option value="event">Event question</option>
              </select>
              <input name="subject" className="mem-field" placeholder="Subject" required />
              <textarea name="message" className="mem-field" rows={5} placeholder="How can the mandir help?" required />
              <Button type="submit">
                <MessageSquare className="h-4 w-4" /> Send to temple
              </Button>
              {requestSent && <p className="text-sm text-temple">Sent — staff will see this in Inbox.</p>}
            </form>

            <Panel title="Your requests" action={`${myRequests.filter((r) => r.status === 'open').length} open`}>
              {myRequests.length === 0 ? (
                <p className="text-sm text-slate">No requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {myRequests
                    .slice()
                    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                    .map((req) => (
                      <div key={req.id} className="rounded-xl border border-ink/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-night">{req.subject}</p>
                          <span className="text-xs uppercase tracking-wider text-temple">{req.status}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate/70">
                          {req.type} · {formatDate(req.createdAt, { weekday: undefined })}
                        </p>
                        <p className="mt-2 text-sm text-slate">{req.message}</p>
                      </div>
                    ))}
                </div>
              )}
            </Panel>
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-6 grid gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-2">
            <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-ink/8 bg-white p-5 sm:p-6">
              <h2 className="font-display text-2xl text-night">Your login profile</h2>
              <AvatarUpload name={user.name} value={avatar} onChange={setAvatar} label="Update photo" />
              <label className="block text-sm">
                <span className="mb-1 block text-slate">Name</span>
                <input name="name" defaultValue={user.name} className="mem-field" required />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate">Phone</span>
                <input name="phone" defaultValue={user.phone || ''} placeholder="Phone" className="mem-field" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate">Email</span>
                <input value={user.email} disabled className="mem-field opacity-60" />
              </label>
              <Button type="submit">Save profile</Button>
              {saved && <p className="text-sm text-temple">Profile updated — photo & contact synced to temple.</p>}
            </form>

            <form
              className="space-y-4 rounded-2xl border border-ink/8 bg-white p-5 sm:p-6"
              onSubmit={async (e) => {
                e.preventDefault()
                setPasswordMsg('')
                setPasswordError('')
                const fd = new FormData(e.currentTarget)
                const next = String(fd.get('password') || '')
                const confirm = String(fd.get('confirm') || '')
                if (next.length < 6) {
                  setPasswordError('Password must be at least 6 characters.')
                  return
                }
                if (next !== confirm) {
                  setPasswordError('Passwords do not match.')
                  return
                }
                const result = await updatePassword(next)
                if (!result.ok) {
                  setPasswordError(result.error || 'Could not update password')
                  return
                }
                setPasswordMsg('Password updated. Use it next time you sign in.')
                e.currentTarget.reset()
              }}
            >
              <h2 className="font-display text-2xl text-night">Change password</h2>
              <p className="text-sm text-slate">
                Or use{' '}
                <Link to="/forgot-password" className="text-saffron underline">
                  Forgot password
                </Link>{' '}
                from the sign-in page if you are locked out.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block text-slate">New password</span>
                <input name="password" type="password" required autoComplete="new-password" className="mem-field" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate">Confirm password</span>
                <input name="confirm" type="password" required autoComplete="new-password" className="mem-field" />
              </label>
              {passwordError && <p className="text-sm text-lotus">{passwordError}</p>}
              {passwordMsg && <p className="text-sm text-temple">{passwordMsg}</p>}
              <Button type="submit">Update password</Button>
            </form>

            <div className="rounded-2xl border border-ink/8 bg-paper p-6 lg:col-span-2">
              <h2 className="font-display text-2xl text-night">How this portal works</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate">
                <li>Register → temple sees your household in the directory (needs review).</li>
                <li>Update family/address → staff sees changes immediately.</li>
                <li>Invoices & payments stay synced both ways.</li>
                <li>Send requests for billing, seva, or questions — answered from Inbox.</li>
                <li>Activity timeline shows every important update on your household.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {receipt && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-night/50 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-temple">Invoice detail</p>
                <h3 className="mt-2 font-display text-3xl text-night">{receipt.invoiceNumber}</h3>
              </div>
              <button type="button" className="text-sm text-slate" onClick={() => setReceipt(null)}>
                Close
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-slate">Title</dt>
                <dd className="font-medium text-night">{receipt.title}</dd>
              </div>
              <div>
                <dt className="text-slate">Reason</dt>
                <dd className="text-night">{receipt.description}</dd>
              </div>
              <div>
                <dt className="text-slate">Amount</dt>
                <dd className="font-display text-2xl text-night">${receipt.amount.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-slate">Status</dt>
                <dd className="capitalize text-night">{effectiveInvoiceStatus(receipt)}</dd>
              </div>
              <div>
                <dt className="text-slate">Issued / due</dt>
                <dd className="text-night">
                  {formatDate(receipt.issuedAt, { weekday: undefined })} · due{' '}
                  {formatDate(receipt.dueDate, { weekday: undefined })}
                </dd>
              </div>
              {receipt.paidAt && (
                <div>
                  <dt className="text-slate">Paid</dt>
                  <dd className="text-night">{formatDate(receipt.paidAt)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {(effectiveInvoiceStatus(receipt) === 'open' ||
                effectiveInvoiceStatus(receipt) === 'overdue') && (
                <Button
                  onClick={() => {
                    payInvoice(receipt.id)
                    setReceipt(null)
                  }}
                >
                  Pay online
                </Button>
              )}
              <Button variant="line" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mem-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(23, 32, 51, 0.15);
          background: #fff;
          padding: 0.75rem 0.9rem;
          outline: none;
        }
        .mem-field:focus { border-color: #e89720; }
      `}</style>
    </div>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Users
}) {
  return (
    <div className="rounded-xl border border-ink/8 bg-white p-3.5 sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider text-temple sm:text-xs">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-saffron sm:h-4 sm:w-4" />
      </div>
      <p className="mt-1.5 font-display text-xl capitalize text-night sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-night">{title}</h2>
        {typeof action === 'string' ? <span className="text-xs text-slate">{action}</span> : action}
      </div>
      {children}
    </section>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
      <h2 className="font-display text-2xl text-night">{title}</h2>
      <p className="mt-2 text-sm text-slate">{body}</p>
      <Link to="/login" className="mt-5 inline-block">
        <Button variant="line">Go to sign in</Button>
      </Link>
    </div>
  )
}
