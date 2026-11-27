import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useContentStore } from '../../store/contentStore'

function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!target) return null
  const diff = Math.max(0, new Date(target).getTime() - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return { days, hours, mins, secs }
}

export function UpcomingBanner() {
  const events = useContentStore((s) => s.events)
  const next = useMemo(() => {
    return events
      .filter((e) => e.status === 'published' && new Date(e.start).getTime() > Date.now())
      .sort((a, b) => +new Date(a.start) - +new Date(b.start))[0]
  }, [events])

  const countdown = useCountdown(next?.start ?? null)
  if (!next || !countdown) return null

  return (
    <div className="hidden border-b border-white/10 bg-[#050d16] text-mist lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2 text-[13px]">
        <p className="truncate">
          <span className="text-marigold">Next:</span> {next.title}
        </p>
        <div className="flex items-center gap-3 font-medium tabular-nums">
          <span>{countdown.days}d</span>
          <span>{countdown.hours}h</span>
          <span>{countdown.mins}m</span>
          <span>{countdown.secs}s</span>
          <Link to="/events" className="ml-1 text-saffron hover:text-marigold">
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}
