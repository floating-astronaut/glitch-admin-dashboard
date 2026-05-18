/**
 * System › Today — the dashboard root.
 *
 * Per docs/ADMIN_IA.md §1: the root (`/`) is the cross-surface
 * System overview. Cross-vertical KPI strip + admin alerts + service
 * heartbeat link + surface-entry grid + recent admin actions.
 *
 * Strict ownership boundary per the IA's Appendix invariants:
 *   - NO per-vertical business detail. Those live under each vertical.
 *   - NO infrastructure detail. CPU / memory / disk live at
 *     `/system/infrastructure` per the v1.4 dedup.
 *   - NO Trade-engine internals. Engine surfaces were removed in
 *     ADMIN-TRIM-1. Alerts coming from admin_api `/api/dashboard/alerts`
 *     are filtered client-side here to drop `trade_engine_*` types
 *     (the upstream still emits Ouroboros health alerts; that's a
 *     cross-repo fix on admin_api/routers/dashboard.py — not in
 *     scope for the dashboard rework lane).
 *   - NO `getActivity` feed. The upstream endpoint reads from
 *     `ml_trades` and surfaces trade_close events from Trade-engine
 *     bots — exactly the relic that ADMIN-TRIM-1 dropped. Replaced
 *     here with `getAuditLog` so the "Recent activity" section shows
 *     admin/operator actions instead.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bot, CreditCard,
  FileClock, LayoutGrid, RefreshCw, Server, ShoppingCart, Target,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getAlerts, getAuditLog, getServices } from '../../api/endpoints'
import { getTradeMetrics } from '../../api/tradeAdmin'
import { customersBuyers, customersLeads } from '../../api/grow'
import { edgeHealthz } from '../../api/edge'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import DataTable, { Column } from '../../components/ui/DataTable'

interface Alert {
  type?: string
  message: string
  severity: 'critical' | 'warning' | string
}

interface ServiceRow {
  name: string
  status: string
}

interface AuditEntry {
  id: number
  admin_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  ip_address: string | null
  created_at: string
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

// Drop alerts that belong to Trade-engine internals — the upstream
// admin_api router still emits them but the admin dashboard no longer
// carries those surfaces (ADMIN-TRIM-1, IA v1.4).
function isAdminScopedAlert(a: Alert): boolean {
  const t = (a.type ?? '').toLowerCase()
  if (t.startsWith('trade_engine')) return false
  // Defensive: also drop by message if the type is missing.
  const m = a.message.toLowerCase()
  if (m.includes('ouroboros') || m.includes('trade engine')) return false
  return true
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

  // Platform health — alerts (filtered) + one-line service summary.
  const { data: rawAlerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 30_000,
  })
  const alerts = rawAlerts.filter(isAdminScopedAlert)
  const { data: services = [], isLoading: svcLoading } = useQuery<ServiceRow[]>({
    queryKey: ['services'],
    queryFn: getServices,
    refetchInterval: 30_000,
  })

  // Recent admin/operator actions — replaces the old trade-engine
  // activity feed (ml_trades) that ADMIN-TRIM-1 dropped from scope.
  const auditQ = useQuery<{ total: number; entries: AuditEntry[] }>({
    queryKey: ['today:audit'],
    queryFn: () => getAuditLog(1, 10),
    refetchInterval: 30_000,
  })

  const upCount   = services.filter(s => s.status === 'active' || s.status === 'running').length
  const totalSvc  = services.length
  const downSvc   = services.filter(s => s.status === 'failed' || s.status === 'inactive')

  const auditCols: Column<AuditEntry>[] = [
    {
      key: 'created_at', label: 'Time',
      render: r => (
        <span title={r.created_at} className="text-xs text-g-muted whitespace-nowrap">
          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'admin_email', label: 'Actor',
      render: r => r.admin_email
        ? <span className="font-mono text-xs text-g-text">{r.admin_email}</span>
        : <span className="text-g-dim text-xs">system</span>,
    },
    {
      key: 'action', label: 'Action',
      render: r => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
          {r.action}
        </span>
      ),
    },
    {
      key: 'target', label: 'Target',
      render: r => r.target_type
        ? (
          <span className="text-xs font-mono text-g-text">
            {r.target_type}{r.target_id ? ` · ${r.target_id}` : ''}
          </span>
        )
        : <span className="text-g-dim text-xs">—</span>,
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
          One-line read per vertical (Trade · Grow · Edge), active admin
          alerts, and recent admin actions. Infrastructure detail
          (CPU / memory / disk, per-service state) lives at{' '}
          <Link to="/system/infrastructure" className="text-accent hover:underline">/system/infrastructure</Link>.
        </p>
      </div>

      {/* Cross-vertical business snapshot — one KPI card per surface,
          plus a System alert counter. */}
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

      {/* Admin-scoped alerts strip — trade-engine alerts are filtered
          out client-side; the upstream admin_api still emits them. */}
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

      {/* Recent admin actions — sourced from /api/settings/audit, NOT
          /api/dashboard/activity (the latter reads ml_trades and would
          surface stale Trade-engine events). */}
      <Section title="Recent admin actions">
        {auditQ.isError ? (
          <Card>
            <p className="text-xs text-red-400">
              Couldn't load audit feed. <code className="font-mono">/api/settings/audit</code> returned an error.
            </p>
          </Card>
        ) : (
          <>
            <DataTable
              columns={auditCols}
              data={auditQ.data?.entries ?? []}
              loading={auditQ.isLoading}
              emptyText="No admin actions in range"
            />
            <div className="flex justify-end mt-2">
              <Link
                to="/system/audit-logs"
                className="inline-flex items-center gap-1 text-[11px] text-g-muted hover:text-accent"
              >
                <FileClock size={11} /> full audit log <ArrowRight size={10} />
              </Link>
            </div>
          </>
        )}
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
