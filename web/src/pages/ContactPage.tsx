import { useState, type FormEvent } from 'react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { useContentStore } from '../store/contentStore'

export function ContactPage() {
  const settings = useContentStore((s) => s.settings)
  const addContactMessage = useContentStore((s) => s.addContactMessage)
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    addContactMessage({
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      subject: String(fd.get('subject') || ''),
      message: String(fd.get('message') || ''),
    })
    setSent(true)
    e.currentTarget.reset()
  }

  return (
    <div>
      <section className="bg-ink px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            light
            eyebrow="Contact"
            title="We would love to hear from you"
            subtitle={settings.contactBlurb || `${settings.address} · ${settings.phone} · ${settings.email}`}
          />
          <p className="mt-6 text-mist/80">
            {settings.address}
            <br />
            {settings.phone} · {settings.email}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 md:px-6">
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-8 shadow-[0_12px_40px_rgba(7,19,31,0.08)] space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" required placeholder="Your name" className="field" />
            <input name="email" type="email" required placeholder="Email" className="field" />
          </div>
          <input name="subject" required placeholder="Subject" className="field" />
          <textarea name="message" required rows={6} placeholder="Your message" className="field resize-y" />
          <Button type="submit">Send message</Button>
          {sent && <p className="text-sm text-temple">Thank you — your message has been received.</p>}
        </form>

        <div className="overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(7,19,31,0.08)] min-h-[420px]">
          <iframe
            title="Temple map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13411.33777839416!2d-97.1701452!3d32.8231513!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xfd1438b76e02a2db!2sShri%20Krishna%20Pranami%20Temple!5e0!3m2!1sen!2sus!4v1624912774087!5m2!1sen!2sus"
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>

      <style>{`
        .field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 32, 51, 0.15);
          background: #f7fafc;
          padding: 0.75rem 0.9rem;
          outline: none;
        }
        .field:focus {
          border-color: #e28a2e;
          box-shadow: 0 0 0 3px rgba(226, 138, 46, 0.15);
        }
      `}</style>
    </div>
  )
}
