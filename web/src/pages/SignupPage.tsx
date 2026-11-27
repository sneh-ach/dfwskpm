import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { AvatarUpload } from '../components/ui/AvatarUpload'

type MemberDraft = { name: string; relation: string; age: string; photo: string }

export function SignupPage() {
  const signupHousehold = useAuthStore((s) => s.signupHousehold)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [avatar, setAvatar] = useState('')
  const [members, setMembers] = useState<MemberDraft[]>([
    { name: '', relation: 'Head of household', age: '', photo: '' },
  ])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const primaryName = String(fd.get('primaryName') || '')
    const result = await signupHousehold({
      familyName: String(fd.get('familyName') || ''),
      primaryName,
      email: String(fd.get('email') || ''),
      password: String(fd.get('password') || ''),
      phone: String(fd.get('phone') || ''),
      addressLine1: String(fd.get('addressLine1') || ''),
      addressLine2: String(fd.get('addressLine2') || ''),
      city: String(fd.get('city') || ''),
      state: String(fd.get('state') || 'TX'),
      zip: String(fd.get('zip') || ''),
      avatar: avatar || undefined,
      photo: avatar || undefined,
      members: members
        .filter((m) => m.name.trim())
        .map((m, index) => ({
          name: m.name.trim(),
          relation: m.relation.trim() || 'Family',
          age: m.age ? Number(m.age) : undefined,
          isPrimary: index === 0,
          photo: m.photo || (index === 0 ? avatar : undefined) || undefined,
        })),
    })
    if (!result.ok) {
      setError(result.error || 'Signup failed')
      return
    }
    navigate('/member')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 md:px-6 md:py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-temple">Household membership</p>
      <h1 className="mt-3 font-display text-3xl text-night sm:text-4xl md:text-5xl">Register your family</h1>
      <p className="mt-3 max-w-2xl text-sm text-slate sm:mt-4 sm:text-base">
        One account for the household — photo, address, family members, invoices, and payment history sync to the
        temple directory when you register.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-8 rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(7,19,31,0.08)] sm:mt-10 sm:p-6 md:p-8"
      >
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-night">Your photo</h2>
          <AvatarUpload
            name={members[0]?.name || 'Primary'}
            value={avatar}
            onChange={(url) => {
              setAvatar(url)
              setMembers((list) =>
                list.map((m, i) => (i === 0 ? { ...m, photo: url } : m)),
              )
            }}
            label="Add color photo"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <h2 className="md:col-span-2 font-display text-2xl text-night">Household details</h2>
          <input name="familyName" required placeholder="Family / last name" className="auth-field" />
          <input name="primaryName" required placeholder="Primary contact full name" className="auth-field" />
          <input name="email" type="email" required placeholder="Email (login)" className="auth-field" />
          <input name="phone" required placeholder="Phone" className="auth-field" />
          <input
            name="password"
            type="password"
            required
            placeholder="Password (min 6)"
            className="auth-field md:col-span-2"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <h2 className="md:col-span-2 font-display text-2xl text-night">Home address</h2>
          <input name="addressLine1" required placeholder="Street address" className="auth-field md:col-span-2" />
          <input name="addressLine2" placeholder="Apt / suite (optional)" className="auth-field md:col-span-2" />
          <input name="city" required placeholder="City" className="auth-field" />
          <input name="state" required defaultValue="TX" placeholder="State" className="auth-field" />
          <input name="zip" required placeholder="ZIP" className="auth-field" />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-night">Family members</h2>
            <Button
              type="button"
              size="sm"
              variant="line"
              onClick={() =>
                setMembers((m) => [...m, { name: '', relation: 'Family', age: '', photo: '' }])
              }
            >
              <Plus className="h-4 w-4" /> Add member
            </Button>
          </div>
          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={index} className="rounded-xl border border-ink/10 p-3 sm:p-4">
                {index > 0 && (
                  <div className="mb-3">
                    <AvatarUpload
                      name={member.name || `Member ${index + 1}`}
                      value={member.photo}
                      onChange={(url) =>
                        setMembers((list) =>
                          list.map((m, i) => (i === index ? { ...m, photo: url } : m)),
                        )
                      }
                      label="Member photo"
                    />
                  </div>
                )}
                <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_0.5fr_auto]">
                  <input
                    required={index === 0}
                    placeholder={index === 0 ? 'Primary member name' : 'Member name'}
                    className="auth-field"
                    value={member.name}
                    onChange={(e) =>
                      setMembers((list) =>
                        list.map((m, i) => (i === index ? { ...m, name: e.target.value } : m)),
                      )
                    }
                  />
                  <input
                    placeholder="Relation"
                    className="auth-field"
                    value={member.relation}
                    onChange={(e) =>
                      setMembers((list) =>
                        list.map((m, i) => (i === index ? { ...m, relation: e.target.value } : m)),
                      )
                    }
                  />
                  <input
                    placeholder="Age"
                    className="auth-field"
                    value={member.age}
                    onChange={(e) =>
                      setMembers((list) =>
                        list.map((m, i) => (i === index ? { ...m, age: e.target.value } : m)),
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="line"
                    disabled={members.length === 1}
                    onClick={() => setMembers((list) => list.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && <p className="text-sm text-lotus">{error}</p>}
        <Button type="submit" className="w-full md:w-auto">
          Create household account
        </Button>
        <p className="text-center text-sm text-slate md:text-left">
          Already registered?{' '}
          <Link to="/login" className="text-saffron hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <style>{`
        .auth-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 32, 51, 0.15);
          background: #f7fafc;
          padding: 0.8rem 0.9rem;
          font-size: 16px;
          outline: none;
        }
        .auth-field:focus {
          border-color: #e28a2e;
        }
      `}</style>
    </div>
  )
}
