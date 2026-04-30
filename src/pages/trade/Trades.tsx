import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tradeTrades, tradeBots } from '../../api/trade'
import { format } from 'date-fns'
import { BarChart3 } from 'lucide-react'
import clsx from 'clsx'
import { TableToolbar, Pagination } from '../../components/ui/TableToolbar'

const STATUS = [
  { label: 'All',    value: '' },
  { label: 'Open',   value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

function fmtPnl(n: number | null) {
  if (n === null || n === undefined) return '—'
  const cls = n > 0 ? 'text-green-400' : n < 0 ? 'text-red-400' : 'text-g-muted'
  const sign = n >= 0 ? '+' : ''
  return <span className={cls}>{sign}${n.toFixed(2)}</span>
}

function SidePill({ side }: { side: string }) {
  const cls = side === 'BUY'
    ? 'bg-green-500/15 text-green-300 border-green-500/30'
    : 'bg-red-500/15 text-red-300 border-red-500/30'
  return <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border', cls)}>{side}</span>
}

export default function TradeTrades() {
  const [status, setStatus] = useState<'' | 'open' | 'closed'>('')
  const [bot, setBot] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data: bots = [] } = useQuery({ queryKey: ['trade:bots'], queryFn: tradeBots })
  const { data, isLoading } = useQuery({
    queryKey: ['trade:trades', { status, bot, dateFrom, dateTo, page, pageSize }],
    queryFn: () => tradeTrades({
      status: (status || undefined) as any,
      bot: bot || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      limit: pageSize,
    }),
    refetchInterval: 15_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <BarChart3 size={14} className="text-accent" /> Trades
      </h2>

      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      >
        <div className="flex gap-1 bg-g-card border border-g-border rounded-lg p-0.5">
          {STATUS.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value as any); setPage(1) }}
              className={clsx(
                'px-3 py-1 text-xs rounded transition-colors',
                status === s.value ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={bot}
          onChange={e => { setBot(e.target.value); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option value="">All bots</option>
          {bots.map(b => <option key={b.bot} value={b.bot}>{b.bot}</option>)}
        </select>
      </TableToolbar>

      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Opened','Bot','Symbol','Side','Lots','Entry','SL','TP','Exit','Reason','Duration','PnL'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={12} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-8 text-g-muted">No trades</td></tr>
            ) : data.rows.map(t => (
              <tr key={t.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap">
                  {format(new Date(t.opened_at), 'MMM d HH:mm')}
                </td>
                <td className="px-3 py-2 text-xs text-white capitalize">{t.bot_name}</td>
                <td className="px-3 py-2 text-xs text-white font-mono">{t.symbol}</td>
                <td className="px-3 py-2"><SidePill side={t.side} /></td>
                <td className="px-3 py-2 text-xs text-g-text">{t.volume_lots.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-g-text font-mono">{t.entry_price?.toFixed(5) ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-red-400/80 font-mono">{t.sl_price?.toFixed(5) ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-green-400/80 font-mono">{t.tp_price?.toFixed(5) ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-g-text font-mono">{t.exit_price?.toFixed(5) ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-g-muted">{t.exit_reason ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-g-muted">
                  {t.duration_minutes != null ? `${Math.round(t.duration_minutes)}m` : '—'}
                </td>
                <td className="px-3 py-2 text-xs font-medium">{fmtPnl(t.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
