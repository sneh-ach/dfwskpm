import { Heart, QrCode, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { useContentStore } from '../store/contentStore'

const impact = [
  {
    icon: Sparkles,
    title: 'Satsang & festivals',
    body: 'Keeps weekly satsang, kirtan, and festival celebrations welcoming for every family.',
  },
  {
    icon: Users,
    title: 'Community programs',
    body: 'Supports youth, women’s seva, and gatherings that strengthen DFW Pranami bonds.',
  },
  {
    icon: ShieldCheck,
    title: 'Temple care',
    body: 'Helps maintain the mandir space, utilities, and day-to-day needs of the temple.',
  },
]

export function DonatePage() {
  const settings = useContentStore((s) => s.settings)
  const pct = Math.min(100, Math.round((settings.donateRaised / Math.max(settings.donateGoal, 1)) * 100))
  const remaining = Math.max(0, settings.donateGoal - settings.donateRaised)

  return (
    <div>
      <section className="relative overflow-hidden bg-ink py-10 text-white sm:py-16 md:py-20">
        <img
          src="https://i.ytimg.com/vi/sKpcFJ8Q6YE/maxresdefault.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-temple/50" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            light
            eyebrow="Donate"
            title="Seva that sustains the mandir"
            subtitle="One act of giving from the heart brings joy to the giver and strength to the community."
          />
          <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a href="#give">
              <Button size="lg">
                <Heart className="h-4 w-4" /> Give now
              </Button>
            </a>
            <a href="#impact">
              <Button size="lg" variant="ghost">
                Where it goes
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="give" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-10 sm:py-14 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-[1.5rem] border border-ink/8 bg-white p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-temple">Temple campaign</p>
            <h2 className="mt-3 font-display text-4xl text-night md:text-5xl">
              ${settings.donateRaised.toLocaleString()}
              <span className="ml-2 text-lg font-sans font-normal text-slate md:text-xl">
                raised of ${settings.donateGoal.toLocaleString()}
              </span>
            </h2>
            <div className="mt-7 h-3 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-marigold"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate">
              {pct}% funded · ${remaining.toLocaleString()} remaining
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={settings.donatePaypal}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-saffron/30 bg-saffron/10 p-5 transition hover:border-saffron"
              >
                <Heart className="h-5 w-5 text-saffron" />
                <p className="mt-3 font-display text-2xl text-night">PayPal</p>
                <p className="mt-1 text-sm text-slate">Secure online donation — opens in a new tab.</p>
                <span className="mt-4 inline-block text-sm font-medium text-saffron">Donate with PayPal →</span>
              </a>
              <a
                href="/img/qrcode.png"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-ink/10 bg-paper p-5 transition hover:border-gold"
              >
                <QrCode className="h-5 w-5 text-gold" />
                <p className="mt-3 font-display text-2xl text-night">Scan QR</p>
                <p className="mt-1 text-sm text-slate">Use your phone camera at the mandir or from home.</p>
                <span className="mt-4 inline-block text-sm font-medium text-temple">Open QR image →</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.5rem] border border-ink/8 bg-night p-7 text-white md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-marigold">Quick QR</p>
              <h3 className="mt-3 font-display text-3xl">Donate in a moment</h3>
              <p className="mt-3 text-sm text-mist/75">
                Scan this code with your phone. Receipts and household payment history stay in your member portal
                when temple staff log the gift.
              </p>
            </div>
            <img
              src="/img/qrcode.png"
              alt="Donation QR code"
              className="mx-auto mt-8 w-full max-w-[240px] rounded-2xl bg-white p-5"
            />
            <p className="mt-6 text-center text-xs text-mist/55">{settings.templeName}</p>
          </div>
        </div>
      </section>

      <section id="impact" className="scroll-mt-28 border-t border-ink/8 bg-paper px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Impact"
            title="Where your seva goes"
            subtitle="Every gift supports worship, community, and care of the mandir."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {impact.map((item) => (
              <div key={item.title} className="rounded-2xl border border-ink/8 bg-white p-6">
                <item.icon className="h-5 w-5 text-saffron" />
                <h3 className="mt-4 font-display text-2xl text-night">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
