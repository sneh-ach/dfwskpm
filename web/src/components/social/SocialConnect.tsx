import { useEffect, useState } from 'react'
import { ExternalLink, Share2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import { FacebookEmbed } from './FacebookEmbed'
import { Button } from '../ui/Button'
import { SnapRow } from '../ui/SnapRow'

export function SocialConnect() {
  const settings = useContentStore((s) => s.settings)
  const [embedHeight, setEmbedHeight] = useState(360)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setEmbedHeight(mq.matches ? 420 : 320)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const links = [
    { label: 'Facebook', href: settings.facebook },
    settings.instagram ? { label: 'Instagram', href: settings.instagram } : null,
    settings.youtube ? { label: 'YouTube', href: settings.youtube } : null,
    settings.whatsapp ? { label: 'WhatsApp', href: settings.whatsapp } : null,
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(42,74,110,0.45),transparent_55%),radial-gradient(ellipse_at_right,rgba(244,196,48,0.16),transparent_50%)]" />

      <div className="relative section-y mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-marigold sm:text-xs sm:tracking-[0.3em]">
              Community
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:mt-4 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              Live updates from the mandir
            </h2>
            <p className="mt-3 max-w-md text-sm text-mist/80 sm:mt-5 sm:text-base md:text-lg">
              Festival photos, satsang reminders, and temple notes — follow the DFW Pranami family.
            </p>
            <SnapRow className="mt-5 gap-2 md:mt-7 md:flex md:flex-wrap md:gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="snap-item inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-mist transition hover:border-marigold/50 hover:text-white"
                >
                  {link.label} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </SnapRow>
            <a href={settings.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-block sm:mt-8">
              <Button size="lg">
                <Share2 className="h-4 w-4" /> Follow on Facebook
              </Button>
            </a>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-white/5 p-2.5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:rounded-[1.35rem] sm:p-4">
            <div className="mb-2 flex items-center justify-between px-1 sm:mb-3">
              <p className="text-sm font-medium text-white">Facebook feed</p>
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-marigold hover:underline"
              >
                Open page →
              </a>
            </div>
            <FacebookEmbed height={embedHeight} />
          </div>
        </div>
      </div>
    </section>
  )
}
