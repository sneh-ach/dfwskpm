import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { AuthField, AuthShell } from '../components/auth/AuthShell'
import { isStaff } from '../lib/permissions'
import { normalizeEmail } from '../lib/authErrors'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as
    | { from?: string; registered?: boolean; email?: string; message?: string; reset?: boolean }
    | null
  const from = state?.from
  const [error, setError] = useState('')
  const [notice] = useState(state?.message || '')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const fd = new FormData(e.currentTarget)
    const email = normalizeEmail(String(fd.get('email') || ''))
    const password = String(fd.get('password') || '')
    const result = await login(email, password)
    setBusy(false)
    if (!result.ok) {
      setError(result.error || 'Login failed')
      return
    }
    const user = useAuthStore.getState().currentUser
    const staff = isStaff(user?.role)
    if (staff) {
      navigate(from?.startsWith('/admin') ? from : '/admin', { replace: true })
      return
    }
    if (!user?.householdId) {
      navigate('/signup', {
        replace: true,
        state: {
          completeHousehold: true,
          email: user?.email,
          message: 'Finish your household details to open the family portal.',
        },
      })
      return
    }
    navigate(from?.startsWith('/admin') ? '/member' : from || '/member', { replace: true })
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Household accounts open the family portal. Temple staff open the dashboard only."
      footer={
        <>
          New family?{' '}
          <Link to="/signup" className="font-medium text-saffron hover:underline">
            Register your household
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {notice && <p className="auth-ok">{notice}</p>}

        <AuthField label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state?.email || ''}
            className="auth-field"
            placeholder="you@email.com"
          />
        </AuthField>

        <AuthField label="Password">
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              className="auth-field pr-12"
              placeholder="Your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-slate hover:text-night"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </AuthField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-saffron hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
