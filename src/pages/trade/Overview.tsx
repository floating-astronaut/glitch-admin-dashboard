import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Activity, TrendingUp, TrendingDown, Wallet, Bot as BotIcon,
  Zap, BarChart3, Target,
} from 'lucide-react'
import { tradeStats, tradeBots, tradeSymbols, tradeSeries, tradeLiveAccount } from '../../api/trade'
import KpiCard from '../../components/ui/KpiCard'
import StatusBadge from '../../components/ui/StatusBadge'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'

const RANGE = [
  { label: '24H', days: 1 },
  { label: '7D',  days: 7 },
  { label: '30D', days: 30 },
]

function fmtMoney(n: number, dp = 2) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}

export default function TradeOverview() {
  const [days, setDays] = useState(7)

  const { data: stats } = useQuery({
    queryKey: ['trade:stats', days],
    queryFn: () => tradeStats(days),
    refetchInterval: 15_000,
  })
  const { data: bots = [] } = useQuery({
    queryKey: ['trade:bots'],
    queryFn: tradeBots,
    refetchInterval: 15_000,
  })
  const { data: symbols = [] } = useQuery({
    queryKey: ['trade:symbols'],
    queryFn: tradeSymbols,
    refetchInterval: 30_000,
  })
  const { data: equitySeries } = useQuery({
    queryKey: ['trade:series', 'equity', days],
    queryFn: () => tradeSeries('equity', days),
    refetchInterval: 60_000,
  })
  const { data: pnlSeries } = useQuery({
    queryKey: ['trade:series', 'pnl', days],
    queryFn: () => tradeSeries('pnl', days),
    refetchInterval: 60_000,
  })
  const { data: signalsSeries } = useQuery({
    queryKey: ['trade:series', 'signals', days],
    queryFn: () => tradeSeries('signals', days),
    refetchInterval: 60_000,
  })
  const { data: liveAcct } = useQuery({
    queryKey: ['trade:account:live'],
    queryFn: tradeLiveAccount,
    refetchInterval: 15_000,
  })

  const equitySpark = equitySeries?.points.map(p => p.v) ?? []
  const pnlSpark = pnlSeries?.points.map(p => p.v) ?? []
  const signalsSpark = signalsSeries?.points.map(p => p.v) ?? []

  const pnl = stats?.total_pnl ?? 0
  const pnlPositive = pnl >= 0

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Ouroboros — cTrader Demo</h2>
        <div className="flex gap-1 bg-g-card border border-g-border rounded-lg p-0.5">
          {RANGE.map(r => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                days === r.days ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Account Equity"
          value={
            liveAcct?.available && liveAcct.total_equity != null
              ? fmtMoney(liveAcct.total_equity)
              : stats ? fmtMoney(stats.account_equity) : '…'
          }
          icon={Wallet}
          accent
          sub={
            liveAcct?.available && liveAcct.total_balance != null
              ? `Balance ${fmtMoney(liveAcct.total_balance)} · live ${
                  liveAcct.stale_seconds != null ? `${Math.round(liveAcct.stale_seconds)}s ago` : ''
                }`
              : stats ? `Balance ${fmtMoney(stats.account_balance)} · snapshot` : ''
          }
          spark={equitySpark}
        />
        <KpiCard
          label={`PnL (${days}d)`}
          value={stats ? fmtMoney(pnl) : '…'}
          icon={pnlPositive ? TrendingUp : TrendingDown}
          sub={stats ? `${stats.wins}W / ${stats.losses}L · ${stats.win_rate_pct ?? '—'}%` : ''}
          trend={pnlPositive ? 'up' : 'down'}
          spark={pnlSpark}
        />
        <KpiCard
          label="Open Positions"
          value={stats?.trades_open ?? '…'}
          icon={Activity}
          sub={stats ? `${stats.trades_closed} closed in ${days}d` : ''}
        />
        <KpiCard
          label="Avg Confidence"
          value={stats ? `${(stats.avg_confidence * 100).toFixed(1)}%` : '…'}
          icon={Target}
          sub={stats ? `${stats.executed} executed of ${stats.signals.toLocaleString()}` : ''}
          spark={signalsSpark}
        />
      </div>

      {/* Bots grid */}
      <Section title={<span className="flex items-center gap-2"><BotIcon size={14} className="text-accent" /> Snake Bots</span>}>
        {bots.length === 0 ? (
          <Card><EmptyState icon={BotIcon} title="No bots reporting" description="Bots will appear once the trade engine emits signals." /></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {bots.map(b => (
              <Card key={b.bot} padded={false} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white capitalize">{b.bot}</span>
                  <StatusBadge value={b.status} dot />
                </div>
                <div className="text-xs text-g-muted">
                  <div>{b.signal_count_7d.toLocaleString()} signals/7d</div>
                  <div>{b.executed_count_7d} executed</div>
                  <div>{b.symbols} symbols</div>
                </div>
                <div className="text-[10px] text-g-dim">
                  {b.last_signal_at
                    ? formatDistanceToNow(new Date(b.last_signal_at), { addSuffix: true })
                    : 'never'}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Active symbols */}
      <Section title={<span className="flex items-center gap-2"><BarChart3 size={14} className="text-accent" /> Active Symbols</span>}>
        <div className="overflow-x-auto rounded-xl border border-g-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-g-border bg-g-deep">
                <th className="text-left px-4 py-3 text-xs font-semibold text-g-muted uppercase tracking-wider">Symbol</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-g-muted uppercase tracking-wider">Open</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-g-muted uppercase tracking-wider">Open Lots</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-g-muted uppercase tracking-wider">Trades 24H</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-g-muted uppercase tracking-wider">PnL 24H</th>
              </tr>
            </thead>
            <tbody>
              {symbols.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-g-muted">No active symbols</td></tr>
              )}
              {symbols.map(s => (
                <tr key={s.symbol} className="border-b border-g-border/50 hover:bg-white/2">
                  <td className="px-4 py-3 font-mono text-white">{s.symbol}</td>
                  <td className="px-4 py-3 text-right text-g-text">{s.open_positions}</td>
                  <td className="px-4 py-3 text-right text-g-text">{s.open_lots.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-g-text">{s.trades_24h}</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    s.pnl_24h > 0 ? 'text-green-400'
                    : s.pnl_24h < 0 ? 'text-red-400'
                    : 'text-g-muted'
                  }`}>
                    {s.pnl_24h >= 0 ? '+' : ''}{fmtMoney(s.pnl_24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}
