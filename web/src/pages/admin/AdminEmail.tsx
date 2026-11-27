import { useMemo, useState, type FormEvent } from 'react'
import { Copy, Mail, Plus, Send } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../../components/ui/Button'
import { HouseholdPicker } from '../../components/admin/HouseholdPicker'
import {
  buildEmailVars,
  copyEmailDraft,
  openMailto,
  renderTemplate,
} from '../../lib/email'
import type { EmailTemplate, EmailTemplateKey } from '../../types'
import { formatDate } from '../../lib/utils'

export function AdminEmail() {
  const templates = useContentStore((s) => s.emailTemplates) || []
  const logs = useContentStore((s) => s.emailLogs) || []
  const households = useContentStore((s) => s.households)
  const settings = useContentStore((s) => s.settings)
  const upsertEmailTemplate = useContentStore((s) => s.upsertEmailTemplate)
  const logEmail = useContentStore((s) => s.logEmail)
  const currentUser = useAuthStore((s) => s.currentUser)

  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [householdId, setHouseholdId] = useState('')
  const [tplId, setTplId] = useState(templates[0]?.id || '')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')

  const household = households.find((h) => h.id === householdId)
  const activeTpl = templates.find((t) => t.id === tplId) || templates[0]

  const preview = useMemo(() => {
    if (!activeTpl) return { subject: '', body: '' }
    return renderTemplate(
      activeTpl,
      buildEmailVars({
        settings,
        household,
        name: household?.primaryName,
        message,
      }),
    )
  }, [activeTpl, settings, household, message])

  function saveTemplate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    upsertEmailTemplate(editing)
    setEditing(null)
  }

  function send(mode: 'mailto' | 'copy') {
    if (!household || !activeTpl) {
      setNote('Select a household and template first.')
      return
    }
    const rendered = renderTemplate(
      activeTpl,
      buildEmailVars({
        settings,
        household,
        name: household.primaryName,
        message,
      }),
    )
    logEmail({
      to: household.email,
      toName: household.primaryName,
      householdId: household.id,
      templateId: activeTpl.id,
      subject: rendered.subject,
      body: rendered.body,
      status: mode === 'mailto' ? 'opened_mail' : 'copied',
      createdBy: currentUser?.email,
    })
    if (mode === 'mailto') {
      openMailto(household.email, rendered.subject, rendered.body)
      setNote('Opened in your mail app — send from Gmail when ready.')
    } else {
      void copyEmailDraft(household.email, rendered.subject, rendered.body).then(() =>
        setNote('Draft copied — paste into Gmail.'),
      )
    }
  }

  return (
    <div className="pb-2">
      <h1 className="font-display text-3xl text-white sm:text-4xl">Email & notifications</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-mist/70 sm:text-base">
        Templates for signup welcome, reviews, invoice reminders, and general notices. Sends open
        your Gmail / mail app with the temple address ({settings.emailFrom || settings.email}) until
        a Gmail API key is connected.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-marigold">Compose</p>
          <h2 className="mt-1 font-display text-2xl text-white">Send to a household</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-mist/55">Household</label>
              <HouseholdPicker
                households={households}
                value={householdId}
                onChange={setHouseholdId}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-mist/55">Template</label>
              <select
                className="admin-field"
                value={tplId}
                onChange={(e) => setTplId(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-mist/55">Custom message (optional)</label>
              <textarea
                className="admin-field"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Used by the general notice template via {{message}}"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-night/40 p-3">
              <p className="text-xs text-mist/50">Preview</p>
              <p className="mt-1 text-sm font-medium text-white">{preview.subject || '—'}</p>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-mist/65">
                {preview.body || 'Select household to preview…'}
              </pre>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="justify-center" onClick={() => send('mailto')} disabled={!householdId}>
                <Send className="h-4 w-4" /> Open in Gmail / Mail
              </Button>
              <Button
                variant="ghost"
                className="justify-center"
                onClick={() => send('copy')}
                disabled={!householdId}
              >
                <Copy className="h-4 w-4" /> Copy draft
              </Button>
            </div>
            {note && <p className="text-sm text-marigold">{note}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-marigold">Library</p>
              <h2 className="mt-1 font-display text-2xl text-white">Templates</h2>
            </div>
            <Button
              size="sm"
              onClick={() =>
                setEditing({
                  id: '',
                  key: 'custom',
                  name: 'New template',
                  subject: 'Message from {{templeName}}',
                  body: 'Pranam {{name}},\n\n{{message}}\n\n{{templeName}}',
                  updatedAt: new Date().toISOString(),
                })
              }
            >
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setEditing({ ...t })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left hover:border-marigold/40"
              >
                <p className="font-medium text-white">{t.name}</p>
                <p className="mt-0.5 truncate text-xs text-mist/50">{t.subject}</p>
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-mist/45">
            Variables: {'{{name}}'}, {'{{familyName}}'}, {'{{templeName}}'}, {'{{address}}'},{' '}
            {'{{phone}}'}, {'{{email}}'}, {'{{message}}'}, {'{{invoiceTitle}}'},{' '}
            {'{{invoiceAmount}}'}, {'{{invoiceDue}}'}
          </p>
        </section>
      </div>

      {editing && (
        <form
          onSubmit={saveTemplate}
          className="mt-6 grid gap-3 rounded-2xl border border-marigold/30 bg-white/[0.04] p-4 sm:grid-cols-2 sm:p-5"
        >
          <p className="sm:col-span-2 font-display text-xl text-white">
            {editing.id ? 'Edit template' : 'New template'}
          </p>
          <input
            className="admin-field"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder="Template name"
            required
          />
          <select
            className="admin-field"
            value={editing.key}
            onChange={(e) => setEditing({ ...editing, key: e.target.value as EmailTemplateKey })}
          >
            <option value="welcome">Welcome</option>
            <option value="reviewed">Reviewed</option>
            <option value="invoice">Invoice</option>
            <option value="general">General</option>
            <option value="custom">Custom</option>
          </select>
          <input
            className="admin-field sm:col-span-2"
            value={editing.subject}
            onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
            placeholder="Subject"
            required
          />
          <textarea
            className="admin-field sm:col-span-2"
            rows={8}
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            placeholder="Body"
            required
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save template</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl text-white">Recent email activity</h2>
        <p className="mt-1 text-sm text-mist/55">
          Signup creates a welcome draft automatically. Opens / copies are logged here.
        </p>
        <div className="mt-4 space-y-2">
          {logs.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-mist/55">
              No emails logged yet.
            </p>
          )}
          {logs.slice(0, 30).map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-white">{log.subject}</p>
                  <p className="mt-0.5 text-sm text-mist/60">
                    To {log.toName || log.to} · {log.to}
                  </p>
                </div>
                <div className="text-right text-xs text-mist/45">
                  <p className="inline-flex items-center gap-1 capitalize">
                    <Mail className="h-3 w-3" /> {log.status.replace('_', ' ')}
                  </p>
                  <p className="mt-0.5">{formatDate(log.createdAt, { weekday: undefined })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
