import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { AuthField, AuthShell } from '../components/auth/AuthShell'

export function ResetPasswordPage() {
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    async function prepare() {
      if (!supabase) {
        if (active) setInvalidLink(true)
        return
      }

      // Recovery links land with tokens in the URL; supabase-js parses them when detectSessionInUrl is on.
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        if (active) setReady(true)
        return
      }

      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          if (active) {
            setReady(true)
            setInvalidLink(false)
          }
        }
      })

      // Give the client a moment to exchange the recovery token from the URL hash/query
      window.setTimeout(async () => {
        if (!supabase) return
        const again = await supabase.auth.getSession()
        if (!active) return
        if (again.data.session) setReady(true)
        else setInvalidLink(true)
      }, 800)

      return () => sub.subscription.unsubscribe()
    }

    void prepare()
    return () => {
      active = false
    }
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    const result = await updatePassword(password)
    setBusy(false)
    if (!result.ok) {
      setError(result.error || 'Could not update password')
      return
    }
    navigate('/login', {
      replace: true,
      state: {
        reset: true,
        message: 'Password updated. Sign in with your new password.',
      },
    })
  }

  return (
    <AuthShell
      eyebrow="Password help"
      title="Choose a new password"
      subtitle="Set a new password for your household login. You’ll use it the next time you sign in."
      footer={
        <>
          <Link to="/login" className="font-medium text-saffron hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {invalidLink && !ready ? (
        <div className="space-y-4">
          <p className="auth-error">
            This reset link is invalid or has expired. Request a new one from the forgot password page.
          </p>
          <Link to="/forgot-password">
            <Button type="button" className="w-full">
              Request a new link
            </Button>
          </Link>
        </div>
      ) : !ready ? (
        <p className="text-sm text-slate">Checking your reset link…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthField label="New password" hint="At least 6 characters.">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="auth-field pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
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
          <AuthField label="Confirm password">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="auth-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
          </AuthField>
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
