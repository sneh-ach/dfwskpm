import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, User } from 'lucide-react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { useContentStore } from '../store/contentStore'
import { formatDate, formatTime } from '../lib/utils'

export function EventsPage() {
  const now = Date.now()
  const all = useContentStore((s) => s.events)
    .filter((e) => e.status === 'published')
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))

  const upcoming = all.filter((e) => +new Date(e.end) >= now)
  const past = all.filter((e) => +new Date(e.end) < now).reverse()
  const featured = upcoming[0]

  return (
    <div>
      {featured ? (
        <section className="relative min-h-[42svh] overflow-hidden bg-night text-white sm:min-h-[48svh] md:min-h-[56svh]">
          <img
            src={featured.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/70 to-night/35" />
          <div className="relative mx-auto flex min-h-[42svh] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[48svh] sm:py-14 md:min-h-[56svh] md:px-6 md:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-marigold sm:text-xs sm:tracking-[0.28em]">
              Next gathering
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl leading-tight sm:mt-3 sm:text-4xl md:text-6xl">
              {featured.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-mist/85 sm:mt-4 sm:text-base">
              {formatDate(featured.start, { weekday: 'long' })} · {formatTime(featured.start)} –{' '}
              {formatTime(featured.end)}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-mist/70 sm:mt-2">
              <MapPin className="h-4 w-4 text-saffron" /> {featured.location}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <a href="#upcoming">
                <Button>All upcoming</Button>
              </a>
              <Link to="/calendar">
                <Button variant="ghost">
                  <CalendarDays className="h-4 w-4" /> Calendar
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-ink px-4 py-10 text-white sm:py-14 md:px-6 md:py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              light
              eyebrow="Events"
              title="Temple gatherings"
              subtitle="Satsang, festivals, and community celebrations."
            />
          </div>
        </section>
      )}

      <div className="sticky top-14 z-30 border-b border-ink/8 bg-white/95 backdrop-blur sm:top-[4.25rem]">
        <div className="snap-row mx-auto flex max-w-7xl gap-1 px-4 py-2.5 md:px-6 md:py-3">
          {[
            { href: '#upcoming', label: `Upcoming (${upcoming.length})` },
            { href: '#past', label: `Recent (${past.length})` },
            { href: '/calendar', label: 'Calendar view', link: true },
          ].map((item) =>
            item.link ? (
              <Link
                key={item.href}
                to={item.href}
                className="shrink-0 rounded-full px-4 py-2 text-sm text-slate hover:bg-paper hover:text-night"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-4 py-2 text-sm text-slate hover:bg-paper hover:text-night"
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-6 md:py-16">
        <section id="upcoming" className="scroll-mt-28 sm:scroll-mt-36">
          <SectionHeading
            eyebrow="Upcoming"
            title="What's next at the mandir"
            subtitle="Dates, times, and locations for every published gathering."
          />

          {upcoming.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate/30 bg-white p-8 text-center text-sm text-slate sm:mt-10 sm:p-10">
              No upcoming events right now. Check back soon, or browse the calendar.
            </p>
          ) : (
            <div className="mt-6 space-y-3 sm:mt-10 sm:space-y-4">
              {upcoming.map((event) => {
                const day = new Date(event.start)
                return (
                  <article
                    key={event.id}
                    className="grid overflow-hidden rounded-2xl border border-ink/8 bg-white md:grid-cols-[200px_1fr]"
                  >
                    <div className="relative min-h-[140px] sm:min-h-[180px] md:min-h-full">
                      <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5 md:flex-row md:items-start md:gap-8 md:p-7">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-ink text-white sm:h-[4.5rem] sm:w-[4.5rem]">
                        <span className="font-display text-xl leading-none sm:text-2xl">{day.getDate()}</span>
                        <span className="mt-0.5 text-[10px] uppercase tracking-wider text-marigold">
                          {day.toLocaleString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-2xl text-night md:text-3xl">{event.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4 text-saffron" />
                            {formatDate(event.start, { weekday: 'short' })} · {formatTime(event.start)} –{' '}
                            {formatTime(event.end)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-saffron" /> {event.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-4 w-4 text-saffron" /> {event.host}
                          </span>
                        </div>
                        <p className="mt-4 max-w-3xl leading-relaxed text-slate line-clamp-3">{event.description}</p>
                        <Link to={`/events/${event.id}`} className="mt-5 inline-block">
                          <Button size="sm" variant="line">
                            Read full details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section id="past" className="mt-12 scroll-mt-28 sm:mt-16 sm:scroll-mt-36 md:mt-20">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-3 sm:mb-8 sm:gap-4 sm:pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple sm:text-xs">Recent</p>
              <h2 className="mt-1 font-display text-2xl text-night sm:text-3xl">Past gatherings</h2>
            </div>
            <p className="text-sm text-slate">{past.length} listed</p>
          </div>

          {past.length === 0 ? (
            <p className="text-slate">Past events will appear here after they finish.</p>
          ) : (
            <div className="divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white">
              {past.map((event) => (
                <div key={event.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <img
                    src={event.image}
                    alt=""
                    className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl text-night">{event.title}</h3>
                    <p className="mt-1 text-sm text-slate">
                      {formatDate(event.start)} · {event.location}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs uppercase tracking-wider text-slate/60">Completed</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
