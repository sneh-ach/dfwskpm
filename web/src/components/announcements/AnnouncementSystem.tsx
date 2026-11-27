import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../ui/Button'
import { isPublic } from '../../lib/memberFilters'
import type { Announcement } from '../../types'

function isActive(a: Announcement) {
  if (!isPublic(a.status)) return false
  const now = Date.now()
  const start = new Date(a.startsAt).getTime()
  const end = a.endsAt ? new Date(a.endsAt).getTime() : Infinity
  return now >= start && now <= end
}

function dismissKey(id: string) {
  return `dfwskpm-ann-dismiss-${id}`
}

export function AnnouncementBanner() {
  const announcements = useContentStore((s) => s.announcements)
  const banner = useMemo(
    () => announcements.find((a) => a.showBanner && isActive(a)),
    [announcements],
  )

  const [dismissed, setDismissed] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!banner) {
      setDismissed(true)
      return
    }
    setDismissed(Boolean(localStorage.getItem(dismissKey(banner.id))))
    setExpanded(false)
  }, [banner])

  if (!banner || dismissed) return null

  const tone =
    banner.tone === 'urgent'
      ? 'bg-lotus text-white'
      : banner.tone === 'warning'
        ? 'bg-saffron text-night'
        : banner.tone === 'event'
          ? 'bg-temple text-white'
          : 'bg-ink text-white'

  const muted = banner.tone === 'warning' ? 'text-night/70' : 'text-white/70'
  const moreHref = banner.linkUrl || '/news'

  return (
    <div className={`${tone}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 md:px-6">
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <strong className="font-semibold">{banner.title}</strong>
            <span className={`hidden sm:inline ${muted}`}>·</span>
            <span className="line-clamp-1 opacity-90 sm:line-clamp-none">
              {expanded ? null : banner.body.slice(0, 110)}
              {!expanded && banner.body.length > 110 ? '…' : !expanded ? banner.body : null}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>
                  Less <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  More info <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 max-w-3xl space-y-3 leading-relaxed opacity-95">
              <p>{banner.body}</p>
              <Link
                to={moreHref.startsWith('http') ? '#' : moreHref}
                {...(moreHref.startsWith('http')
                  ? { onClick: () => window.open(moreHref, '_blank', 'noreferrer') }
                  : {})}
                className="inline-flex font-medium underline underline-offset-2"
              >
                {banner.linkLabel || 'Read full details'} →
              </Link>
            </div>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 opacity-80 transition hover:bg-black/15 hover:opacity-100"
          aria-label="Dismiss announcement"
          onClick={() => {
            localStorage.setItem(dismissKey(banner.id), '1')
            setDismissed(true)
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function AnnouncementPopup() {
  const announcements = useContentStore((s) => s.announcements)
  const popup = useMemo(
    () => announcements.find((a) => a.showPopup && isActive(a)),
    [announcements],
  )

  const storageKey = popup ? dismissKey(popup.id) + '-popup' : ''
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!popup) {
      setOpen(false)
      return
    }
    setOpen(!localStorage.getItem(storageKey))
  }, [popup, storageKey])

  if (!popup || !open) return null

  const moreHref = popup.linkUrl || '/news'

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-night/55 p-4 sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-temple">Announcement</p>
            <h3 className="mt-1 font-display text-2xl text-night">{popup.title}</h3>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-slate hover:bg-paper"
            onClick={() => {
              localStorage.setItem(storageKey, '1')
              setOpen(false)
            }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5 leading-relaxed text-slate">
          <p>{popup.body}</p>
          <Link
            to={moreHref.startsWith('http') ? '/' : moreHref}
            className="inline-flex text-sm font-medium text-saffron hover:underline"
            onClick={(e) => {
              localStorage.setItem(storageKey, '1')
              setOpen(false)
              if (moreHref.startsWith('http')) {
                e.preventDefault()
                window.open(moreHref, '_blank', 'noreferrer')
              }
            }}
          >
            {popup.linkLabel || 'Read more on the site'} →
          </Link>
        </div>
        <div className="flex justify-end gap-2 border-t border-ink/8 px-5 py-4">
          <Button
            variant="line"
            onClick={() => {
              localStorage.setItem(storageKey, '1')
              setOpen(false)
            }}
          >
            Dismiss
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem(storageKey, '1')
              setOpen(false)
            }}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
