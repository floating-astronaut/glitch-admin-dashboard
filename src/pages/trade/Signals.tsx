import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tradeSignals, tradeBots } from '../../api/trade'
import { format, formatDistanceToNow } from 'date-fns'
import { Zap } from 'lucide-react'
import clsx from 'clsx'
import { TableToolbar, Pagination } from '../../components/ui/TableToolbar'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [bot, setBotState] = useState(searchParams.get('bot') ?? '')
  const setBot = (v: string) => {
    setBotState(v)
    const next = new URLSearchParams(searchParams)
    if (v) next.set('bot', v); else next.delete('bot')
    setSearchParams(next, { replace: true })
  }
  const [vote, setVote] = useState('')
  const [executed, setExecuted] = useState<'all' | 'true' | 'false'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data: bots = [] } = useQuery({ queryKey: ['trade:bots'], queryFn: tradeBots })
  const { data, isLoading } = useQuery({
    queryKey: ['trade:signals', { bot, vote, executed, dateFrom, dateTo, page, pageSize }],
    queryFn: () => tradeSignals({
      bot: bot || undefined,
      vote: (vote || undefined) as any,
      executed: executed === 'all' ? undefined : executed === 'true',
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      limit: pageSize,
    }),
    refetchInterval: 10_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Zap size={14} className="text-accent" /> Signals
      </h2>

      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      >
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
      </TableToolbar>

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
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap" title={format(new Date(s.created_at), 'PPpp')}>
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
