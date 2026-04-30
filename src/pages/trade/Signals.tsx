import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tradeSignals, tradeBots } from '../../api/trade'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import clsx from 'clsx'

const VOTES = [
  { label: 'All',  value: '' },
  { label: 'BUY',  value: 'BUY' },
  { label: 'SELL', value: 'SELL' },
  { label: 'HOLD', value: 'HOLD' },
]

function VotePill({ vote }: { vote: string }) {
  const cls =
    vote === 'BUY'  ? 'bg-green-500/15 text-green-300 border-green-500/30'
  : vote === 'SELL' ? 'bg-red-500/15   text-red-300   border-red-500/30'
                    : 'bg-white/5      text-g-muted   border-g-border'
  return <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border', cls)}>{vote}</span>
}

export default function TradeSignals() {
  const [bot, setBot] = useState('')
  const [vote, setVote] = useState('')
  const [executed, setExecuted] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)
  const limit = 50

  const { data: bots = [] } = useQuery({ queryKey: ['trade:bots'], queryFn: tradeBots })
  const { data, isLoading } = useQuery({
    queryKey: ['trade:signals', { bot, vote, executed, page }],
    queryFn: () => tradeSignals({
      bot: bot || undefined,
      vote: (vote || undefined) as any,
      executed: executed === 'all' ? undefined : executed === 'true',
      page,
      limit,
    }),
    refetchInterval: 10_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Zap size={14} className="text-accent" /> Signals
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={bot}
          onChange={e => { setBot(e.target.value); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option value="">All bots</option>
          {bots.map(b => <option key={b.bot} value={b.bot}>{b.bot}</option>)}
        </select>

        <div className="flex gap-1 bg-g-card border border-g-border rounded-lg p-0.5">
          {VOTES.map(v => (
            <button
              key={v.value}
              onClick={() => { setVote(v.value); setPage(1) }}
              className={clsx(
                'px-3 py-1 text-xs rounded transition-colors',
                vote === v.value ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <select
          value={executed}
          onChange={e => { setExecuted(e.target.value as any); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option value="all">All</option>
          <option value="true">Executed</option>
          <option value="false">Not executed</option>
        </select>

        <span className="text-xs text-g-muted ml-auto">
          {data ? `${data.total.toLocaleString()} matching` : '—'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Time','Bot','Model','Symbol','TF','Vote','Conf','Exec','Reasoning'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">No signals match the filters</td></tr>
            ) : data.rows.map(s => (
              <tr key={s.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                </td>
                <td className="px-3 py-2 text-xs text-white capitalize">{s.bot_name}</td>
                <td className="px-3 py-2 text-xs text-g-muted font-mono">{s.model_name}</td>
                <td className="px-3 py-2 text-xs text-white font-mono">{s.symbol}</td>
                <td className="px-3 py-2 text-xs text-g-muted uppercase">{s.timeframe}</td>
                <td className="px-3 py-2"><VotePill vote={s.vote} /></td>
                <td className="px-3 py-2 text-xs text-g-text">{(s.confidence * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-xs">
                  {s.executed
                    ? <span className="text-accent">✓</span>
                    : <span className="text-g-dim">·</span>}
                </td>
                <td className="px-3 py-2 text-xs text-g-muted max-w-xs truncate" title={s.reasoning}>
                  {s.reasoning || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex items-center justify-between text-xs text-g-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded border border-g-border disabled:opacity-30 hover:enabled:bg-g-deep"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border border-g-border disabled:opacity-30 hover:enabled:bg-g-deep"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
