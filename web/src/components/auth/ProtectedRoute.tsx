import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { canAccessAdminPath, isStaff } from '../../lib/permissions'

export function ProtectedRoute({
  children,
  adminOnly = false,
  staffOnly = false,
  memberOnly = false,
}: {
  children: React.ReactNode
  /** Full admin only (families, billing, access). */
  adminOnly?: boolean
  /** Admin or website editor — temple dashboard only. */
  staffOnly?: boolean
  /** Household portal only — staff never share this account type. */
  memberOnly?: boolean
}) {
  const user = useAuthStore((s) => s.currentUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Staff accounts are dashboard-only — never the household portal
  if (memberOnly && isStaff(user.role)) {
    return <Navigate to="/admin" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to={isStaff(user.role) ? '/admin' : '/member'} replace />
  }

  if (staffOnly && !isStaff(user.role)) {
    return <Navigate to="/member" replace />
  }

  if (staffOnly && !canAccessAdminPath(user.role, location.pathname)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
