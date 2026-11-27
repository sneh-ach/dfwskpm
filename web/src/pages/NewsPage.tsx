import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { useContentStore } from '../store/contentStore'
import { cn, formatDate } from '../lib/utils'

const FEATURED_COUNT = 3

export function NewsPage() {
  const all = useContentStore((s) => s.news)
    .filter((n) => n.status === 'published')
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

  const categories = useMemo(() => {
    const set = new Set(all.map((n) => n.category))
    return ['All', ...Array.from(set)]
  }, [all])

  const [category, setCategory] = useState('All')
  const filtered = category === 'All' ? all : all.filter((n) => n.category === category)
  const hero = filtered[0]
  const featured = filtered.slice(0, FEATURED_COUNT)
  const archive = filtered.slice(FEATURED_COUNT)

  return (
    <div>
      <section className="bg-ink px-4 py-10 text-white sm:py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            light
            eyebrow="News"
            title="Announcements & updates"
            subtitle="Temple stories, festival recaps, and community notes."
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-6 md:py-14">
        <div className="snap-row flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                'snap-item shrink-0 rounded-full px-3.5 py-2 text-sm transition sm:px-4',
                category === c
                  ? 'bg-ink text-white'
                  : 'bg-white text-slate ring-1 ring-ink/10 hover:text-night',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {hero ? (
          <section className="mt-6 sm:mt-10">
            <Link
              to={`/news/${hero.id}`}
              className="group relative grid min-h-0 overflow-hidden rounded-2xl bg-night sm:rounded-[1.5rem] lg:min-h-[380px] lg:grid-cols-[1.35fr_0.9fr]"
            >
              <div className="relative min-h-[180px] sm:min-h-[240px] lg:min-h-full">
                <img
                  src={hero.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent lg:hidden" />
              </div>
              <div className="relative flex flex-col justify-end p-5 text-white sm:p-7 md:p-10">
                <p className="text-[11px] uppercase tracking-[0.2em] text-marigold sm:text-xs sm:tracking-[0.22em]">
                  {hero.category}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight sm:mt-3 sm:text-3xl md:text-5xl">
                  {hero.title}
                </h2>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-mist/85 sm:mt-4 md:text-base">
                  {hero.excerpt}
                </p>
                <p className="mt-4 text-xs text-mist/60 sm:mt-6">
                  {formatDate(hero.publishedAt)} · {hero.author}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-marigold sm:mt-6">
                  Read story <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {featured.length > 1 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {featured.slice(1).map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="group flex gap-4 overflow-hidden rounded-2xl border border-ink/8 bg-white p-4 transition hover:border-saffron/40"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-28 w-32 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 py-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-temple">{item.category}</p>
                      <h3 className="mt-1 font-display text-xl text-night group-hover:text-saffron">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate line-clamp-2">{item.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="mt-12 rounded-2xl border border-dashed border-slate/30 bg-white p-10 text-center text-slate">
            No news in this category yet.
          </p>
        )}

        <section id="archive" className="mt-20 scroll-mt-28">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-temple">Archive</p>
              <h3 className="mt-1 font-display text-3xl text-night">Older stories</h3>
            </div>
            <p className="text-sm text-slate">{archive.length}</p>
          </div>

          {archive.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate/25 bg-white/60 p-8 text-slate">
              As more stories are published, older ones will move here automatically.
            </p>
          ) : (
            <div className="divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white">
              {archive.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="flex flex-col gap-4 p-5 transition hover:bg-paper sm:flex-row sm:items-center"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-temple">{item.category}</p>
                    <h4 className="mt-1 font-display text-xl text-night">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate line-clamp-1">{item.excerpt}</p>
                  </div>
                  <p className="shrink-0 text-xs text-slate/70 sm:text-right">
                    {formatDate(item.publishedAt, {
                      weekday: undefined,
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
