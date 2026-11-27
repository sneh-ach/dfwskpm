import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Newspaper,
  Search,
  Settings,
  Shield,
  Users,
  ExternalLink,
  Home,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { canManageFamilies, isAdmin, roleLabel } from '../../lib/permissions'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true, adminOnly: false, group: 'start' },
  { to: '/admin/lookup', label: 'Member lookup', icon: Search, adminOnly: true, group: 'families' },
  { to: '/admin/households', label: 'Households', icon: Home, adminOnly: true, group: 'families' },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard, adminOnly: true, group: 'families' },
  { to: '/admin/email', label: 'Email', icon: Mail, adminOnly: true, group: 'families' },
  { to: '/admin/messages', label: 'Inbox', icon: Inbox, adminOnly: true, group: 'families' },
  { to: '/admin/events', label: 'Events', icon: CalendarDays, adminOnly: false, group: 'site' },
  { to: '/admin/news', label: 'News', icon: Newspaper, adminOnly: false, group: 'site' },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, adminOnly: false, group: 'site' },
  { to: '/admin/team', label: 'Team', icon: Users, adminOnly: false, group: 'site' },
  { to: '/admin/schedule', label: 'Hours', icon: Clock3, adminOnly: false, group: 'site' },
  { to: '/admin/resources', label: 'Resources', icon: BookOpen, adminOnly: false, group: 'site' },
  { to: '/admin/access', label: 'Staff access', icon: Shield, adminOnly: true, group: 'system' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: false, group: 'system' },
]

const mobileQuickAdmin = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/lookup', label: 'Lookup', icon: Search },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard },
  { to: '/admin/email', label: 'Email', icon: Mail },
  { to: '/admin/messages', label: 'Inbox', icon: Inbox },
]

const mobileQuickEditor = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/announcements', label: 'Alerts', icon: Megaphone },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const user = useAuthStore((s) => s.currentUser)!
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const visibleNav = nav.filter((item) => !item.adminOnly || canManageFamilies(user.role))
  const quickNav = canManageFamilies(user.role) ? mobileQuickAdmin : mobileQuickEditor
  const currentLabel =
    visibleNav.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    )?.label ?? 'Dashboard'

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-night text-mist">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 p-5 lg:flex">
          <p className="text-xs uppercase tracking-[0.22em] text-marigold">Temple dashboard</p>
          <p className="mt-2 font-display text-xl text-white">DFWSKPM</p>
          <p className="mt-1 text-xs text-mist/60">{user.email}</p>
          <p className="mt-1 text-[11px] text-marigold/80">{roleLabel(user.role)}</p>
          <nav className="mt-8 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
            {visibleNav.map((item, index) => {
              const prev = visibleNav[index - 1]
              const showGroup =
                item.group && item.group !== 'start' && (!prev || prev.group !== item.group)
              const groupLabel =
                item.group === 'families'
                  ? 'Families'
                  : item.group === 'site'
                    ? 'Website'
                    : item.group === 'system'
                      ? 'System'
                      : null
              return (
                <div key={item.to}>
                  {showGroup && groupLabel && (
                    <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist/40">
                      {groupLabel}
                    </p>
                  )}
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition',
                        isActive ? 'bg-saffron/20 text-marigold' : 'text-mist/75 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </div>
              )
            })}
          </nav>
          <div className="space-y-2">
            {!isAdmin(user.role) && (
              <p className="px-3 text-[11px] leading-relaxed text-mist/45">
                Editor access: website content only. Ask an admin for households or billing.
              </p>
            )}
            <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist/70 hover:text-white">
              <ExternalLink className="h-4 w-4" /> View website
            </Link>
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 border-b border-white/10 bg-night/95 px-3 py-2.5 backdrop-blur-xl lg:hidden pt-[max(0.65rem,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-marigold">Dashboard</p>
                <p className="truncate text-sm font-medium text-white">{currentLabel}</p>
              </div>
              <Link
                to="/"
                className="inline-flex h-10 items-center rounded-xl bg-white/5 px-3 text-xs text-mist/75"
              >
                Site
              </Link>
            </div>
          </div>

          {/* Mobile full menu drawer */}
          {menuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-night shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-marigold">Menu</p>
                    <p className="mt-0.5 text-sm text-white">{roleLabel(user.role)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-3">
                  {visibleNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition',
                          isActive ? 'bg-saffron/20 text-marigold' : 'text-mist/80 hover:bg-white/5',
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="space-y-1 border-t border-white/10 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <Link
                    to="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-mist/75"
                  >
                    <ExternalLink className="h-4 w-4" /> View website
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-mist/75"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:p-5 md:p-8 lg:pb-8">
            <Outlet />
          </div>

          {/* Mobile bottom quick nav */}
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/95 backdrop-blur-xl lg:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-1.5">
              {quickNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] transition',
                      isActive ? 'text-marigold' : 'text-mist/55',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                          isActive ? 'bg-saffron/20' : '',
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
