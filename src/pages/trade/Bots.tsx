import { useQuery } from '@tanstack/react-query'
import { Bot } from 'lucide-react'
import { tradeBots } from '../../api/trade'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

export default function TradeBots() {
  const { data: bots = [], isLoading } = useQuery({
    queryKey: ['trade:bots'],
    queryFn: tradeBots,
    refetchInterval: 15_000,
  })

  if (isLoading) return <div className="text-g-muted">Loading…</div>

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Bot size={14} className="text-accent" /> Snake Bots — Ouroboros Ensemble
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map(b => {
          const exec_pct = b.signal_count_7d
            ? (b.executed_count_7d / b.signal_count_7d) * 100
            : 0
          return (
            <div key={b.bot} className="rounded-xl border border-g-border bg-g-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white capitalize">{b.bot}</span>
                  <StatusBadge value={b.status} dot />
                </div>
                <span className="text-xs text-g-muted">
                  {b.last_signal_at
                    ? formatDistanceToNow(new Date(b.last_signal_at), { addSuffix: true })
                    : 'never'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-g-deep rounded-lg p-2">
                  <div className="text-[10px] text-g-dim uppercase">Signals 7D</div>
                  <div className="text-sm font-bold text-white">{b.signal_count_7d.toLocaleString()}</div>
                </div>
                <div className="bg-g-deep rounded-lg p-2">
                  <div className="text-[10px] text-g-dim uppercase">Executed</div>
                  <div className="text-sm font-bold text-accent">{b.executed_count_7d}</div>
                </div>
                <div className="bg-g-deep rounded-lg p-2">
                  <div className="text-[10px] text-g-dim uppercase">Symbols</div>
                  <div className="text-sm font-bold text-white">{b.symbols}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-g-muted mb-1">
                  <span>Execution rate</span>
                  <span>{exec_pct.toFixed(2)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5">
                  <div className="h-1 rounded-full bg-accent" style={{ width: `${Math.min(exec_pct, 100)}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
