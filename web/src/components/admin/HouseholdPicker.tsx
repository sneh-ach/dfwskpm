import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import type { Household } from '../../types'
import { cn } from '../../lib/utils'

export function HouseholdPicker({
  households,
  value,
  onChange,
  name = 'householdId',
  required = false,
  placeholder = 'Search family, person, email, phone…',
  dark = true,
}: {
  households: Household[]
  value: string
  onChange: (id: string) => void
  name?: string
  required?: boolean
  placeholder?: string
  dark?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = households.find((h) => h.id === value)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = households.slice().sort((a, b) => a.familyName.localeCompare(b.familyName))
    if (!q) return list.slice(0, 12)
    return list
      .filter((h) => {
        const blob = [
          h.familyName,
          h.primaryName,
          h.email,
          h.phone,
          h.city,
          h.zip,
          ...h.members.map((m) => `${m.name} ${m.relation}`),
        ]
          .join(' ')
          .toLowerCase()
        return blob.includes(q)
      })
      .slice(0, 20)
  }, [households, query])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setQuery('')
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition',
          dark
            ? 'border-white/12 bg-white/4 text-white hover:border-marigold/40'
            : 'border-ink/15 bg-paper text-night hover:border-saffron',
          open && (dark ? 'border-marigold/50' : 'border-saffron'),
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? (
            <>
              <span className="font-medium">{selected.familyName}</span>
              <span className={dark ? 'text-mist/55' : 'text-slate'}>
                {' '}
                · {selected.primaryName}
              </span>
            </>
          ) : (
            <span className={dark ? 'text-mist/50' : 'text-slate/70'}>Select household…</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              className={cn('rounded p-0.5', dark ? 'hover:bg-white/10' : 'hover:bg-ink/5')}
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange('')
                }
              }}
            >
              <X className="h-3.5 w-3.5 opacity-60" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-40 mt-2 w-full overflow-hidden rounded-xl border shadow-2xl',
            dark ? 'border-white/12 bg-[#1a100e] text-white' : 'border-ink/10 bg-white text-night',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 border-b px-3 py-2.5',
              dark ? 'border-white/10' : 'border-ink/8',
            )}
          >
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full bg-transparent text-sm outline-none',
                dark ? 'placeholder:text-mist/40' : 'placeholder:text-slate/50',
              )}
            />
          </div>
          <ul className="max-h-[min(16rem,50vh)] overflow-y-auto overscroll-contain py-1">
            {results.length === 0 && (
              <li className={cn('px-3 py-4 text-sm', dark ? 'text-mist/50' : 'text-slate')}>
                No households match “{query}”
              </li>
            )}
            {results.map((h) => {
              const active = h.id === value
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(h.id)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition',
                      dark ? 'hover:bg-white/6' : 'hover:bg-paper',
                      active && (dark ? 'bg-saffron/15' : 'bg-saffron/10'),
                    )}
                  >
                    <Check
                      className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-marigold opacity-100' : 'opacity-0')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {h.familyName} · {h.primaryName}
                      </span>
                      <span className={cn('mt-0.5 block text-xs', dark ? 'text-mist/50' : 'text-slate')}>
                        {h.email} · {h.phone}
                        {h.members.length > 1
                          ? ` · ${h.members.length} members`
                          : ''}
                      </span>
                      {query &&
                        h.members.some((m) => m.name.toLowerCase().includes(query.toLowerCase())) && (
                          <span className={cn('mt-1 block text-xs', dark ? 'text-marigold/80' : 'text-saffron')}>
                            Match:{' '}
                            {h.members
                              .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
                              .map((m) => m.name)
                              .join(', ')}
                          </span>
                        )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
