import { cn } from '../../lib/utils'
import type { TeamGroup, TeamMember } from '../../types'

const groupLabels: Record<TeamGroup, string> = {
  committee: 'Executive Committee',
  board: 'Board of Trustees',
  mahila: 'Baijuraj Mahila',
  other: 'Leadership',
}

const groupOrder: TeamGroup[] = ['committee', 'board', 'mahila', 'other']

export function TeamGrid({
  members,
  limit,
  grouped = true,
  compact = false,
}: {
  members: TeamMember[]
  limit?: number
  grouped?: boolean
  compact?: boolean
}) {
  const sorted = members.slice().sort((a, b) => a.order - b.order)
  const visible = typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  const activeGroups = groupOrder.filter((g) => sorted.some((m) => m.group === g))

  if (!grouped || typeof limit === 'number') {
    return (
      <div
        className={cn(
          'grid gap-3 sm:gap-4',
          compact
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-3',
        )}
      >
        {visible.map((member) => (
          <TeamCard key={member.id} member={member} compact={compact} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {activeGroups.length > 1 && (
        <div className="snap-row mb-6 flex max-w-full gap-2 pb-1 md:mb-10 md:flex-wrap md:overflow-visible">
          {activeGroups.map((group) => (
            <a
              key={group}
              href={`#team-${group}`}
              className="snap-item shrink-0 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm text-slate transition hover:border-saffron hover:text-night"
            >
              {groupLabels[group]}
            </a>
          ))}
        </div>
      )}

      <div className="space-y-12 md:space-y-16">
        {activeGroups.map((group) => {
          const list = sorted.filter((m) => m.group === group)
          return (
            <section key={group} id={`team-${group}`} className="scroll-mt-28 md:scroll-mt-36">
              <div className="mb-5 flex items-end justify-between gap-3 border-b border-ink/10 pb-3 md:mb-8 md:pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-temple sm:text-xs">
                    Leadership
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-night sm:text-3xl md:text-4xl">
                    {groupLabels[group]}
                  </h3>
                </div>
                <p className="shrink-0 text-sm text-slate">{list.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
                {list.map((member) => (
                  <TeamCard key={member.id} member={member} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function TeamCard({ member, compact }: { member: TeamMember; compact?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(7,19,31,0.06)] sm:rounded-2xl">
      <div className="relative overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className={cn(
            'w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]',
            compact ? 'aspect-[3/4] max-h-56 sm:max-h-none' : 'aspect-[3/4] max-h-64 sm:max-h-72 md:max-h-80',
          )}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/60 to-transparent p-3 pt-14 sm:p-4 sm:pt-16">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-marigold sm:text-[11px] sm:tracking-[0.18em]">
            {member.role}
          </p>
          <h4 className="mt-0.5 font-display text-base leading-tight text-white sm:mt-1 sm:text-xl md:text-2xl">
            {member.name}
          </h4>
        </div>
      </div>
      {!compact && member.bio && (
        <p className="hidden px-4 py-3 text-sm leading-relaxed text-slate sm:block sm:px-5 sm:py-4">
          {member.bio}
        </p>
      )}
    </article>
  )
}
