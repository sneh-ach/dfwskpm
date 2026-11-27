import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { fileToDataUrl } from '../../lib/upload'
import { cn } from '../../lib/utils'

export function ImageUpload({
  value,
  onChange,
  label = 'Upload photo',
  className,
}: {
  value: string
  onChange: (url: string) => void
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
      const dataUrl = await fileToDataUrl(file)
      onChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          value={value.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL /img/..."
          className="min-w-[220px] flex-1 rounded-md border border-white/12 bg-white/4 px-3 py-2 text-sm text-white outline-none"
        />
      </div>
      {value && (
        <img src={value} alt="Preview" className="h-36 w-full max-w-sm rounded-xl object-cover" />
      )}
      {error && <p className="text-sm text-lotus">{error}</p>}
      <p className="text-xs text-mist/50">Works from phone camera or photo library. Images are stored in this browser for the preview CMS.</p>
    </div>
  )
}
