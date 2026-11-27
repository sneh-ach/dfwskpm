import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Share2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../ui/Button'
import { useState } from 'react'

export function Footer() {
  const settings = useContentStore((s) => s.settings)
  const addSubscriber = useContentStore((s) => s.addSubscriber)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')

  return (
    <footer className="mt-auto max-w-[100vw] overflow-x-clip bg-night text-mist">
      <div className="mx-auto grid max-w-7xl min-w-0 gap-8 px-4 py-10 sm:gap-10 sm:py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:py-16">
        <div className="min-w-0 lg:col-span-1">
          <p className="font-display text-xl text-white sm:text-2xl">{settings.templeName}</p>
          <p className="mt-2 text-sm leading-relaxed text-mist/70 sm:mt-3">{settings.tagline}</p>
          <a
            href={settings.facebook}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-saffron hover:text-marigold"
          >
            <Share2 className="h-4 w-4" /> Follow on Facebook
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-marigold">Visit</p>
          <ul className="mt-4 space-y-3 text-sm text-mist/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              {settings.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              {settings.phone}
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              {settings.email}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-marigold">Explore</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {[
              ['/about', 'About'],
              ['/events', 'Events'],
              ['/calendar', 'Calendar'],
              ['/news', 'News'],
              ['/sermons', 'Sermons'],
              ['/donate', 'Donate'],
              ['/contact', 'Contact'],
              ['/login', 'Member login'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="text-mist/75 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-marigold">Newsletter</p>
          <p className="mt-3 text-sm text-mist/70">Receive satsang updates and festival reminders.</p>
          <form
            className="mt-4 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const ok = addSubscriber(email)
              setNote(ok ? 'Subscribed — thank you!' : 'Already subscribed or invalid email.')
              if (ok) setEmail('')
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-saffron"
            />
            <Button type="submit" size="sm">
              Subscribe
            </Button>
            {note && <p className="text-xs text-marigold">{note}</p>}
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-mist/50 md:px-6">
        © {new Date().getFullYear()} {settings.templeName}. Built with devotion for the community.
      </div>
    </footer>
  )
}
