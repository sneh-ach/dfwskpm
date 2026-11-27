import { Download, ExternalLink, FileText, Headphones, Link2 } from 'lucide-react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { useContentStore } from '../store/contentStore'
import { scriptureLibrary, tartamSagarChapters, tartamSagarIntro } from '../data/tartamSagar'

export function SermonsPage() {
  const resources = useContentStore((s) => s.resources).filter((r) => r.status === 'published')

  return (
    <div>
      <section className="relative overflow-hidden bg-ink px-4 py-10 text-white sm:py-14 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-30 temple-grid" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-deva-display text-xl text-marigold sm:text-2xl md:text-4xl">श्री तर्तम सागर</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl leading-tight sm:mt-3 sm:text-4xl md:text-6xl">
            Scripture library
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-mist/85 sm:mt-5 sm:text-base md:text-lg">
            Tartam Sagar, Meher Sagar, and study texts — prayer, 15 volumes, and PDFs on this site.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a href="#prayer">
              <Button>Opening prayer</Button>
            </a>
            <a href="#chapters">
              <Button variant="ghost">All 15 volumes</Button>
            </a>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-30 border-b border-ink/8 bg-white/95 backdrop-blur sm:top-[4.25rem]">
        <div className="snap-row mx-auto flex max-w-7xl gap-1 px-4 py-2.5 md:px-6 md:py-3">
          {[
            ['#prayer', 'Prayer'],
            ['#chapters', 'Tartam Sagar'],
            ['#meher', 'Meher Sagar'],
            ['#more', 'More texts'],
            ...(resources.length ? [['#uploads', 'Temple files'] as const] : []),
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 rounded-full px-4 py-2 text-sm text-slate hover:bg-paper hover:text-night"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <section id="prayer" className="scroll-mt-28 border-b border-ink/8 bg-paper sm:scroll-mt-36">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:py-14 md:px-6 md:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple sm:text-xs">Main granth</p>
            <h2 className="mt-2 font-display text-3xl text-night sm:text-4xl md:text-5xl">{tartamSagarIntro.title}</h2>
            <p className="mt-1.5 font-deva-display text-xl text-temple sm:mt-2 sm:text-2xl md:text-3xl">श्री स्वरूप साहेब</p>
            <p className="mt-2 text-sm text-slate sm:mt-3 sm:text-base">{tartamSagarIntro.subtitle}</p>

            <blockquote className="mt-6 rounded-2xl border border-saffron/25 bg-white px-4 py-5 sm:mt-10 sm:px-6 sm:py-7 md:px-8 md:py-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-saffron">Opening prayer</p>
              <div className="mt-4 space-y-2.5 font-deva-serif text-[1.15rem] leading-[1.75] text-night sm:mt-5 sm:space-y-3 sm:text-[1.35rem] md:text-[1.55rem] md:leading-[1.85]">
                {tartamSagarIntro.prayer.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </blockquote>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate sm:mt-8 sm:space-y-5 sm:text-base md:text-lg">
              {tartamSagarIntro.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate">Also known as: {tartamSagarIntro.alsoKnownAs.join(' · ')}</p>
            <p className="mt-2 text-sm text-slate/70">
              Reference: {tartamSagarIntro.reference}. Source:{' '}
              <a
                href={tartamSagarIntro.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-saffron hover:underline"
              >
                pranami.org/tartam-sagar
              </a>
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-ink/8 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-temple">Quick open</p>
            <h3 className="mt-2 font-display text-2xl text-night">15 local PDFs</h3>
            <p className="mt-3 text-sm text-slate">Open in the browser or download — files stay on DFWSKPM.</p>
            <a href="#chapters" className="mt-6 inline-block w-full">
              <Button className="w-full">Browse chapters</Button>
            </a>
            <a href={scriptureLibrary.meherSagar.localPdf} className="mt-3 block">
              <Button variant="line" className="w-full justify-between">
                Meher Sagar PDF <Download className="h-4 w-4" />
              </Button>
            </a>
            <div className="mt-8 grid grid-cols-5 gap-2">
              {tartamSagarChapters.map((c) => (
                <a
                  key={c.number}
                  href={`#chapter-${c.number}`}
                  className="rounded-lg bg-paper py-2 text-center text-xs font-medium text-slate hover:bg-saffron/15 hover:text-night"
                >
                  {c.number}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="chapters" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:scroll-mt-36 sm:py-14 md:px-6 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <SectionHeading
            eyebrow="Tartam Sagar"
            title="All 15 volumes"
            subtitle="English title with Devanagari — open or download each PDF."
          />
          <p className="text-sm text-slate">{tartamSagarChapters.length} PDFs ready</p>
        </div>

        <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {tartamSagarChapters.map((chapter) => (
            <div
              id={`chapter-${chapter.number}`}
              key={chapter.number}
              className="scroll-mt-32 flex flex-col rounded-xl border border-ink/8 bg-white p-4 shadow-[0_8px_24px_rgba(7,19,31,0.04)] sm:scroll-mt-40 sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-base text-marigold sm:h-11 sm:w-11 sm:rounded-xl sm:text-lg">
                  {chapter.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-night sm:text-xl">{chapter.title}</p>
                  <p className="mt-0.5 font-deva text-base text-temple sm:mt-1 sm:text-lg">{chapter.titleDeva}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-5">
                <a
                  href={chapter.file}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-saffron px-3 py-2.5 text-sm font-medium text-night hover:bg-marigold"
                >
                  <FileText className="h-4 w-4" /> Open
                </a>
                <a
                  href={chapter.file}
                  download
                  className="inline-flex items-center justify-center rounded-md border border-ink/15 px-3 py-2.5 text-sm text-ink hover:border-saffron"
                  aria-label={`Download ${chapter.title}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="meher" className="scroll-mt-36 bg-paper">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink/8 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-temple">Meher Sagar</p>
            <h3 className="mt-2 font-display text-3xl text-night">{scriptureLibrary.meherSagar.title}</h3>
            <p className="mt-1 font-deva-display text-2xl text-temple">मेहर सागर</p>
            <p className="mt-3 text-slate">{scriptureLibrary.meherSagar.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={scriptureLibrary.meherSagar.localPdf} target="_blank" rel="noreferrer">
                <Button>
                  <FileText className="h-4 w-4" /> Open local PDF
                </Button>
              </a>
              <a href={scriptureLibrary.meherSagar.onlineUrl} target="_blank" rel="noreferrer">
                <Button variant="line">
                  Read online <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div id="more" className="scroll-mt-36 rounded-2xl border border-ink/8 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-temple">More scripture</p>
            <h3 className="mt-2 font-display text-3xl text-night">Related texts</h3>
            <p className="mt-3 text-sm text-slate">Linked from pranami.org for further study.</p>
            <ul className="mt-5 space-y-2">
              {scriptureLibrary.related.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-night hover:text-saffron"
                  >
                    {item.title} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {resources.length > 0 && (
        <section id="uploads" className="mx-auto max-w-7xl scroll-mt-36 px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="Temple library"
            title="More from our collection"
            subtitle="Additional flyers and study files shared by the mandir."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {resources.map((res) => {
              const Icon = res.type === 'pdf' ? FileText : res.type === 'audio' ? Headphones : Link2
              return (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-ink/8 bg-white p-5 transition hover:border-saffron"
                >
                  <span className="rounded-xl bg-temple/10 p-3 text-temple">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-xs uppercase tracking-wider text-temple">{res.category}</span>
                    <span className="mt-1 block font-display text-xl text-night">{res.title}</span>
                    <span className="mt-1 block text-sm text-slate">{res.description}</span>
                  </span>
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-saffron" />
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
