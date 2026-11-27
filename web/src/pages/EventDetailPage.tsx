import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock3, MapPin, User } from 'lucide-react'
import { useContentStore } from '../store/contentStore'
import { Button } from '../components/ui/Button'
import { formatDate, formatTime } from '../lib/utils'

export function EventDetailPage() {
  const { id } = useParams()
  const events = useContentStore((s) => s.events)
  const event = events.find((e) => e.id === id && e.status === 'published')

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Event not found</h1>
        <p className="mt-3 text-slate">It may have been unpublished or the link is outdated.</p>
        <Link to="/events" className="mt-6 inline-block">
          <Button variant="line">Back to events</Button>
        </Link>
      </div>
    )
  }

  const related = events
    .filter((e) => e.status === 'published' && e.id !== event.id && +new Date(e.end) >= Date.now())
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 3)

  return (
    <article>
      <section className="relative min-h-[48svh] overflow-hidden bg-night text-white md:min-h-[56svh]">
        <img
          src={event.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[0.68]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/25" />
        <div className="relative mx-auto flex min-h-[48svh] max-w-5xl flex-col justify-end px-4 py-14 md:min-h-[56svh] md:px-6 md:py-20">
          <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-sm text-mist/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All events
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-marigold">Event details</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-6xl">{event.title}</h1>
          <p className="mt-4 text-mist/85">
            {formatDate(event.start, { weekday: 'long' })} · {formatTime(event.start)} – {formatTime(event.end)}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-6 md:py-16">
        <div>
          <h2 className="font-display text-3xl text-night">About this gathering</h2>
          <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-slate">{event.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/calendar">
              <Button variant="line">
                <CalendarDays className="h-4 w-4" /> View on calendar
              </Button>
            </Link>
            <Link to="/contact">
              <Button>Ask a question</Button>
            </Link>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-ink/8 bg-white p-6">
          <DetailRow icon={Clock3} label="When" value={`${formatDate(event.start)}\n${formatTime(event.start)} – ${formatTime(event.end)}`} />
          <DetailRow icon={MapPin} label="Where" value={event.location} />
          <DetailRow icon={User} label="Host" value={event.host} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-ink/8 bg-paper px-4 py-14 md:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl text-night">More upcoming</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/events/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-ink/8 bg-white transition hover:border-saffron/40"
                >
                  <img src={item.image} alt="" className="aspect-[16/10] w-full object-cover" />
                  <div className="p-4">
                    <p className="text-xs text-temple">{formatDate(item.start, { weekday: 'short' })}</p>
                    <h3 className="mt-1 font-display text-xl text-night group-hover:text-saffron">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 border-b border-ink/8 pb-4 last:border-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-temple">{label}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-night">{value}</p>
      </div>
    </div>
  )
}
