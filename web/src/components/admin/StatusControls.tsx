import type { ContentStatus } from '../../types'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const statuses: ContentStatus[] = ['published', 'draft', 'hidden', 'archived']

const labels: Record<ContentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  hidden: 'Hidden',
  archived: 'Archived',
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        status === 'published' && 'bg-temple/20 text-marigold',
        status === 'draft' && 'bg-white/10 text-mist/80',
        status === 'hidden' && 'bg-lotus/20 text-[#f0a8b0]',
        status === 'archived' && 'bg-white/5 text-mist/50',
      )}
    >
      {labels[status]}
    </span>
  )
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: ContentStatus
  onChange: (status: ContentStatus) => void
}) {
  return (
    <select
      className="rounded-md border border-white/12 bg-white/5 px-2 py-1.5 text-sm text-white"
      value={value}
      onChange={(e) => onChange(e.target.value as ContentStatus)}
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="text-night">
          {labels[s]}
        </option>
      ))}
    </select>
  )
}

export function QuickStatusButtons({
  onChange,
}: {
  onChange: (status: ContentStatus) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <Button size="sm" variant="ghost" onClick={() => onChange('published')}>
        Publish
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onChange('hidden')}>
        Hide
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onChange('archived')}>
        Archive
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onChange('draft')}>
        Draft
      </Button>
    </div>
  )
}
