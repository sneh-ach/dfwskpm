import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { ContentStatus, ScheduleItem } from '../../types'
import { Button } from '../../components/ui/Button'
import { QuickStatusButtons, StatusBadge, StatusSelect } from '../../components/admin/StatusControls'

const empty = {
  day: 'Saturday',
  title: 'Weekly Satsang',
  time: '6:00 PM – 9:00 PM',
  note: '',
  status: 'published' as ContentStatus,
}

export function AdminSchedule() {
  const schedule = useContentStore((s) => s.schedule)
  const upsertSchedule = useContentStore((s) => s.upsertSchedule)
  const setScheduleStatus = useContentStore((s) => s.setScheduleStatus)
  const deleteSchedule = useContentStore((s) => s.deleteSchedule)
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null)

  function startEdit(item?: ScheduleItem) {
    if (!item) {
      setEditing({ ...empty })
      return
    }
    setEditing({
      id: item.id,
      day: item.day,
      title: item.title,
      time: item.time,
      note: item.note || '',
      status: item.status,
    })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    upsertSchedule({
      id: editing.id,
      day: editing.day,
      title: editing.title,
      time: editing.time,
      note: editing.note,
      status: editing.status,
    })
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Hours & schedule</h1>
          <p className="mt-2 text-mist/70">
            Edit day, title, time, and notes — everything on the home visit strip is controlled here.
          </p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4" /> Add slot
        </Button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Day</span>
            <input
              className="admin-field"
              list="schedule-days"
              placeholder="Saturday"
              value={editing.day}
              onChange={(e) => setEditing({ ...editing, day: e.target.value })}
              required
            />
            <datalist id="schedule-days">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily', 'Weekdays'].map(
                (d) => (
                  <option key={d} value={d} />
                ),
              )}
            </datalist>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Title</span>
            <input
              className="admin-field"
              placeholder="Weekly Satsang"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Time</span>
            <input
              className="admin-field"
              placeholder="6:00 PM – 9:00 PM"
              value={editing.time}
              onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              required
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Note</span>
            <input
              className="admin-field"
              placeholder="Kirtan, pravachan & prasad"
              value={editing.note}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block text-mist/60">Visibility</span>
            <StatusSelect value={editing.status} onChange={(status) => setEditing({ ...editing, status })} />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">{editing.id ? 'Save changes' : 'Add schedule slot'}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {schedule.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">
                    {item.day} · {item.title}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-mist/70">{item.time}</p>
                {item.note && <p className="mt-1 text-sm text-mist/55">{item.note}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteSchedule(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusSelect value={item.status} onChange={(status) => setScheduleStatus(item.id, status)} />
              <QuickStatusButtons onChange={(status) => setScheduleStatus(item.id, status)} />
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
