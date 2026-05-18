/**
 * System › Today — the dashboard root.
 *
 * Per docs/ADMIN_IA.md §1: the root (`/`) is the cross-surface
 * System overview. Cross-vertical business snapshot up top + alerts
 * + service heartbeat link + surface-entry grid + recent activity.
 *
 * Strict ownership boundary per the IA's Appendix invariants:
 *   - NO per-vertical business detail (per-tier MRR breakdowns,
 *     customer lists, etc.). Those live under each vertical.
 *   - NO infrastructure detail (CPU / memory / disk progress bars).
 *     Those live under `/system/infrastructure` per the v1.4 IA
 *     dedup pass; we only show a one-line service-up summary here.
 *   - NO Trade-engine internals. Engine surfaces were removed from
 *     the admin dashboard in ADMIN-TRIM-1; they live in the Trade
 *     app itself.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bot, CreditCard,
  LayoutGrid, RefreshCw, Server, ShoppingCart, Target,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getAlerts, getActivity, getServices } from '../../api/endpoints'
import { getTradeMetrics } from '../../api/tradeAdmin'
import { customersBuyers, customersLeads } from '../../api/grow'
import { edgeHealthz } from '../../api/edge'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import DataTable, { Column } from '../../components/ui/DataTable'

interface Alert {
  message: string
  severity: 'critical' | 'warning' | string
}

interface ServiceRow {
  name: string
  status: string
}

interface ActivityRow {
  type: string
  customer?: string
  symbol?: string
  action?: string
  created_at?: string
}

function VerticalCard({
  surface, headline, body, to, icon: Icon,
}: {
  surface: string
  headline: string
  body: string
  to: string
  icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="group flex items-start justify-between gap-3 rounded-xl border border-g-border bg-g-card p-4 transition-all hover:border-accent/30 hover:bg-accent/5"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-g-dim">
          <Icon size={12} className="text-g-muted group-hover:text-accent" />
          {surface}
        </div>
        <div className="mt-1 text-sm font-semibold text-white">{headline}</div>
        <p className="mt-1 text-xs text-g-muted">{body}</p>
      </div>
      <ArrowRight size={14} className="text-g-dim shrink-0 mt-1 group-hover:text-accent" />
    </Link>
  )
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function Today() {
  // Cross-vertical business snapshots — one-line read per surface.
  const tradeQ = useQuery({
    queryKey: ['today:trade-metrics'],
    queryFn: getTradeMetrics,
    refetchInterval: 60_000,
    retry: 1,
  })
  const buyersQ = useQuery({
    queryKey: ['today:grow-buyers'],
    queryFn: () => customersBuyers({ limit: 1 }),
    refetchInterval: 60_000,
    retry: 1,
  })
  const leadsQ = useQuery({
    queryKey: ['today:grow-leads'],
    queryFn: customersLeads,
    refetchInterval: 60_000,
    retry: 1,
  })
  const edgeQ = useQuery({
    queryKey: ['today:edge-health'],
    queryFn: edgeHealthz,
    refetchInterval: 30_000,
    retry: 1,
  })

  // Platform health — one-line service summary; full metrics live at
  // /system/infrastructure (no CPU/mem/disk bars duplicated here).
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 30_000,
  })
  const { data: services = [], isLoading: svcLoading } = useQuery<ServiceRow[]>({
    queryKey: ['services'],
    queryFn: getServices,
    refetchInterval: 30_000,
  })
  const { data: activity = [], isLoading: actLoading } = useQuery<ActivityRow[]>({
    queryKey: ['activity'],
    queryFn: getActivity,
    refetchInterval: 15_000,
  })

  const upCount   = services.filter(s => s.status === 'active' || s.status === 'running').length
  const totalSvc  = services.length
  const downSvc   = services.filter(s => s.status === 'failed' || s.status === 'inactive')

  const activityCols: Column<ActivityRow>[] = [
    {
      key: 'type', label: 'Type',
      render: r => <span className="text-xs font-mono text-g-muted">{r.type}</span>,
    },
    {
      key: 'customer', label: 'Source',
      render: r => <span className="capitalize text-white">{r.customer ?? '—'}</span>,
    },
    {
      key: 'symbol', label: 'Symbol',
      render: r => <span className="font-mono text-xs text-g-text">{r.symbol || '—'}</span>,
    },
    {
      key: 'action', label: 'Action',
      render: r => <span className="text-xs text-g-muted">{r.action ?? '—'}</span>,
    },
    {
      key: 'created_at', label: 'Time',
      render: r => r.created_at
        ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true })
        : '—',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-g-dim">
          <Server size={12} /> System › Today
        </div>
        <h1 className="mt-1 text-lg font-semibold text-white">
          Cross-surface ops snapshot
        </h1>
        <p className="mt-0.5 text-xs text-g-muted">
          One-line read per vertical (Trade · Grow · Edge), active alerts,
          and recent activity. Infrastructure detail (CPU / memory / disk,
          per-service state) lives at{' '}
          <Link to="/system/infrastructure" className="text-accent hover:underline">/system/infrastructure</Link>.
        </p>
      </div>

      {/* Cross-vertical business snapshot — one KPI card per surface,
          plus a System alert counter. Sources are the same APIs each
          owning surface reads from, so numbers stay in sync. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Trade · MRR"
          value={tradeQ.data ? fmtMoney(tradeQ.data.mrr_usd) : tradeQ.isLoading ? '…' : '—'}
          icon={BarChart3}
          accent
          sub={tradeQ.data
            ? `${tradeQ.data.active_subscriptions} active subs`
            : tradeQ.isError ? 'trade-admin unreachable' : ''}
        />
        <KpiCard
          label="Grow · Buyers"
          value={buyersQ.data?.count ?? (buyersQ.isLoading ? '…' : '—')}
          icon={ShoppingCart}
          sub={leadsQ.data ? `${leadsQ.data.count} lead${leadsQ.data.count === 1 ? '' : 's'}` : ''}
        />
        <KpiCard
          label="Edge · Status"
          value={edgeQ.isLoading ? '…' : edgeQ.isSuccess ? 'reachable' : 'unreachable'}
          icon={Target}
          accent={edgeQ.isSuccess}
          sub={edgeQ.data?.env ?? (edgeQ.isError ? 'edge-api down' : '')}
          trend={edgeQ.isSuccess ? 'up' : 'down'}
        />
        <KpiCard
          label="Alerts"
          value={alerts.length}
          icon={AlertCircle}
          accent={alerts.length > 0}
          sub={alerts.filter(a => a.severity === 'critical').length > 0
            ? `${alerts.filter(a => a.severity === 'critical').length} critical`
            : alerts.length === 0 ? 'all clear' : ''}
          trend={alerts.length === 0 ? 'up' : 'down'}
        />
      </div>

      {/* Alerts strip (cross-product) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                alert.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              }`}
            >
              <AlertCircle size={16} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* One-line service summary — no CPU/MEM/DISK here (lives at
          /system/infrastructure per the v1.4 IA dedup). */}
      <Card>
        <div className="flex items-center justify-between text-xs">
          <span className="text-g-muted inline-flex items-center gap-1.5">
            <RefreshCw size={12} /> Services
          </span>
          <Link to="/system/infrastructure" className="text-[11px] text-g-muted hover:text-accent inline-flex items-center gap-1">
            full infra board <ArrowRight size={10} />
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-sm text-g-text">
            {svcLoading ? '…' : (
              <>
                <span className="text-emerald-400">{upCount}</span>
                {' / '}
                <span className={downSvc.length > 0 ? 'text-red-400' : 'text-g-text'}>{totalSvc}</span>
                {' running'}
              </>
            )}
          </span>
          {downSvc.length > 0 && (
            <span className="text-xs text-red-400 truncate max-w-[60%]">
              down: {downSvc.slice(0, 3).map(s => s.name).join(', ')}
              {downSvc.length > 3 ? ` +${downSvc.length - 3}` : ''}
            </span>
          )}
        </div>
      </Card>

      {/* Vertical entry cards — operator's "where do I go next?" */}
      <Section title="Go to surface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <VerticalCard
            surface="Trade"
            headline="Trade · Business"
            body="Revenue, users, subscriptions, billing for the Glitch Trade SaaS."
            to="/trade"
            icon={BarChart3}
          />
          <VerticalCard
            surface="Grow"
            headline="Grow · Business"
            body="Paid buyers, customer-user database, and Grow-side billing."
            to="/grow"
            icon={Bot}
          />
          <VerticalCard
            surface="Edge"
            headline="Edge · Platform"
            body="Service health for glitch-edge-api. Betting accounts and signals live under /edge/betting."
            to="/edge"
            icon={Target}
          />
          <VerticalCard
            surface="System"
            headline="Control Centre"
            body="Global toggles, kill switches, infra board, audit log."
            to="/system/control-centre"
            icon={LayoutGrid}
          />
        </div>
      </Section>

      {/* Recent activity */}
      <Section title="Recent activity">
        <DataTable
          columns={activityCols}
          data={activity}
          loading={actLoading}
          emptyText="No recent activity"
          dateField="created_at"
        />
      </Section>

      {/* Footer note — surface boundary reminder */}
      <div className="flex items-start gap-2 rounded-xl border border-g-border bg-g-card/40 p-3 text-xs text-g-muted">
        <Activity size={12} className="shrink-0 mt-0.5" />
        <div>
          <p>
            This is the System overview. CPU / memory / disk lives at{' '}
            <Link to="/system/infrastructure" className="text-accent hover:underline">Infrastructure</Link>;
            container / queue / log operations at{' '}
            <Link to="/system/control-centre" className="text-accent hover:underline">Control Centre</Link>;
            per-vertical KPIs under their owning surface.
          </p>
        </div>
      </div>
    </div>
  )
}
