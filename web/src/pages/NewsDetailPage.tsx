import { Link, useParams } from 'react-router-dom'
import { useContentStore } from '../store/contentStore'
import { formatDate } from '../lib/utils'
import { Button } from '../components/ui/Button'

export function NewsDetailPage() {
  const { id } = useParams()
  const item = useContentStore((s) => s.news.find((n) => n.id === id && n.status === 'published'))

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Article not found</h1>
        <Link to="/news" className="mt-6 inline-block">
          <Button variant="line">Back to news</Button>
        </Link>
      </div>
    )
  }

  return (
    <article>
      <div className="relative min-h-[42svh] overflow-hidden bg-night text-white">
        <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.68]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/20" />
        <div className="relative mx-auto flex min-h-[42svh] max-w-3xl flex-col justify-end px-4 py-14 md:px-6">
          <p className="text-xs uppercase tracking-[0.22em] text-marigold">{item.category}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-balance md:text-5xl">{item.title}</h1>
          <p className="mt-4 text-sm text-mist/75">
            {formatDate(item.publishedAt)} · by {item.author}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <p className="text-lg leading-relaxed text-slate whitespace-pre-line">{item.body}</p>
        <Link to="/news" className="mt-10 inline-block">
          <Button variant="line">← All news</Button>
        </Link>
      </div>
    </article>
  )
}
