import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { fileToDataUrl } from '../../lib/upload'
import { cn } from '../../lib/utils'
import { Avatar } from './Avatar'

/** Compact circular photo picker for signup / profile (color photo). */
export function AvatarUpload({
  name,
  value,
  onChange,
  tone = 'light',
  label = 'Add photo',
  className,
}: {
  name: string
  value: string
  onChange: (url: string) => void
  tone?: 'light' | 'dark'
  label?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const dataUrl = await fileToDataUrl(file, { maxWidth: 640, quality: 0.85 })
      onChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative group"
          aria-label={label}
        >
          <Avatar name={name || 'Member'} src={value || null} size="xl" className="ring-saffron/30" />
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full bg-night/45 opacity-0 transition group-hover:opacity-100',
            )}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </span>
        </button>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'text-sm font-medium',
              tone === 'dark' ? 'text-marigold' : 'text-saffron',
            )}
          >
            {value ? 'Change photo' : label}
          </button>
          <p className={cn('mt-1 text-xs', tone === 'dark' ? 'text-mist/50' : 'text-slate')}>
            Color photo from camera or library
          </p>
          {value && (
            <button
              type="button"
              className={cn(
                'mt-1 inline-flex items-center gap-1 text-xs',
                tone === 'dark' ? 'text-mist/60' : 'text-slate',
              )}
              onClick={() => onChange('')}
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {error && <p className="text-sm text-lotus">{error}</p>}
    </div>
  )
}
