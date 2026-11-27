import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { useContentStore } from '../store/contentStore'
import { cn, formatDate, formatTime } from '../lib/utils'

export function CalendarPage() {
  const events = useContentStore((s) => s.events).filter((e) => e.status === 'published')
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('event')

  const focused = events.find((e) => e.id === focusId)
  const [cursor, setCursor] = useState(() => (focused ? new Date(focused.start) : new Date()))
  const [selected, setSelected] = useState(() => (focused ? new Date(focused.start) : new Date()))
  const [activeId, setActiveId] = useState<string | null>(focusId)

  useEffect(() => {
    if (!focused) return
    const day = new Date(focused.start)
    setCursor(day)
    setSelected(day)
    setActiveId(focused.id)
  }, [focused])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const dayEvents = (day: Date) => events.filter((e) => isSameDay(new Date(e.start), day))
  const selectedEvents = dayEvents(selected)
  const active = events.find((e) => e.id === activeId) || selectedEvents[0] || null

  return (
    <div className="mx-auto max-w-7xl overflow-x-clip px-4 py-8 sm:py-12 md:px-6 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <SectionHeading
          eyebrow="Calendar"
          title="See everything happening"
          subtitle="Pick a day, open an event, and read the full details."
        />
        <Link to="/events">
          <Button variant="line">List view</Button>
        </Link>
      </div>

      <div className="mt-10 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-ink/8 bg-white p-3 sm:p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
            <h3 className="min-w-0 font-display text-xl sm:text-2xl">{format(cursor, 'MMMM yyyy')}</h3>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="line" onClick={() => setCursor((d) => subMonths(d, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="line"
                onClick={() => {
                  const today = new Date()
                  setCursor(today)
                  setSelected(today)
                }}
              >
                Today
              </Button>
              <Button size="sm" variant="line" onClick={() => setCursor((d) => addMonths(d, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate/60 sm:gap-1 sm:text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="py-1.5 sm:py-2">
                <span className="sm:hidden">{d}</span>
                <span className="hidden sm:inline">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((day) => {
              const list = dayEvents(day)
              const inMonth = isSameMonth(day, cursor)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelected(day)
                    if (list[0]) {
                      setActiveId(list[0].id)
                      setSearchParams({ event: list[0].id })
                    } else {
                      setActiveId(null)
                      setSearchParams({})
                    }
                  }}
                  className={cn(
                    'min-h-12 min-w-0 overflow-hidden rounded-lg border p-1 text-left transition sm:min-h-20 sm:rounded-xl sm:p-2',
                    isSameDay(day, selected) ? 'border-saffron bg-saffron/10' : 'border-transparent hover:bg-paper',
                    !inMonth && 'opacity-35',
                  )}
                >
                  <span className="text-xs font-medium sm:text-sm">{format(day, 'd')}</span>
                  <div className="mt-0.5 hidden space-y-1 sm:mt-1 sm:block">
                    {list.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={cn(
                          'truncate rounded px-1.5 py-0.5 text-[10px]',
                          e.id === activeId ? 'bg-saffron text-night' : 'bg-temple/12 text-temple',
                        )}
                      >
                        {e.title}
                      </div>
                    ))}
                    {list.length > 2 && <p className="text-[10px] text-slate">+{list.length - 2} more</p>}
                  </div>
                  {list.length > 0 && (
                    <div className="mt-1 flex justify-center gap-0.5 sm:hidden">
                      {list.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            'h-1 w-1 rounded-full',
                            e.id === activeId ? 'bg-saffron' : 'bg-temple/60',
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-marigold">Selected day</p>
            <h3 className="mt-2 font-display text-3xl">{format(selected, 'MMMM d, yyyy')}</h3>
            <div className="mt-5 space-y-2">
              {selectedEvents.length === 0 && <p className="text-mist/70">No events on this day.</p>}
              {selectedEvents.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setActiveId(e.id)
                    setSearchParams({ event: e.id })
                  }}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition',
                    e.id === activeId
                      ? 'border-marigold/50 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25',
                  )}
                >
                  <p className="font-display text-xl">{e.title}</p>
                  <p className="mt-1 text-sm text-mist/70">
                    {formatTime(e.start)} – {formatTime(e.end)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {active ? (
            <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
              <img src={active.image} alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-temple">Event details</p>
                <h4 className="mt-2 font-display text-2xl text-night">{active.title}</h4>
                <p className="mt-2 text-sm text-slate">
                  {formatDate(active.start)} · {formatTime(active.start)} – {formatTime(active.end)}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate">
                  <MapPin className="h-4 w-4 text-saffron" /> {active.location}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate line-clamp-4">{active.description}</p>
                <Link to={`/events/${active.id}`} className="mt-5 inline-block">
                  <Button>Read full details</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-paper p-6 text-sm text-slate">
              Select a day with an event to preview details here.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
