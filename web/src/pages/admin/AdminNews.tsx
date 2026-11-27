import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { ContentStatus, NewsItem } from '../../types'
import { Button } from '../../components/ui/Button'
import { ImageUpload } from '../../components/ui/ImageUpload'
import { QuickStatusButtons, StatusBadge, StatusSelect } from '../../components/admin/StatusControls'
import { formatDate } from '../../lib/utils'

const empty = {
  title: '',
  excerpt: '',
  body: '',
  author: '',
  category: 'Announcement',
  image: '/img/1.png',
  status: 'published' as ContentStatus,
  publishedAt: new Date().toISOString().slice(0, 10),
}

export function AdminNews() {
  const news = useContentStore((s) => s.news)
  const upsertNews = useContentStore((s) => s.upsertNews)
  const setNewsStatus = useContentStore((s) => s.setNewsStatus)
  const deleteNews = useContentStore((s) => s.deleteNews)
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    upsertNews({
      ...editing,
      publishedAt: new Date(editing.publishedAt).toISOString(),
    })
    setEditing(null)
  }

  function startEdit(item?: NewsItem) {
    if (!item) {
      setEditing({ ...empty })
      return
    }
    setEditing({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      author: item.author,
      category: item.category,
      image: item.image,
      status: item.status,
      publishedAt: item.publishedAt.slice(0, 10),
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">News</h1>
          <p className="mt-2 text-mist/70">Publish, hide, archive, or delete. Upload cover photos from your phone.</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <input className="admin-field" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
          <input className="admin-field" placeholder="Excerpt" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} required />
          <textarea className="admin-field" rows={5} placeholder="Full body" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} required />
          <div className="grid gap-3 md:grid-cols-3">
            <input className="admin-field" placeholder="Author" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} required />
            <input className="admin-field" placeholder="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} required />
            <input className="admin-field" type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} required />
          </div>
          <ImageUpload value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
          <label className="text-sm">
            <span className="mb-1 block text-mist/60">Visibility</span>
            <StatusSelect value={editing.status} onChange={(status) => setEditing({ ...editing, status })} />
          </label>
          <div className="flex gap-2">
            <Button type="submit">Save news</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {news.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-mist/60">
                  {formatDate(item.publishedAt)} · {item.category}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteNews(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <QuickStatusButtons onChange={(status) => setNewsStatus(item.id, status)} />
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
