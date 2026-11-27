import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Phone: horizontal snap carousel.
 * Laptop+: pass grid/layout classes via className (e.g. md:grid md:grid-cols-3).
 */
export function SnapRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-md:snap-row max-md:-mx-4 max-md:flex max-md:gap-3 max-md:overflow-x-auto max-md:px-4 max-md:pb-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
