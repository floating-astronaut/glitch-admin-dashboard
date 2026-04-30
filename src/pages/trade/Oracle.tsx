import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Ban, Sliders, AlertTriangle } from 'lucide-react'
import {
  tradeOracleWeights, tradeOracleDecisions,
  tradeOracleBlocks, tradeOracleRisk,
} from '../../api/trade'
import { format, formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { TableToolbar, Pagination } from '../../components/ui/TableToolbar'

const TABS = [
  { id: 'decisions', label: 'Decisions',  icon: Shield },
  { id: 'weights',   label: 'Weights',    icon: Sliders },
  { id: 'blocks',    label: 'Blocks',     icon: Ban },
  { id: 'risk',      label: 'Risk Limits', icon: AlertTriangle },
] as const
type Tab = typeof TABS[number]['id']

function DecisionPill({ d }: { d: string }) {
  const cls = d === 'BUY'  ? 'bg-green-500/15 text-green-300 border-green-500/30'
            : d === 'SELL' ? 'bg-red-500/15 text-red-300 border-red-500/30'
            : d === 'HOLD' ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
            : 'bg-white/5 text-g-muted border-g-border'
  return <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border', cls)}>{d}</span>
}

function Decisions() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['trade:oracle:decisions', { dateFrom, dateTo, page, pageSize }],
    queryFn: () => tradeOracleDecisions({
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
      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      />
      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Time','Symbol','Decision','Conf','Buy','Sell','Hold','Mode','Abstain'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">No decisions</td></tr>
            ) : data.rows.map(d => (
              <tr key={d.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap" title={format(new Date(d.created_at), 'PPpp')}>
                  {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                </td>
                <td className="px-3 py-2 text-xs text-white font-mono">{d.symbol}</td>
                <td className="px-3 py-2"><DecisionPill d={d.decision} /></td>
                <td className="px-3 py-2 text-xs text-g-text">{(d.decision_confidence * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-xs text-green-400/80">{d.buy_score.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-red-400/80">{d.sell_score.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-yellow-400/80">{d.hold_score.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-g-muted uppercase">{d.mode}</td>
                <td className="px-3 py-2 text-xs text-g-muted">{d.abstain_reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

function Weights() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['trade:oracle:weights'],
    queryFn: tradeOracleWeights,
    refetchInterval: 60_000,
  })
  if (isLoading) return <div className="text-g-muted">Loading…</div>
  return (
    <div className="overflow-x-auto rounded-xl border border-g-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-g-border bg-g-deep">
            {['Bot','Weight','Veto','Freshness (s)','Updated','Notes'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(w => (
            <tr key={w.bot_name} className="border-b border-g-border/50 hover:bg-white/2">
              <td className="px-3 py-2 text-sm text-white capitalize font-medium">{w.bot_name}</td>
              <td className="px-3 py-2 text-sm text-accent font-bold">{w.weight.toFixed(2)}</td>
              <td className="px-3 py-2 text-xs">
                {w.can_veto
                  ? <span className="text-red-400">YES</span>
                  : <span className="text-g-muted">no</span>}
              </td>
              <td className="px-3 py-2 text-xs text-g-text">{w.freshness_sec}</td>
              <td className="px-3 py-2 text-xs text-g-muted">
                {formatDistanceToNow(new Date(w.updated_at), { addSuffix: true })}
              </td>
              <td className="px-3 py-2 text-xs text-g-muted">{w.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Blocks() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['trade:oracle:blocks', { dateFrom, dateTo, page, pageSize }],
    queryFn: () => tradeOracleBlocks({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      limit: pageSize,
    }),
    refetchInterval: 30_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-4">
      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      />
      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Time','Bot','Symbol','Side','Lots','Reason'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-g-muted">No blocks</td></tr>
            ) : data.rows.map(b => (
              <tr key={b.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                </td>
                <td className="px-3 py-2 text-xs text-white capitalize">{b.bot_name}</td>
                <td className="px-3 py-2 text-xs text-white font-mono">{b.symbol}</td>
                <td className="px-3 py-2 text-xs uppercase text-g-text">{b.side}</td>
                <td className="px-3 py-2 text-xs text-g-text">{b.proposed_lots.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-red-300 font-mono">{b.block_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

function Risk() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['trade:oracle:risk'],
    queryFn: tradeOracleRisk,
    refetchInterval: 60_000,
  })
  if (isLoading) return <div className="text-g-muted">Loading…</div>
  return (
    <div className="overflow-x-auto rounded-xl border border-g-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-g-border bg-g-deep">
            {['Scope','Key','Max Lots','Max Trades','Enabled','Notes','Updated'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={`${r.scope_type}-${r.scope_key}`} className="border-b border-g-border/50 hover:bg-white/2">
              <td className="px-3 py-2 text-xs text-g-muted uppercase">{r.scope_type}</td>
              <td className="px-3 py-2 text-xs text-white font-mono">{r.scope_key}</td>
              <td className="px-3 py-2 text-xs text-accent">{r.max_lots.toFixed(2)}</td>
              <td className="px-3 py-2 text-xs text-g-text">{r.max_trades ?? '∞'}</td>
              <td className="px-3 py-2 text-xs">
                {r.enabled
                  ? <span className="text-accent">ON</span>
                  : <span className="text-g-dim">off</span>}
              </td>
              <td className="px-3 py-2 text-xs text-g-muted">{r.notes ?? '—'}</td>
              <td className="px-3 py-2 text-xs text-g-muted">
                {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TradeOracle() {
  const [tab, setTab] = useState<Tab>('decisions')
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Shield size={14} className="text-accent" /> Oracle
      </h2>
      <div className="flex gap-1 bg-g-card border border-g-border rounded-lg p-0.5 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors',
              tab === t.id ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
            )}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'decisions' && <Decisions />}
      {tab === 'weights'   && <Weights />}
      {tab === 'blocks'    && <Blocks />}
      {tab === 'risk'      && <Risk />}
    </div>
  )
}
