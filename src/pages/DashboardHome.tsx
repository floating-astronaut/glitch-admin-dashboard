import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getKpis, getAlerts, getActivity } from '../api/endpoints'
import KpiCard from '../components/ui/KpiCard'
import DataTable, { Column } from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import Card from '../components/ui/Surface'
import Section from '../components/ui/Section'
import {
  Users, DollarSign, Bot, Activity, Mail,
  AlertCircle, ArrowRight, BarChart3, Wallet, Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Kpis {
  total_customers: number
  active_customers: number
  by_tier: Record<string, number>
  mrr_usd: number
  arr_usd: number
  email_signups: number
  query_cost_today_usd: number
  trade_engine: { status: string; age_sec: number | null }
  trades_open: number
  trades_today: number
  signals_today: number
  account_equity: number
}

function fmtMoney(n: number, dp = 2) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const { data: kpis, isLoading: kpisLoading } = useQuery<Kpis>({
    queryKey: ['kpis'],
    queryFn: getKpis,
    refetchInterval: 30_000,
  })
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 30_000,
  })
  const { data: activity = [], isLoading: actLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
    refetchInterval: 15_000,
  })

  const activityCols: Column<any>[] = [
    { key: 'type', label: 'Type', render: r => (
      <span className="text-xs font-mono text-g-muted">{r.type}</span>
    )},
    { key: 'customer', label: 'Source', render: r => (
      <span className="capitalize text-white">{r.customer}</span>
    )},
    { key: 'symbol', label: 'Symbol', render: r => (
      <span className="font-mono text-xs text-g-text">{r.symbol || '—'}</span>
    )},
    { key: 'action', label: 'Action', render: r => (
      <span className="text-xs text-g-muted">{r.action}</span>
    )},
    { key: 'created_at', label: 'Time', render: r => r.created_at
      ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true })
      : '—'
    },
  ]

  const teStatus = kpis?.trade_engine?.status ?? 'unknown'

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
              alert.severity === 'critical'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            }`}>
              <AlertCircle size={16} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Trade Engine"
          value={kpisLoading ? '…' : teStatus}
          icon={Bot}
          accent={teStatus === 'healthy'}
          sub={kpis?.trade_engine?.age_sec != null
            ? `last signal ${kpis.trade_engine.age_sec}s ago`
            : '—'}
          trend={teStatus === 'healthy' ? 'up' : teStatus === 'stale' ? 'neutral' : 'down'}
        />
        <KpiCard
          label="Account Equity"
          value={kpisLoading ? '…' : fmtMoney(kpis?.account_equity ?? 0)}
          icon={Wallet}
          sub={`${kpis?.trades_open ?? 0} open positions`}
        />
        <KpiCard
          label="Customers"
          value={kpisLoading ? '…' : kpis?.total_customers ?? 0}
          icon={Users}
          sub={`${kpis?.active_customers ?? 0} active`}
        />
        <KpiCard
          label="MRR"
          value={kpisLoading ? '…' : fmtMoney(kpis?.mrr_usd ?? 0, 0)}
          icon={DollarSign}
          accent
          sub={`ARR ${fmtMoney(kpis?.arr_usd ?? 0, 0)}`}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Trades Today"
          value={kpisLoading ? '…' : kpis?.trades_today ?? 0}
          icon={BarChart3}
        />
        <KpiCard
          label="Signals Today"
          value={kpisLoading ? '…' : (kpis?.signals_today ?? 0).toLocaleString()}
          icon={Zap}
        />
        <KpiCard
          label="Email Signups"
          value={kpisLoading ? '…' : kpis?.email_signups ?? 0}
          icon={Mail}
        />
        <KpiCard
          label="Query Cost Today"
          value={kpisLoading ? '…' : `$${(kpis?.query_cost_today_usd ?? 0).toFixed(4)}`}
          icon={DollarSign}
        />
      </div>

      {kpis?.by_tier && Object.keys(kpis.by_tier).length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">Customers by Tier</h2>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(kpis.by_tier).map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-2">
                <StatusBadge value={tier} />
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Trade Overview', to: '/trade',    icon: Activity },
          { label: 'Customers',      to: '/clients',  icon: Users },
          { label: 'Billing',        to: '/billing',  icon: DollarSign },
        ].map(({ label, to, icon: Icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex items-center justify-between px-4 py-3 bg-g-card border border-g-border rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group"
          >
            <div className="flex items-center gap-2 text-sm text-g-text">
              <Icon size={16} className="text-g-muted group-hover:text-accent" />
              {label}
            </div>
            <ArrowRight size={14} className="text-g-dim group-hover:text-accent" />
          </button>
        ))}
      </div>

      <Section title="Recent Activity">
        <DataTable
          columns={activityCols}
          data={activity}
          loading={actLoading}
          emptyText="No recent activity"
          dateField="created_at"
        />
      </Section>
    </div>
  )
}
