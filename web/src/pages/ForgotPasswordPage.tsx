import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { AuthField, AuthShell } from '../components/auth/AuthShell'
import { normalizeEmail } from '../lib/authErrors'

export function ForgotPasswordPage() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const clean = normalizeEmail(email)
    const result = await requestPasswordReset(clean)
    setBusy(false)
    if (!result.ok) {
      setError(result.error || 'Could not send reset email')
      return
    }
    setSent(true)
  }

  return (
    <AuthShell
      eyebrow="Password help"
      title="Forgot password"
      subtitle="Enter the email you used for household registration. We’ll send a secure link to choose a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-saffron hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <p className="auth-ok">
            If an account exists for <strong>{normalizeEmail(email)}</strong>, a reset link is on the way.
            Check inbox and spam. The link expires after a short time.
          </p>
          <p className="text-sm text-slate">
            After you open the email link, you’ll set a new password and can sign in again.
          </p>
          <Link to="/login" state={{ email: normalizeEmail(email) }} className="block">
            <Button type="button" className="w-full">
              Return to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthField label="Email" hint="Use the same email as your household login.">
            <input
              type="email"
              required
              autoComplete="email"
              className="auth-field"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AuthField>
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
