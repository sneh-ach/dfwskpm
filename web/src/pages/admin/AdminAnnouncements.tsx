import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { Announcement, ContentStatus } from '../../types'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/admin/StatusControls'

function toLocal(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminAnnouncements() {
  const announcements = useContentStore((s) => s.announcements)
  const upsertAnnouncement = useContentStore((s) => s.upsertAnnouncement)
  const deleteAnnouncement = useContentStore((s) => s.deleteAnnouncement)
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing?.title || !editing.body) return
    upsertAnnouncement({
      id: editing.id,
      title: editing.title,
      body: editing.body,
      tone: (editing.tone as Announcement['tone']) || 'info',
      status: (editing.status as ContentStatus) || 'published',
      startsAt: editing.startsAt ? new Date(editing.startsAt).toISOString() : new Date().toISOString(),
      endsAt: editing.endsAt ? new Date(editing.endsAt).toISOString() : undefined,
      showPopup: Boolean(editing.showPopup),
      showBanner: Boolean(editing.showBanner),
      linkUrl: editing.linkUrl || undefined,
      linkLabel: editing.linkLabel || undefined,
    })
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Announcements</h1>
          <p className="mt-2 text-mist/70">
            Popups and top banners — e.g. “Monday temporarily closed” or special events.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              title: '',
              body: '',
              tone: 'warning',
              status: 'published',
              startsAt: toLocal(new Date().toISOString()),
              showPopup: true,
              showBanner: true,
            })
          }
        >
          <Plus className="h-4 w-4" /> New announcement
        </Button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <input className="admin-field md:col-span-2" placeholder="Title" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
          <textarea className="admin-field md:col-span-2" rows={3} placeholder="Message" value={editing.body || ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} required />
          <select className="admin-field" value={editing.tone || 'info'} onChange={(e) => setEditing({ ...editing, tone: e.target.value as Announcement['tone'] })}>
            <option value="info">Info</option>
            <option value="event">Event</option>
            <option value="warning">Warning</option>
            <option value="urgent">Urgent</option>
          </select>
          <select className="admin-field" value={editing.status || 'published'} onChange={(e) => setEditing({ ...editing, status: e.target.value as ContentStatus })}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Starts</span>
            <input type="datetime-local" className="admin-field" value={toLocal(editing.startsAt)} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Ends (optional)</span>
            <input type="datetime-local" className="admin-field" value={toLocal(editing.endsAt)} onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.showPopup)} onChange={(e) => setEditing({ ...editing, showPopup: e.target.checked })} />
            Show popup
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.showBanner)} onChange={(e) => setEditing({ ...editing, showBanner: e.target.checked })} />
            Show top banner
          </label>
          <input
            className="admin-field"
            placeholder="More info link (/events or https://...)"
            value={editing.linkUrl || ''}
            onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })}
          />
          <input
            className="admin-field"
            placeholder="More info label (e.g. Read details)"
            value={editing.linkLabel || ''}
            onChange={(e) => setEditing({ ...editing, linkLabel: e.target.value })}
          />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{a.title}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-sm text-mist/70">{a.body}</p>
                <p className="mt-2 text-xs text-mist/50">
                  {a.showPopup ? 'Popup' : ''}
                  {a.showPopup && a.showBanner ? ' · ' : ''}
                  {a.showBanner ? 'Banner' : ''} · {a.tone}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditing({
                      ...a,
                      startsAt: toLocal(a.startsAt),
                      endsAt: toLocal(a.endsAt),
                    })
                  }
                >
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteAnnouncement(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .admin-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          padding: 0.7rem 0.85rem;
          outline: none;
        }
        .admin-field option { color: #102033; }
      `}</style>
    </div>
  )
}
