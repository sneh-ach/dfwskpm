import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Home,
  Inbox,
  Mail,
  Megaphone,
  Newspaper,
  Search,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import { useAuthStore } from '../../store/authStore'
import { canManageFamilies, isAdmin, roleLabel } from '../../lib/permissions'
import { formatDate } from '../../lib/utils'
import { effectiveInvoiceStatus } from '../../lib/activity'
import { Avatar } from '../../components/ui/Avatar'

export function AdminOverview() {
  const {
    events,
    news,
    team,
    resources,
    contactMessages,
    households,
    invoices,
    announcements,
    schedule,
  } = useContentStore()
  const user = useAuthStore((s) => s.currentUser)
  const role = user?.role
  const memberRequests = useContentStore((s) => s.memberRequests) || []
  const admin = isAdmin(role)
  const manage = canManageFamilies(role)

  const needsReview = households.filter((h) => h.needsReview)
  const openInvoices = invoices.filter((i) => {
    const s = effectiveInvoiceStatus(i)
    return s === 'open' || s === 'overdue'
  })
  const openAmount = openInvoices.reduce((s, i) => s + i.amount, 0)
  const openRequests = memberRequests.filter((r) => r.status === 'open')
  const unreadContact = contactMessages.filter((m) => !m.read)
  const people = households.reduce((sum, h) => sum + h.members.length, 0)
  const liveEvents = events.filter((e) => e.status === 'published').length
  const liveNews = news.filter((n) => n.status === 'published').length
  const liveAnnouncements = announcements.filter((a) => a.status === 'published').length

  const attention: { label: string; detail: string; to: string; count: number }[] = []
  if (manage) {
    if (needsReview.length)
      attention.push({
        label: 'Households to review',
        detail: 'New signups waiting for confirmation',
        to: '/admin/households',
        count: needsReview.length,
      })
    if (openInvoices.length)
      attention.push({
        label: 'Open invoices',
        detail: `$${openAmount.toLocaleString()} outstanding`,
        to: '/admin/billing',
        count: openInvoices.length,
      })
    if (openRequests.length)
      attention.push({
        label: 'Member requests',
        detail: 'From household portal inbox',
        to: '/admin/messages',
        count: openRequests.length,
      })
    if (unreadContact.length)
      attention.push({
        label: 'Contact messages',
        detail: 'Public contact form',
        to: '/admin/messages',
        count: unreadContact.length,
      })
  }

  const familyLinks = [
    { to: '/admin/lookup', label: 'Member lookup', desc: 'Search people, photos, full history', icon: Search },
    { to: '/admin/households', label: 'Households', desc: `${households.length} families · ${people} people`, icon: Home },
    { to: '/admin/billing', label: 'Billing', desc: `${openInvoices.length} open · $${openAmount.toLocaleString()} due`, icon: CreditCard },
    { to: '/admin/email', label: 'Email', desc: 'Templates & Gmail drafts', icon: Mail },
    { to: '/admin/messages', label: 'Inbox', desc: `${openRequests.length + unreadContact.length} need attention`, icon: Inbox },
    { to: '/admin/access', label: 'Staff access', desc: 'Admins & website editors only', icon: Shield },
  ]

  const siteLinks = [
    { to: '/admin/events', label: 'Events', desc: `${liveEvents} live`, icon: CalendarDays },
    { to: '/admin/news', label: 'News', desc: `${liveNews} live`, icon: Newspaper },
    { to: '/admin/announcements', label: 'Announcements', desc: `${liveAnnouncements} live`, icon: Megaphone },
    { to: '/admin/team', label: 'Team', desc: `${team.length} people`, icon: Users },
    { to: '/admin/schedule', label: 'Hours', desc: `${schedule.filter((s) => s.status === 'published').length} listed`, icon: Clock3 },
    { to: '/admin/resources', label: 'Resources', desc: `${resources.length} files`, icon: BookOpen },
    { to: '/admin/settings', label: 'Settings', desc: 'Contact, donate, hero', icon: Settings },
  ]

  return (
    <div className="min-w-0 overflow-x-clip pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-marigold">Temple dashboard</p>
          <h1 className="mt-1.5 font-display text-3xl text-white sm:text-4xl">
            Pranam{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1.5 text-sm text-mist/65">
            {roleLabel(role || 'member')}
            {admin
              ? ' · Families, billing, email, and website'
              : ' · Website content only'}
          </p>
        </div>
        {manage && (
          <Link
            to="/admin/lookup"
            className="inline-flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-medium text-night"
          >
            <Search className="h-4 w-4" /> Member lookup
          </Link>
        )}
      </div>

      {/* Needs attention — only when something is pending */}
      {attention.length > 0 && (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-marigold">Needs attention</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {attention.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between gap-3 rounded-xl border border-marigold/35 bg-marigold/10 px-4 py-3 transition hover:border-marigold/60"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">
                    <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-marigold/20 px-1.5 text-sm text-marigold">
                      {item.count}
                    </span>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-mist/55">{item.detail}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-marigold/80" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {manage && (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-mist/50">Families & money</p>
              <h2 className="mt-1 font-display text-2xl text-white">Member operations</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {familyLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition hover:border-saffron/40"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-marigold">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium text-white group-hover:text-marigold">
                    {item.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-xs text-mist/50">{item.desc}</span>
                </span>
              </Link>
            ))}
          </div>

          {needsReview.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
              <p className="text-xs uppercase tracking-wider text-mist/50">New signups</p>
              <div className="mt-3 space-y-2">
                {needsReview.slice(0, 4).map((hh) => (
                  <Link
                    key={hh.id}
                    to={`/admin/lookup?hh=${hh.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                  >
                    <Avatar name={hh.primaryName} src={hh.photo} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {hh.familyName} · {hh.primaryName}
                      </p>
                      <p className="truncate text-xs text-mist/45">
                        {hh.email} · {formatDate(hh.createdAt, { weekday: undefined })}
                      </p>
                    </div>
                    <span className="text-xs text-marigold">Review</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-mist/50">Website</p>
        <h2 className="mt-1 font-display text-2xl text-white">Content & site</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {siteLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition hover:border-saffron/40"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-marigold">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-white group-hover:text-marigold">{item.label}</span>
                <span className="mt-0.5 block text-xs text-mist/50">{item.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {manage && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-marigold">Flow</p>
          <h2 className="mt-1 font-display text-xl text-white">Keep it simple</h2>
          <ol className="mt-3 space-y-2 text-sm text-mist/75">
            <li>
              <span className="text-marigold">1.</span> Family registers → review in Lookup / Households
            </li>
            <li>
              <span className="text-marigold">2.</span> Create invoice → family sees it under Payments
            </li>
            <li>
              <span className="text-marigold">3.</span> Email from templates when you need to notify someone
            </li>
          </ol>
        </section>
      )}
    </div>
  )
}
