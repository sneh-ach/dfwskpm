import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { isStaff } from '../lib/permissions'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await login(String(fd.get('email')), String(fd.get('password')))
    if (!result.ok) {
      setError(result.error || 'Login failed')
      return
    }
    const user = useAuthStore.getState().currentUser
    const staff = isStaff(user?.role)
    if (staff) {
      navigate(from?.startsWith('/admin') ? from : '/admin')
      return
    }
    if (from?.startsWith('/admin')) {
      navigate('/member')
      return
    }
    navigate(from || '/member')
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-6 md:py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-temple">Sign in</p>
        <h1 className="mt-3 font-display text-3xl text-night sm:text-4xl md:text-5xl">Welcome back</h1>
        <p className="mt-3 max-w-md text-sm text-slate sm:mt-4 sm:text-base">
          Household accounts open the family portal. Temple staff open the dashboard only.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(7,19,31,0.08)] sm:p-8"
      >
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate">Email</span>
          <input name="email" type="email" required autoComplete="email" className="auth-field" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="auth-field"
          />
        </label>
        {error && <p className="text-sm text-lotus">{error}</p>}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        <p className="text-center text-sm text-slate">
          New family?{' '}
          <Link to="/signup" className="text-saffron hover:underline">
            Register your household
          </Link>
        </p>
      </form>

      <style>{`
        .auth-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 32, 51, 0.15);
          background: #f7fafc;
          padding: 0.8rem 0.9rem;
          font-size: 16px;
          outline: none;
        }
        .auth-field:focus {
          border-color: #e89720;
        }
      `}</style>
    </div>
  )
}
