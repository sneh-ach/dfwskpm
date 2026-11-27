import type { Role } from '../types'

/** Full temple control — households, billing, staff access, inbox. */
export function isAdmin(role?: Role | null) {
  return role === 'admin'
}

/** Can open the temple dashboard (admin or website editor). */
export function isStaff(role?: Role | null) {
  return role === 'admin' || role === 'editor'
}

/** Website content: events, news, announcements, team, hours, resources, settings. */
export function canEditContent(role?: Role | null) {
  return role === 'admin' || role === 'editor'
}

/** Families, invoices, payments, staff access, inbox. */
export function canManageFamilies(role?: Role | null) {
  return role === 'admin'
}

export const CONTENT_PATHS = [
  '/admin',
  '/admin/events',
  '/admin/news',
  '/admin/announcements',
  '/admin/team',
  '/admin/schedule',
  '/admin/resources',
  '/admin/settings',
] as const

export const ADMIN_ONLY_PATHS = [
  '/admin/lookup',
  '/admin/households',
  '/admin/billing',
  '/admin/email',
  '/admin/messages',
  '/admin/access',
] as const

export function canAccessAdminPath(role: Role | null | undefined, pathname: string) {
  if (!isStaff(role)) return false
  if (isAdmin(role)) return true
  // Editors: content areas only
  if (ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return false
  }
  return true
}

export function roleLabel(role: Role) {
  if (role === 'admin') return 'Temple admin'
  if (role === 'editor') return 'Website editor'
  return 'Household member'
}
