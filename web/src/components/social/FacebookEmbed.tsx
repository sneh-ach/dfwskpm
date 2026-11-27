import { useEffect, useRef, useState } from 'react'
import { useContentStore } from '../../store/contentStore'

/** Facebook Page Plugin — fills its container up to FB’s 500px max width. */
export function FacebookEmbed({ height = 720 }: { height?: number }) {
  const facebook = useContentStore((s) => s.settings.facebook)
  const href = encodeURIComponent(facebook || 'https://www.facebook.com/TexasPranami/')
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(500)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => setWidth(Math.min(500, Math.max(280, Math.floor(el.clientWidth))))
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="mx-auto w-full max-w-[500px]">
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gold/25 shadow-[0_28px_70px_rgba(0,0,0,0.4)]">
        <iframe
          key={`${width}-${height}`}
          title="DFW Pranami Facebook"
          src={`https://www.facebook.com/plugins/page.php?href=${href}&tabs=timeline&width=${width}&height=${height}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
          width={width}
          height={height}
          style={{ border: 'none', overflow: 'hidden', display: 'block', width: '100%' }}
          scrolling="no"
          allow="encrypted-media"
          loading="lazy"
        />
      </div>
    </div>
  )
}
