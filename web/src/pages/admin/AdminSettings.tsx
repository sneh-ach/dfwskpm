import { useState, type FormEvent } from 'react'
import { useContentStore } from '../../store/contentStore'
import { Button } from '../../components/ui/Button'
import { ImageUpload } from '../../components/ui/ImageUpload'

export function AdminSettings() {
  const settings = useContentStore((s) => s.settings)
  const updateSettings = useContentStore((s) => s.updateSettings)
  const resetToSeed = useContentStore((s) => s.resetToSeed)
  const subscribers = useContentStore((s) => s.subscribers)
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateSettings(form)
    setSaved(true)
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Settings</h1>
      <p className="mt-2 text-mist/70">
        Contact info, open-now banner, socials, donations — everything public on the site.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
        {(
          [
            ['templeName', 'Temple name'],
            ['tagline', 'Tagline'],
            ['address', 'Address'],
            ['phone', 'Phone'],
            ['email', 'Public contact email'],
            ['emailFrom', 'Gmail / send-from address'],
            ['emailFromName', 'Email from name'],
            ['facebook', 'Facebook page URL'],
            ['instagram', 'Instagram URL'],
            ['youtube', 'YouTube URL'],
            ['whatsapp', 'WhatsApp link'],
            ['donatePaypal', 'PayPal donate URL'],
            ['openNowLabel', 'Open now label'],
            ['openNowDetail', 'Open now detail'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            <span className="mb-1 block text-mist/60">{label}</span>
            <input
              className="admin-field"
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.showOpenNow}
            onChange={(e) => setForm({ ...form, showOpenNow: e.target.checked })}
          />
          Show “Open now” banner on home hero
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-mist/60">Contact page blurb</span>
          <textarea
            className="admin-field"
            rows={2}
            value={form.contactBlurb}
            onChange={(e) => setForm({ ...form, contactBlurb: e.target.value })}
          />
        </label>

        <div className="md:col-span-2">
          <p className="mb-2 text-sm text-mist/60">Hero image</p>
          <ImageUpload value={form.heroImage} onChange={(heroImage) => setForm({ ...form, heroImage })} />
        </div>

        <label className="text-sm">
          <span className="mb-1 block text-mist/60">Donate raised</span>
          <input
            className="admin-field"
            type="number"
            value={form.donateRaised}
            onChange={(e) => setForm({ ...form, donateRaised: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-mist/60">Donate goal</span>
          <input
            className="admin-field"
            type="number"
            value={form.donateGoal}
            onChange={(e) => setForm({ ...form, donateGoal: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-mist/60">About paragraph 1</span>
          <textarea
            className="admin-field"
            rows={3}
            value={form.aboutText[0] || ''}
            onChange={(e) => setForm({ ...form, aboutText: [e.target.value, form.aboutText[1] || ''] })}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-mist/60">About paragraph 2</span>
          <textarea
            className="admin-field"
            rows={3}
            value={form.aboutText[1] || ''}
            onChange={(e) => setForm({ ...form, aboutText: [form.aboutText[0] || '', e.target.value] })}
          />
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit">Save settings</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (confirm('Reset all content to the original seed data?')) resetToSeed()
            }}
          >
            Reset content to seed
          </Button>
          {saved && <span className="self-center text-sm text-marigold">Saved.</span>}
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-2xl text-white">Newsletter subscribers</h2>
        <ul className="mt-4 space-y-1 text-sm text-mist/80">
          {subscribers.length === 0 && <li>No subscribers yet.</li>}
          {subscribers.map((email) => (
            <li key={email}>{email}</li>
          ))}
        </ul>
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
