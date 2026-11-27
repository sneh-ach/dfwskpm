import { cn } from '../../lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  light?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-2 text-[11px] font-semibold tracking-[0.2em] uppercase sm:mb-3 sm:text-xs sm:tracking-[0.22em]',
            light ? 'text-marigold' : 'text-temple',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-display text-[1.65rem] leading-tight text-balance sm:text-3xl md:text-4xl lg:text-5xl',
          light ? 'text-white' : 'text-night',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-2.5 text-sm leading-relaxed sm:mt-3.5 sm:text-base md:text-lg',
            light ? 'text-mist' : 'text-slate',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
