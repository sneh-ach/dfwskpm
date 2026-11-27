import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { ContentStatus, ResourceItem } from '../../types'
import { Button } from '../../components/ui/Button'
import { QuickStatusButtons, StatusBadge } from '../../components/admin/StatusControls'

export function AdminResources() {
  const resources = useContentStore((s) => s.resources)
  const upsertResource = useContentStore((s) => s.upsertResource)
  const setResourceStatus = useContentStore((s) => s.setResourceStatus)
  const deleteResource = useContentStore((s) => s.deleteResource)
  const [open, setOpen] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    upsertResource({
      title: String(fd.get('title') || ''),
      description: String(fd.get('description') || ''),
      category: String(fd.get('category') || 'Scripture'),
      type: String(fd.get('type') || 'pdf') as ResourceItem['type'],
      url: String(fd.get('url') || ''),
      status: String(fd.get('status') || 'published') as ContentStatus,
    })
    setOpen(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Resources</h1>
          <p className="mt-2 text-mist/70">PDFs and links — publish, hide, or archive anytime.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add resource
        </Button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <input name="title" className="admin-field" placeholder="Title" required />
          <input name="description" className="admin-field" placeholder="Description" required />
          <div className="grid gap-3 md:grid-cols-3">
            <input name="category" className="admin-field" placeholder="Category" defaultValue="Scripture" />
            <select name="type" className="admin-field" defaultValue="pdf">
              <option value="pdf">PDF</option>
              <option value="link">Link</option>
              <option value="audio">Audio</option>
            </select>
            <select name="status" className="admin-field" defaultValue="published">
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <input name="url" className="admin-field" placeholder="/pdf/file.pdf or https://..." required />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {resources.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-mist/60">
                  {item.category} · {item.type} · {item.url}
                </p>
              </div>
              <Button size="sm" variant="danger" onClick={() => deleteResource(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3">
              <QuickStatusButtons onChange={(status) => setResourceStatus(item.id, status)} />
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
