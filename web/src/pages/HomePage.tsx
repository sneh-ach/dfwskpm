import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CalendarDays, Heart, MapPin, Phone } from 'lucide-react'
import { useContentStore } from '../store/contentStore'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { SnapRow } from '../components/ui/SnapRow'
import { TeamGrid } from '../components/team/TeamGrid'
import { SocialConnect } from '../components/social/SocialConnect'
import { formatDate, formatTime } from '../lib/utils'
import { isPublic } from '../lib/memberFilters'

export function HomePage() {
  const { settings, events, news, team, schedule } = useContentStore()
  const upcoming = events
    .filter((e) => isPublic(e.status) && new Date(e.end) > new Date())
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
  const featuredEvent = upcoming[0]
  const featuredNews = news
    .filter((n) => isPublic(n.status))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3)
  const publicTeam = team.filter((t) => isPublic(t.status))
  const publicSchedule = schedule.filter((s) => isPublic(s.status))
  const donatePct = Math.min(
    100,
    Math.round((settings.donateRaised / Math.max(settings.donateGoal, 1)) * 100),
  )

  return (
    <div>
      {/* HERO — one composition, shorter on phone so content follows quickly */}
      <section className="relative min-h-[68svh] overflow-hidden bg-night text-white sm:min-h-[78svh] md:min-h-[88svh]">
        <img
          src={settings.heroImage || '/img/shatsang.jpg'}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center brightness-[0.72] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-night/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-night/35 to-night/80" />

        <div className="relative mx-auto flex min-h-[68svh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[78svh] sm:py-20 md:min-h-[88svh] md:px-6 md:py-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-semibold tracking-[0.28em] uppercase text-marigold drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-xs sm:tracking-[0.3em]"
          >
            Hurst, Texas · Pranami Mandir
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-[clamp(1.85rem,7.5vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-balance text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.75)] sm:mt-5"
          >
            {settings.templeName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xl text-sm text-white/95 sm:mt-5 sm:text-base md:text-lg drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
          >
            {settings.tagline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 flex flex-wrap justify-center gap-2.5 sm:mt-9 sm:gap-3"
          >
            <Link to="/events">
              <Button size="lg">See events</Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="ghost">
                Household signup
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Visit bar — horizontal snap on phone, 3-col on laptop */}
      <section className="overflow-x-clip border-b border-ink/8 bg-white">
        <div className="mx-auto max-w-7xl md:grid md:grid-cols-3 md:divide-x md:divide-ink/8">
          <SnapRow className="md:contents">
            <div className="snap-item w-[min(78vw,20rem)] shrink-0 border-r border-ink/8 px-4 py-4 md:w-auto md:max-w-none md:shrink md:border-r-0 md:px-6 md:py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple">
                {settings.showOpenNow ? 'Open now' : 'Visit'}
              </p>
              <p className="mt-1 font-display text-lg text-night sm:text-xl">
                {settings.showOpenNow ? settings.openNowLabel : 'Welcome to the mandir'}
              </p>
              <p className="mt-1 text-sm text-slate">
                {settings.showOpenNow ? settings.openNowDetail : publicSchedule[0]?.time}
              </p>
            </div>
            <div className="snap-item flex w-[min(78vw,20rem)] shrink-0 items-start gap-3 border-r border-ink/8 px-4 py-4 md:w-auto md:max-w-none md:shrink md:border-r-0 md:px-6 md:py-5">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-saffron" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple">Address</p>
                <p className="mt-1 text-sm leading-relaxed text-night">{settings.address}</p>
              </div>
            </div>
            <div className="snap-item flex w-[min(78vw,20rem)] shrink-0 items-start gap-3 px-4 py-4 md:w-auto md:max-w-none md:shrink md:px-6 md:py-5">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-saffron" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple">Contact</p>
                <p className="mt-1 text-sm text-night">{settings.phone}</p>
                <p className="truncate text-sm text-slate">{settings.email}</p>
              </div>
            </div>
          </SnapRow>
        </div>
      </section>

      {/* Next event — compact on phone */}
      {featuredEvent && (
        <section className="overflow-x-clip bg-ink text-white">
          <div className="mx-auto grid max-w-7xl min-w-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="relative min-h-[200px] min-w-0 overflow-hidden sm:min-h-[280px] lg:min-h-[400px]">
              <img
                src={featuredEvent.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            </div>
            <div className="flex min-w-0 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-marigold sm:text-xs sm:tracking-[0.24em]">
                Next gathering
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight sm:mt-3 sm:text-4xl md:text-5xl">
                {featuredEvent.title}
              </h2>
              <p className="mt-3 text-sm text-mist/80 sm:mt-4 sm:text-base">
                {formatDate(featuredEvent.start)}
                <br />
                {formatTime(featuredEvent.start)} – {formatTime(featuredEvent.end)}
              </p>
              <p className="mt-1.5 text-sm text-mist/65">{featuredEvent.location}</p>
              <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                <Link to={`/events/${featuredEvent.id}`}>
                  <Button>Event details</Button>
                </Link>
                <Link to="/calendar">
                  <Button variant="ghost">
                    <CalendarDays className="h-4 w-4" /> Calendar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About + schedule */}
      <section className="section-y mx-auto max-w-7xl overflow-x-clip px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our Mandir"
              title="A home for devotion in DFW"
              subtitle={settings.aboutText[0]}
            />
            <Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-saffron sm:mt-8">
              About & leadership <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="/img/lineage_35.jpg"
              alt="Sacred lineage"
              className="aspect-[16/10] w-full object-cover sm:aspect-[5/4]"
            />
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <SnapRow bleed className="md:grid md:grid-cols-3 md:gap-px md:overflow-hidden md:rounded-2xl md:border md:border-ink/10 md:bg-ink/10">
            {publicSchedule.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="snap-item w-[min(78vw,20rem)] shrink-0 rounded-2xl border border-ink/10 bg-white px-5 py-5 md:w-auto md:max-w-none md:shrink md:rounded-none md:border-0 md:px-6 md:py-7"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple">{item.day}</p>
                <p className="mt-2 font-display text-xl text-night sm:mt-3 sm:text-2xl">{item.title}</p>
                <p className="mt-1.5 text-sm text-slate sm:mt-2">{item.time}</p>
                {item.note && <p className="mt-1.5 text-sm text-slate/75 sm:mt-2">{item.note}</p>}
              </div>
            ))}
          </SnapRow>
        </div>
      </section>

      {/* Events — swipe on phone, grid on laptop */}
      <section className="section-y overflow-x-clip bg-[#0c1826] text-white">
        <div className="mx-auto max-w-7xl overflow-x-clip px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading
              light
              eyebrow="Gather"
              title="Upcoming events"
              subtitle="Satsang, festivals, and celebrations."
            />
            <Link to="/events" className="inline-flex items-center gap-1 text-sm text-marigold">
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-10">
            <SnapRow bleed className="md:grid md:grid-cols-2 md:gap-5">
              {upcoming.slice(0, 2).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="snap-item group relative h-[260px] w-[min(82vw,24rem)] shrink-0 overflow-hidden rounded-2xl md:h-[340px] md:w-auto md:max-w-none md:shrink"
                >
                  <img
                    src={event.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-sm text-marigold">{formatDate(event.start)}</p>
                    <h3 className="mt-1.5 font-display text-2xl sm:text-3xl">{event.title}</h3>
                    <p className="mt-1.5 max-w-md text-sm text-mist/80 line-clamp-2">{event.description}</p>
                  </div>
                </Link>
              ))}
            </SnapRow>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="section-y mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading
            eyebrow="News"
            title="Latest from the mandir"
            subtitle="Newest stories first — older posts live in the archive."
          />
          <Link to="/news" className="inline-flex items-center gap-1 text-sm font-medium text-saffron">
            News & archive <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredNews[0] && (
          <div className="mt-7 grid gap-6 sm:mt-10 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
            <Link
              to={`/news/${featuredNews[0].id}`}
              className="group relative min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[300px] lg:min-h-[360px]"
            >
              <img
                src={featuredNews[0].image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <p className="text-[11px] uppercase tracking-[0.2em] text-marigold sm:text-xs">
                  {featuredNews[0].category}
                </p>
                <h3 className="mt-1.5 font-display text-2xl sm:mt-2 sm:text-3xl md:text-4xl">
                  {featuredNews[0].title}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-mist/85 line-clamp-2 sm:mt-3">
                  {featuredNews[0].excerpt}
                </p>
              </div>
            </Link>

            <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
              {featuredNews.slice(1).map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className="group flex gap-3 py-4 sm:gap-4 sm:py-5">
                  <img
                    src={item.image}
                    alt=""
                    className="h-20 w-24 shrink-0 rounded-xl object-cover sm:h-24 sm:w-28"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-temple">{item.category}</p>
                    <h3 className="mt-1 font-display text-lg text-night group-hover:text-saffron sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate line-clamp-2">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
              <Link to="/news#archive" className="py-4 text-sm font-medium text-saffron sm:py-5">
                Browse archive →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Team */}
      <section className="section-y border-y border-ink/8 bg-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading
              eyebrow="Leadership"
              title="Meet our team"
              subtitle="Serving the community with devotion and care."
            />
            <Link to="/about#team">
              <Button variant="line">
                Full team <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 sm:mt-10">
            <TeamGrid members={publicTeam} limit={4} compact />
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="section-y overflow-x-clip bg-temple text-white">
        <div className="mx-auto max-w-7xl overflow-x-clip px-4 md:px-6">
          <div className="grid min-w-0 gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-marigold sm:text-xs sm:tracking-[0.28em]">
                Scripture
              </p>
              <p className="mt-2 font-deva-display text-xl text-marigold sm:mt-3 sm:text-2xl md:text-3xl">
                श्री तर्तम सागर
              </p>
              <h2 className="mt-1.5 font-display text-3xl text-balance sm:mt-2 sm:text-4xl md:text-5xl">
                Shri Tartam Sagar
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/85 sm:mt-4 sm:text-base">
                The main granth of Shri Krishna Pranami Dharma — 15 volumes with PDFs hosted here for families.
              </p>
              <Link to="/sermons" className="mt-5 inline-block sm:mt-8">
                <Button size="lg">
                  <BookOpen className="h-4 w-4" /> Browse all chapters
                </Button>
              </Link>
            </div>
            <SnapRow bleed className="min-w-0 md:grid md:grid-cols-2 md:gap-3">
              {['Shri Raas', 'Shri Prakash', 'Shri Kalash', 'Meher Sagar'].map((label) => (
                <Link
                  key={label}
                  to="/sermons"
                  className="snap-item w-[min(70vw,14rem)] shrink-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-5 md:w-auto md:max-w-none md:shrink md:px-5 md:py-6"
                >
                  <p className="font-display text-lg sm:text-xl">{label}</p>
                  <p className="mt-1.5 text-sm text-white/70">Open in library</p>
                </Link>
              ))}
            </SnapRow>
          </div>
        </div>
      </section>

      {/* Donate */}
      <section className="section-y bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 overflow-hidden rounded-2xl bg-ink p-5 text-white sm:gap-8 sm:rounded-[1.75rem] sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-marigold sm:text-xs sm:tracking-[0.24em]">
                Seva
              </p>
              <h2 className="mt-2 font-display text-3xl sm:mt-3 sm:text-4xl md:text-5xl">Support the mandir</h2>
              <p className="mt-3 max-w-md text-sm text-mist/80 sm:mt-4 sm:text-base">
                Your donation sustains satsang, facilities, and community programs for Pranami families across DFW.
              </p>
              <Link to="/donate" className="mt-5 inline-block sm:mt-8">
                <Button size="lg">
                  <Heart className="h-4 w-4" /> Donate now
                </Button>
              </Link>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <p className="text-sm text-mist/70">Campaign progress</p>
              <p className="mt-1.5 font-display text-3xl sm:mt-2 sm:text-4xl">
                ${settings.donateRaised.toLocaleString()}
                <span className="ml-2 text-base text-mist/60 sm:text-lg">raised</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10 sm:mt-6 sm:h-2.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-saffron to-marigold"
                  style={{ width: `${donatePct}%` }}
                />
              </div>
              <p className="mt-2.5 text-sm text-mist/65 sm:mt-3">
                Goal ${settings.donateGoal.toLocaleString()} · {donatePct}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <SocialConnect />
    </div>
  )
}
