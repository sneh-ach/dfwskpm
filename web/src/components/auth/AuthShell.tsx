import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl min-w-0 items-center gap-8 overflow-x-clip px-4 py-12 md:grid-cols-2 md:gap-12 md:px-6 md:py-16">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.22em] text-temple">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-night sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-md text-sm text-slate sm:mt-4 sm:text-base">{subtitle}</p>
        <p className="mt-6 hidden text-sm text-slate/80 md:block">
          <Link to="/" className="text-saffron hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>

      <div className="min-w-0 rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(7,19,31,0.08)] sm:p-8">
        {children}
        {footer ? <div className="mt-5 border-t border-ink/8 pt-4 text-center text-sm text-slate">{footer}</div> : null}
      </div>

      <style>{`
        .auth-field {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 32, 51, 0.15);
          background: #f7fafc;
          padding: 0.8rem 0.9rem;
          font-size: 16px;
          outline: none;
        }
        .auth-field:focus {
          border-color: #e89720;
          box-shadow: 0 0 0 3px rgba(232, 151, 32, 0.15);
        }
        .auth-field:read-only {
          background: #eef2f6;
          color: #4a5568;
        }
        .auth-label {
          display: block;
          margin-bottom: 0.4rem;
          font-size: 0.875rem;
          color: #4a5568;
        }
        .auth-error {
          border-radius: 0.75rem;
          border: 1px solid rgba(139, 94, 52, 0.25);
          background: rgba(139, 94, 52, 0.08);
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          color: #5c3d22;
        }
        .auth-ok {
          border-radius: 0.75rem;
          border: 1px solid rgba(232, 151, 32, 0.28);
          background: rgba(232, 151, 32, 0.1);
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          color: #172033;
        }
      `}</style>
    </div>
  )
}

export function AuthField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm">
      <span className="auth-label">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-slate/70">{hint}</span> : null}
    </label>
  )
}
