import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Shield, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../../components/ui/Button'
import { roleLabel } from '../../lib/permissions'
import type { Role } from '../../types'
import { formatDate } from '../../lib/utils'

export function AdminAccess() {
  const users = useAuthStore((s) => s.users)
  const currentUser = useAuthStore((s) => s.currentUser)!
  const upsertStaffUser = useAuthStore((s) => s.upsertStaffUser)
  const setUserRole = useAuthStore((s) => s.setUserRole)
  const deleteUser = useAuthStore((s) => s.deleteUser)
  const households = useContentStore((s) => s.households)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((u) => {
        if (!q) return true
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.includes(q)
        )
      })
  }, [users, query])

  const staff = users.filter((u) => u.role === 'admin' || u.role === 'editor')
  const members = users.filter((u) => u.role === 'member')

  function onCreateStaff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = upsertStaffUser({
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      password: String(fd.get('password') || ''),
      phone: String(fd.get('phone') || ''),
      role: String(fd.get('role') || 'editor') as 'admin' | 'editor',
    })
    if (!result.ok) {
      setError(result.error || 'Could not create staff user')
      return
    }
    setAdding(false)
    e.currentTarget.reset()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Staff access</h1>
          <p className="mt-2 max-w-2xl text-mist/70">
            Staff logins are temple-only (dashboard). They are not household/family accounts. Editors can update
            website content; full admins also manage households, billing, and access.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add staff login
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Staff logins', staff.length],
          ['Website editors', users.filter((u) => u.role === 'editor').length],
          ['Household members', members.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-mist/60">{label}</p>
            <p className="mt-1 font-display text-3xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {adding && (
        <form
          onSubmit={onCreateStaff}
          className="mt-6 grid gap-3 rounded-2xl border border-marigold/30 bg-white/5 p-5 md:grid-cols-2"
        >
          <input name="name" className="admin-field" placeholder="Full name" required />
          <input name="email" type="email" className="admin-field" placeholder="Email (login)" required />
          <input name="password" type="password" className="admin-field" placeholder="Temp password (min 6)" required />
          <input name="phone" className="admin-field" placeholder="Phone (optional)" />
          <select name="role" className="admin-field md:col-span-2" defaultValue="editor">
            <option value="editor">Website editor — content only</option>
            <option value="admin">Temple admin — full access</option>
          </select>
          {error && <p className="text-sm text-lotus md:col-span-2">{error}</p>}
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Create access</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <input
        className="admin-field mt-6"
        placeholder="Search by name, email, or role…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-6 space-y-3">
        {filtered.map((u) => {
          const hh = households.find((h) => h.id === u.householdId)
          return (
            <div key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{u.name}</p>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-marigold">
                      {roleLabel(u.role)}
                    </span>
                    {u.id === currentUser.id && (
                      <span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[11px] text-saffron">You</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-mist/65">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-mist/45">
                    Joined {formatDate(u.createdAt, { weekday: undefined })}
                    {u.role === 'admin' || u.role === 'editor'
                      ? ' · Staff dashboard only (no household portal)'
                      : hh
                        ? ` · Household: ${hh.familyName}`
                        : ' · No household linked'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="admin-field w-auto"
                    value={u.role}
                    disabled={u.id === currentUser.id}
                    onChange={(e) => {
                      const result = setUserRole(u.id, e.target.value as Role)
                      if (!result.ok) alert(result.error)
                    }}
                  >
                    <option value="member">Household member</option>
                    <option value="editor">Website editor</option>
                    <option value="admin">Temple admin</option>
                  </select>
                  {u.id !== currentUser.id && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Remove login for ${u.name}?`)) {
                          const result = deleteUser(u.id)
                          if (!result.ok) alert(result.error)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-5 w-5 text-marigold" />
          <div className="text-sm text-mist/75">
            <p className="font-medium text-white">Access levels</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-white">Temple admin</strong> — dashboard only: households, billing, inbox,
                staff access, website content (not a family login)
              </li>
              <li>
                <strong className="text-white">Website editor</strong> — dashboard only: events, news, team, hours,
                resources, settings
              </li>
              <li>
                <strong className="text-white">Household member</strong> — family portal only (one login for the
                household: address, members, invoices, payments)
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
