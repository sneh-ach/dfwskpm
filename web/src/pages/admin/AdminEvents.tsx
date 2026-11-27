import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { ContentStatus, EventItem } from '../../types'
import { Button } from '../../components/ui/Button'
import { ImageUpload } from '../../components/ui/ImageUpload'
import { QuickStatusButtons, StatusBadge, StatusSelect } from '../../components/admin/StatusControls'
import { formatDate } from '../../lib/utils'

const empty = {
  title: '',
  description: '',
  start: '',
  end: '',
  location: '748 Harrison Ln, Hurst, TX 76053',
  host: '',
  image: '/img/shatsang.jpg',
  status: 'published' as ContentStatus,
}

function toLocalInput(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminEvents() {
  const events = useContentStore((s) => s.events)
  const upsertEvent = useContentStore((s) => s.upsertEvent)
  const setEventStatus = useContentStore((s) => s.setEventStatus)
  const deleteEvent = useContentStore((s) => s.deleteEvent)
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null)
  const [filter, setFilter] = useState<'all' | ContentStatus>('all')

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    upsertEvent({
      ...editing,
      start: new Date(editing.start).toISOString(),
      end: new Date(editing.end).toISOString(),
    })
    setEditing(null)
  }

  function startEdit(event?: EventItem) {
    if (!event) {
      setEditing({ ...empty })
      return
    }
    setEditing({
      id: event.id,
      title: event.title,
      description: event.description,
      start: toLocalInput(event.start),
      end: toLocalInput(event.end),
      location: event.location,
      host: event.host,
      image: event.image,
      status: event.status,
    })
  }

  const visible = events.filter((e) => filter === 'all' || e.status === filter)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Events</h1>
          <p className="mt-2 text-mist/70">Add, edit, hide, archive, or delete. Upload photos from your phone.</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4" /> New event
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', 'published', 'draft', 'hidden', 'archived'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${filter === f ? 'bg-saffron text-night' : 'bg-white/5 text-mist'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <input className="admin-field md:col-span-2" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
          <textarea className="admin-field md:col-span-2" rows={3} placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} required />
          <input className="admin-field" type="datetime-local" value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })} required />
          <input className="admin-field" type="datetime-local" value={editing.end} onChange={(e) => setEditing({ ...editing, end: e.target.value })} required />
          <input className="admin-field" placeholder="Location" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} required />
          <input className="admin-field" placeholder="Host" value={editing.host} onChange={(e) => setEditing({ ...editing, host: e.target.value })} required />
          <div className="md:col-span-2">
            <ImageUpload value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
          </div>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block text-mist/60">Visibility</span>
            <StatusSelect value={editing.status} onChange={(status) => setEditing({ ...editing, status })} />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save event</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {visible.map((event) => (
          <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <img src={event.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{event.title}</p>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="text-sm text-mist/60">{formatDate(event.start)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => startEdit(event)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteEvent(event.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <QuickStatusButtons onChange={(status) => setEventStatus(event.id, status)} />
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
      `}</style>
    </div>
  )
}
