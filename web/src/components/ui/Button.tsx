import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'line' | 'danger'

const styles: Record<Variant, string> = {
  primary:
    'bg-saffron text-night hover:bg-marigold shadow-[0_12px_28px_rgba(232,151,32,0.28)]',
  secondary: 'bg-temple text-white hover:bg-ink',
  ghost: 'bg-white/10 text-white hover:bg-white/18 border border-white/25 backdrop-blur-sm',
  line: 'border border-ink/15 text-ink hover:border-saffron hover:text-saffron bg-transparent',
  danger: 'bg-lotus text-white hover:bg-lotus/90',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
