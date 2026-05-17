/**
 * System › Today — the dashboard root.
 *
 * Per docs/ADMIN_IA.md §1: the root (`/`) is the cross-surface
 * System overview, not a Trade-only page. This file replaces the
 * pre-app-era `pages/DashboardHome.tsx`, which mixed Trade engine
 * KPIs, customer counts, and MRR into a single landing card grid.
 *
 * Composition (top-to-bottom):
 *   - Critical/active alerts strip (cross-product)
 *   - Infrastructure heartbeat: services up/down summary + CPU/mem/disk
 *   - Cross-vertical activity feed
 *   - Vertical entry cards: links into Trade · Business / Grow /
 *     Edge / System sub-routes (the operator's "where do I go next?"
 *     surface)
 *
 * Strict ownership boundary per the IA's Appendix invariants:
 *   - NO business state (MRR / ARR / customer counts / tiers /
 *     account equity / trades-today / signals-today). Those live
 *     under Trade · Business or Trade · Engine, NOT under System.
 *   - NO Trade-engine internals. Engine status moved back to
 *     `/trade/legacy` (slated for rename to `/trade/engine` in
 *     ADMIN-1g) where it belongs.
 *   - Per-vertical revenue lives under the vertical. System pages
 *     stay platform-level only.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bot, Cpu,
  HardDrive, MemoryStick, RefreshCw, Server, LayoutGrid, Target,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getAlerts, getActivity, getServices, getSystem } from '../../api/endpoints'
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

interface SystemMetrics {
  cpu_percent?: number
  memory?: { percent?: number }
  disk?: { percent?: number }
}

interface ActivityRow {
  type: string
  customer?: string
  symbol?: string
  action?: string
  created_at?: string
}

function ProgressBar({
  label, value, icon: Icon,
}: {
  label: string
  value: number
  icon?: LucideIcon
}) {
  const color = value > 85 ? 'bg-red-400'
              : value > 70 ? 'bg-yellow-400'
              :              'bg-accent'
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-g-muted mb-1">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon size={12} />}
          {label}
        </span>
        <span className="text-g-text font-mono">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-g-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  )
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

export default function Today() {
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
  const { data: system } = useQuery<SystemMetrics>({
    queryKey: ['system'],
    queryFn: getSystem,
    refetchInterval: 10_000,
  })
  const { data: activity = [], isLoading: actLoading } = useQuery<ActivityRow[]>({
    queryKey: ['activity'],
    queryFn: getActivity,
    refetchInterval: 15_000,
  })

  const upCount   = services.filter(s => s.status === 'active' || s.status === 'running').length
  const downCount = services.filter(s => s.status === 'failed' || s.status === 'inactive').length
  const totalSvc  = services.length

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
      {/* Header strip — read-only context so the operator knows the
          dashboard root is the System overview, not a Trade page. */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-g-dim">
          <Server size={12} /> System › Today
        </div>
        <h1 className="mt-1 text-lg font-semibold text-white">
          Cross-surface ops snapshot
        </h1>
        <p className="mt-0.5 text-xs text-g-muted">
          Infra heartbeat, active alerts, recent activity across Trade · Grow · Edge · System.
          Business state (MRR, customers, account equity) lives under each owning vertical.
        </p>
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

      {/* Infra heartbeat */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server size={14} className="text-g-muted" />
            Infrastructure
          </h2>
          <Link to="/system/infrastructure" className="text-[11px] text-g-muted hover:text-accent inline-flex items-center gap-1">
            full board <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service heartbeat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-g-muted inline-flex items-center gap-1.5">
                <RefreshCw size={12} /> Services
              </span>
              <span className="font-mono text-g-text">
                {svcLoading ? '…' : (
                  <>
                    <span className="text-emerald-400">{upCount}</span>
                    {' / '}
                    <span className={downCount > 0 ? 'text-red-400' : 'text-g-text'}>{totalSvc}</span>
                    {' running'}
                  </>
                )}
              </span>
            </div>
            {downCount > 0 && services
              .filter(s => s.status === 'failed' || s.status === 'inactive')
              .slice(0, 4)
              .map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-g-text truncate">{s.name}</span>
                  <span className="text-red-400">{s.status}</span>
                </div>
              ))}
            {downCount === 0 && !svcLoading && (
              <p className="text-xs text-g-dim">All registered services are up.</p>
            )}
          </div>

          {/* CPU / mem / disk */}
          <div className="space-y-3">
            <ProgressBar label="CPU"    value={system?.cpu_percent ?? 0}      icon={Cpu} />
            <ProgressBar label="Memory" value={system?.memory?.percent ?? 0}  icon={MemoryStick} />
            <ProgressBar label="Disk"   value={system?.disk?.percent ?? 0}    icon={HardDrive} />
          </div>
        </div>
      </Card>

      {/* Vertical entry cards — operator's "where do I go next?" */}
      <Section title="Go to surface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <VerticalCard
            surface="Trade"
            headline="Trade · Business"
            body="Revenue, users, subscriptions for the Glitch Trade SaaS."
            to="/trade"
            icon={BarChart3}
          />
          <VerticalCard
            surface="Grow"
            headline="Grow · Overview"
            body="Per-brand AI agents — Sales, Ads, Social, UGC, SEO, Voice."
            to="/grow"
            icon={Bot}
          />
          <VerticalCard
            surface="Edge"
            headline="Edge · Betting"
            body="Accounts, signals, and routing for the Glitch Edge platform."
            to="/edge"
            icon={Target}
          />
          {/* System self-card points at a platform-ops surface, not at
              business-operational data. Per the 2026-05-17 supervisor
              clarification, customer/billing/user state belongs to the
              owning vertical (Trade/Grow/Edge), not to System. */}
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
            This is the System overview. Trade engine status, account equity, MRR, customer
            tiers, and per-vertical KPIs live under their owning surface — open the relevant
            vertical from the sidebar or the cards above.
          </p>
        </div>
      </div>
    </div>
  )
}
