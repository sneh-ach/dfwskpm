import { SectionHeading } from '../components/ui/SectionHeading'
import { TeamGrid } from '../components/team/TeamGrid'
import { useContentStore } from '../store/contentStore'

const tenets = [
  { hi: 'सत्य', en: 'Satya', meaning: 'Truth' },
  { hi: 'अहिंसा', en: 'Ahimsa', meaning: 'Non-violence' },
  { hi: 'शौच', en: 'Shauch', meaning: 'Purity' },
  { hi: 'क्षमा', en: 'Kshama', meaning: 'Forgiveness' },
  { hi: 'दया', en: 'Daya', meaning: 'Compassion' },
  { hi: 'स्वाध्याय', en: 'Swadhyaya', meaning: 'Self-study' },
]

export function AboutPage() {
  const { settings, team } = useContentStore()
  const publicTeam = team.filter((t) => t.status === 'published')

  return (
    <div>
      <section className="relative overflow-hidden bg-ink px-4 py-12 text-white sm:py-16 md:px-6 md:py-20">
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/img/images-removebg-preview.png"
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/40 sm:h-14 sm:w-14"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-marigold">About us</p>
            </div>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {settings.templeName}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-mist/85 sm:text-base md:text-lg">{settings.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-2 sm:gap-3">
              <a
                href="#story"
                className="rounded-full bg-saffron px-4 py-2.5 text-sm font-medium text-night hover:bg-marigold sm:px-5"
              >
                Our story
              </a>
              <a
                href="#team"
                className="rounded-full border border-white/20 px-4 py-2.5 text-sm text-white hover:border-marigold hover:text-marigold sm:px-5"
              >
                Meet the team
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:py-16 md:scroll-mt-28 md:px-6 md:py-20">
        <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <SectionHeading
              eyebrow="Our mandir"
              title="A home for devotion in DFW"
              subtitle="Rooted in Tartam and open to every seeker."
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate sm:mt-8 sm:space-y-5 sm:text-lg">
              {settings.aboutText.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>
                The Pranami faith accepts the basic tenets of Hinduism and aspires toward universal peace through
                Tartam.
              </p>
            </div>
          </div>

          <figure className="order-1 mx-auto w-full max-w-sm lg:order-2 lg:mx-0 lg:max-w-none">
            <div className="overflow-hidden rounded-2xl glow-ring">
              <img
                src="/img/rajshyama_ji.jpeg"
                alt="Shri Rajshyamaji"
                className="aspect-[4/5] w-full object-cover object-top max-h-[420px] sm:max-h-[480px] lg:max-h-[520px]"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-slate lg:text-left">
              Shri Rajshyamaji Maharaj
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 sm:mt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-temple">Core tenets</p>
          <h2 className="mt-2 font-display text-2xl text-night sm:text-3xl">Living values</h2>
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3 md:grid-cols-3">
            {tenets.map((t) => (
              <div key={t.en} className="rounded-xl border border-ink/8 bg-white px-3.5 py-4 sm:rounded-2xl sm:px-5 sm:py-5">
                <p className="font-deva-display text-xl text-temple sm:text-2xl md:text-3xl">{t.hi}</p>
                <p className="mt-1.5 font-display text-lg text-night sm:mt-2 sm:text-xl">{t.en}</p>
                <p className="mt-1 text-xs text-slate sm:text-sm">{t.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="scroll-mt-24 border-t border-ink/8 bg-paper temple-grid px-4 py-12 sm:py-16 md:scroll-mt-28 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Seva leadership"
            title="Meet the full team"
            subtitle="Committee, board, and Baijuraj Mahila — every role in one place."
          />
          <div className="mt-8 sm:mt-12">
            <TeamGrid members={publicTeam} grouped />
          </div>
        </div>
      </section>
    </div>
  )
}
