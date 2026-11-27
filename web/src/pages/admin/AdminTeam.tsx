import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useContentStore } from '../../store/contentStore'
import type { ContentStatus, TeamGroup, TeamMember } from '../../types'
import { Button } from '../../components/ui/Button'
import { ImageUpload } from '../../components/ui/ImageUpload'
import { QuickStatusButtons, StatusBadge, StatusSelect } from '../../components/admin/StatusControls'

const empty = {
  name: '',
  role: '',
  image: '/img/logo.png',
  order: 1,
  group: 'committee' as TeamGroup,
  bio: '',
  status: 'published' as ContentStatus,
}

export function AdminTeam() {
  const team = useContentStore((s) => s.team)
  const upsertTeam = useContentStore((s) => s.upsertTeam)
  const setTeamStatus = useContentStore((s) => s.setTeamStatus)
  const deleteTeam = useContentStore((s) => s.deleteTeam)
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    upsertTeam(editing)
    setEditing(null)
  }

  function startEdit(member?: TeamMember) {
    setEditing(
      member
        ? {
            id: member.id,
            name: member.name,
            role: member.role,
            image: member.image,
            order: member.order,
            group: member.group,
            bio: member.bio || '',
            status: member.status,
          }
        : { ...empty, order: team.length + 1 },
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Team</h1>
          <p className="mt-2 text-mist/70">Upload photos, hide/archive leaders, group by committee.</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4" /> Add member
        </Button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <input className="admin-field" placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
          <input className="admin-field" placeholder="Role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} required />
          <select className="admin-field" value={editing.group} onChange={(e) => setEditing({ ...editing, group: e.target.value as TeamGroup })}>
            <option value="committee">Executive Committee</option>
            <option value="board">Board of Trustees</option>
            <option value="mahila">Baijuraj Mahila</option>
            <option value="other">Other</option>
          </select>
          <input className="admin-field" type="number" placeholder="Order" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
          <div className="md:col-span-2">
            <ImageUpload value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
          </div>
          <textarea className="admin-field md:col-span-2" rows={2} placeholder="Short bio" value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
          <StatusSelect value={editing.status} onChange={(status) => setEditing({ ...editing, status })} />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {team
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((member) => (
            <div key={member.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img src={member.image} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{member.name}</p>
                  <StatusBadge status={member.status} />
                </div>
                <p className="text-sm text-mist/60">
                  {member.role} · {member.group}
                </p>
                <div className="mt-3 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(member)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deleteTeam(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <QuickStatusButtons onChange={(status) => setTeamStatus(member.id, status)} />
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
