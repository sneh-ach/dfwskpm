/** Map Supabase / auth errors into short, actionable copy. */
export function friendlyAuthError(raw: string | undefined | null, fallback = 'Something went wrong. Please try again.') {
  const msg = (raw || '').trim()
  const lower = msg.toLowerCase()

  if (!msg) return fallback

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Email or password is incorrect. Double-check both, or reset your password.'
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return 'Please confirm your email first, then sign in. Check your inbox and spam folder.'
  }
  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered') ||
    lower.includes('already registered')
  ) {
    return 'An account with this email already exists. Sign in, or use Forgot password.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is known to be weak')) {
    return 'Choose a stronger password (at least 6 characters).'
  }
  if (lower.includes('new password should be different')) {
    return 'New password must be different from your current password.'
  }
  if (lower.includes('same password')) {
    return 'Please choose a new password that is different from the old one.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('email rate')) {
    return 'Too many attempts. Wait a minute, then try again.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network issue — check your connection and try again.'
  }
  if (lower.includes('user not found')) {
    return 'No account found for that email. Register your household first.'
  }
  if (lower.includes('expired') || lower.includes('otp') || lower.includes('token')) {
    return 'This reset link has expired. Request a new password reset email.'
  }

  return msg
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
