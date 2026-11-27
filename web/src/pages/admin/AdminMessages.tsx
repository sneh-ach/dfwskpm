import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

export function AdminMessages() {
  const messages = useContentStore((s) => s.contactMessages)
  const requests = useContentStore((s) => s.memberRequests) || []
  const households = useContentStore((s) => s.households)
  const markMessageRead = useContentStore((s) => s.markMessageRead)
  const resolveMemberRequest = useContentStore((s) => s.resolveMemberRequest)
  const [tab, setTab] = useState<'requests' | 'contact'>('requests')

  const openRequests = useMemo(() => requests.filter((r) => r.status === 'open'), [requests])
  const unreadContact = useMemo(() => messages.filter((m) => !m.read), [messages])

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Inbox</h1>
      <p className="mt-2 text-mist/70">
        Member portal requests and public contact form messages — keep both queues clear.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`rounded-full px-4 py-2 text-sm ${tab === 'requests' ? 'bg-saffron text-night' : 'bg-white/5 text-mist'}`}
        >
          Member requests ({openRequests.length} open)
        </button>
        <button
          type="button"
          onClick={() => setTab('contact')}
          className={`rounded-full px-4 py-2 text-sm ${tab === 'contact' ? 'bg-saffron text-night' : 'bg-white/5 text-mist'}`}
        >
          Contact form ({unreadContact.length} unread)
        </button>
      </div>

      {tab === 'requests' && (
        <div className="mt-6 space-y-3">
          {requests.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-8 text-mist/60">
              No member requests yet. Families send these from My account → Requests.
            </p>
          )}
          {requests
            .slice()
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .map((req) => {
              const hh = households.find((h) => h.id === req.householdId)
              return (
                <article
                  key={req.id}
                  className={`rounded-xl border p-5 ${
                    req.status === 'open' ? 'border-saffron/40 bg-saffron/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{req.subject}</p>
                      <p className="mt-1 text-sm text-mist/60">
                        {req.name} · {req.email} · {req.type} · {formatDate(req.createdAt)}
                      </p>
                      <p className="mt-1 text-xs text-mist/45">
                        {hh ? `${hh.familyName} household` : 'Household missing'} · {req.status}
                        {req.resolvedAt ? ` · resolved ${formatDate(req.resolvedAt)}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hh && (
                        <Link to={`/admin/lookup?hh=${hh.id}`}>
                          <Button size="sm" variant="ghost">
                            Open member
                          </Button>
                        </Link>
                      )}
                      {req.status === 'open' && (
                        <Button size="sm" onClick={() => resolveMemberRequest(req.id)}>
                          Mark resolved
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-mist/85">{req.message}</p>
                </article>
              )
            })}
        </div>
      )}

      {tab === 'contact' && (
        <div className="mt-6 space-y-3">
          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-8 text-mist/60">No contact messages yet.</p>
          )}
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`rounded-xl border p-5 ${msg.read ? 'border-white/10 bg-white/5' : 'border-saffron/40 bg-saffron/10'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{msg.subject}</p>
                  <p className="text-sm text-mist/60">
                    {msg.name} · {msg.email} · {formatDate(msg.createdAt)}
                  </p>
                </div>
                {!msg.read && (
                  <Button size="sm" variant="ghost" onClick={() => markMessageRead(msg.id)}>
                    Mark read
                  </Button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-mist/85">{msg.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
