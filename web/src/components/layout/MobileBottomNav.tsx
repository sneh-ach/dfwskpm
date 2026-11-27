import { NavLink } from 'react-router-dom'
import { CalendarDays, Heart, Home, Newspaper, UserRound } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isStaff } from '../../lib/permissions'
import { cn } from '../../lib/utils'

export function MobileBottomNav() {
  const user = useAuthStore((s) => s.currentUser)
  const accountTo = user ? (isStaff(user.role) ? '/admin' : '/member') : '/login'
  const accountLabel = user ? (isStaff(user.role) ? 'Dash' : 'Account') : 'Sign in'

  const items = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/donate', label: 'Donate', icon: Heart },
    { to: accountTo, label: accountLabel, icon: UserRound },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.65rem)' }}
      aria-label="Primary"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-0.5 pt-1.5 pb-1">
        {items.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition',
                isActive ? 'text-saffron' : 'text-slate hover:text-night',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                    isActive && 'bg-saffron/10',
                  )}
                >
                  <item.icon
                    className={cn('h-[1.15rem] w-[1.15rem]', isActive ? 'text-saffron' : 'text-slate')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                </span>
                <span className="truncate leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
