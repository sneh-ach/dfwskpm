import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Phone: horizontal snap carousel that stays within the viewport.
 * Pass bleed when the parent already has px-4/px-6 so the row can
 * edge-scroll inside that padding without widening the page.
 * Laptop+: pass grid/layout classes via className (e.g. md:grid md:grid-cols-3).
 */
export function SnapRow({
  children,
  className,
  bleed = false,
}: {
  children: ReactNode
  className?: string
  bleed?: boolean
}) {
  return (
    <div
      className={cn(
        'max-md:snap-row max-md:flex max-md:gap-3 max-md:pb-1',
        bleed && 'max-md:-mx-4 max-md:px-4 md:mx-0 md:px-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
