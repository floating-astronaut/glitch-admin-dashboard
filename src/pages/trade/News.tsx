import { useQuery } from '@tanstack/react-query'
import { Newspaper, ExternalLink } from 'lucide-react'
import { tradeNews } from '../../api/trade'
import { format, formatDistanceToNow } from 'date-fns'

export default function TradeNews() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['trade:news'],
    queryFn: () => tradeNews(100),
    refetchInterval: 60_000,
  })

  if (isLoading) return <div className="text-g-muted">Loading…</div>

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Newspaper size={14} className="text-accent" /> News Events
      </h2>

      <div className="space-y-2">
        {data.length === 0 && (
          <div className="text-g-muted text-sm">No news events</div>
        )}
        {data.map(n => {
          const when = n.published_at || n.created_at
          return (
            <div key={n.id} className="rounded-xl border border-g-border bg-g-card p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 text-xs text-g-muted">
                  <span className="font-mono uppercase text-accent/70">{n.source ?? '—'}</span>
                  {n.event_type && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{n.event_type}</span>
                    </>
                  )}
                  <span>·</span>
                  <span title={format(new Date(when), 'PPpp')}>
                    {formatDistanceToNow(new Date(when), { addSuffix: true })}
                  </span>
                </div>
                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-g-muted hover:text-accent"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{n.title}</h3>
              {n.description && (
                <p className="text-xs text-g-muted leading-relaxed">{n.description}</p>
              )}
              {(n.country?.length || n.category?.length) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {n.country?.map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-g-muted">
                      {c}
                    </span>
                  ))}
                  {n.category?.map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent/80">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
