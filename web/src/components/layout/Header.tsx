import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Heart, UserRound } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isStaff } from '../../lib/permissions'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

const links = [
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/news', label: 'News' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.currentUser)
  const location = useLocation()
  const accountTo = user ? (isStaff(user.role) ? '/admin' : '/member') : '/login'
  const accountLabel = user ? (isStaff(user.role) ? 'Dashboard' : 'My account') : 'Sign in'

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] md:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <img
              src="/img/images-removebg-preview.png"
              alt="DFWSKPM logo"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/35 sm:h-11 sm:w-11"
            />
            <div className="min-w-0 leading-none">
              <p className="font-display text-base tracking-wide text-white sm:text-[1.15rem]">DFWSKPM</p>
              <p className="mt-1 hidden text-[10px] tracking-[0.22em] uppercase text-marigold/85 sm:block">
                Pranami Mandir
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-[13px] tracking-wide transition-colors',
                    isActive ? 'text-marigold' : 'text-mist/75 hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/donate" className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5">
                <Heart className="h-3.5 w-3.5" /> Donate
              </Button>
            </Link>
            <Link to="/donate" className="sm:hidden rounded-md border border-white/15 p-2 text-marigold" aria-label="Donate">
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              to={accountTo}
              className="hidden rounded-md border border-white/15 p-2 text-white sm:inline-flex lg:hidden"
              aria-label={accountLabel}
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <Link to={accountTo} className="hidden lg:inline-flex">
              <Button size="sm" variant="ghost">
                <UserRound className="h-3.5 w-3.5" />
                {accountLabel}
              </Button>
            </Link>
            <button
              type="button"
              className="rounded-md border border-white/15 p-2 text-white lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Outside header: backdrop-filter creates a containing block that collapses fixed children */}
      {open && (
        <div
          className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-night sm:top-[4.25rem] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1 px-4 py-5 pb-28">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-3.5 text-base',
                    isActive ? 'bg-white/10 text-marigold' : 'text-mist hover:bg-white/5',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3.5 text-base text-marigold"
            >
              Donate
            </Link>
            <Link
              to={user ? accountTo : '/signup'}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3.5 text-base text-mist hover:bg-white/5"
            >
              {user ? accountLabel : 'Household signup'}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
