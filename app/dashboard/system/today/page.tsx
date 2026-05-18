/**
 * /dashboard/system/today — cross-surface operator snapshot.
 *
 * v1.4 IA: this is the dashboard root for the v2 shell. One-line read
 * per vertical (Trade MRR / Grow buyers / Edge health) + admin
 * alerts strip + recent admin actions + surface-entry grid.
 *
 * Ownership invariants (per docs/ADMIN_IA.md §6):
 *   - NO per-vertical detail (those live under their owning surface).
 *   - NO infrastructure detail (CPU / memory live at /system/infrastructure).
 *   - NO Trade-engine internals. Stale trade_engine_* alerts from
 *     admin_api `/api/dashboard/alerts` are filtered client-side here;
 *     the upstream endpoint still emits them (cross-repo fix, not in
 *     scope for the v2 SPA).
 *   - Recent activity reads `/api/settings/audit` (admin actions),
 *     NOT `/api/dashboard/activity` (which is the ml_trades feed).
 */
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bot, FileClock,
  LayoutGrid, Server, ShoppingCart, Target,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { getAlerts, getAuditLog } from '@/lib/api/endpoints'
import { getTradeMetrics } from '@/lib/api/tradeAdmin'
import { customersBuyers, customersLeads } from '@/lib/api/grow'
import { edgeHealthz } from '@/lib/api/edge'

interface Alert {
  type?: string
  message: string
  severity: 'critical' | 'warning' | string
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

/** Drop trade-engine alerts — those surfaces aren't in the v2 dashboard. */
function isAdminScopedAlert(a: Alert): boolean {
  const t = (a.type ?? '').toLowerCase()
  if (t.startsWith('trade_engine')) return false
  const m = a.message.toLowerCase()
  if (m.includes('ouroboros') || m.includes('trade engine')) return false
  return true
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Small original KPI tile, kit-token styled ──────────────────────────────
function Kpi({
  label, value, sub, icon: Icon, accent, trend, loading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: LucideIcon
  accent?: boolean
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}) {
  const trendDot =
    trend === 'up' ? 'bg-emerald-500' :
    trend === 'down' ? 'bg-red-500' :
    trend === 'neutral' ? 'bg-muted-foreground/40' : null
  return (
    <Card className={cn(accent && 'border-primary/30 bg-primary/5')}>
      <CardContent className="space-y-1.5 py-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="size-3" />
          {label}
          {trendDot && <span className={cn('ml-auto inline-block size-1.5 rounded-full', trendDot)} />}
        </div>
        <div className="text-foreground text-xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-6 w-20" /> : value}
        </div>
        {sub != null && (
          <div className="text-muted-foreground text-[11px]">{sub}</div>
        )}
      </CardContent>
    </Card>
  )
}

function SurfaceCard({
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
      href={to}
      className="border-border bg-card hover:border-primary/30 hover:bg-primary/5 group flex items-start justify-between gap-3 rounded-xl border p-4 transition-colors">
      <div className="min-w-0">
        <div className="text-muted-foreground/80 flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="text-muted-foreground group-hover:text-primary size-3" />
          {surface}
        </div>
        <div className="text-foreground mt-1 text-sm font-semibold">{headline}</div>
        <p className="text-muted-foreground mt-1 text-xs">{body}</p>
      </div>
      <ArrowRight className="text-muted-foreground/60 group-hover:text-primary mt-1 size-4 shrink-0" />
    </Link>
  )
}

export default function SystemTodayPage() {
  // ── Cross-vertical KPIs ────────────────────────────────────────────────
  const tradeQ = useQuery({ queryKey: ['today:trade'], queryFn: getTradeMetrics, refetchInterval: 60_000 })
  const buyersQ = useQuery({ queryKey: ['today:buyers'], queryFn: () => customersBuyers({ limit: 1 }), refetchInterval: 60_000 })
  const leadsQ = useQuery({ queryKey: ['today:leads'], queryFn: customersLeads, refetchInterval: 60_000 })
  const edgeQ = useQuery({ queryKey: ['today:edge'], queryFn: edgeHealthz, refetchInterval: 30_000 })

  // ── Alerts (filtered) ──────────────────────────────────────────────────
  const alertsQ = useQuery<Alert[]>({ queryKey: ['today:alerts'], queryFn: getAlerts, refetchInterval: 30_000 })
  const alerts = useMemo(() => (alertsQ.data ?? []).filter(isAdminScopedAlert), [alertsQ.data])
  const critical = alerts.filter(a => a.severity === 'critical').length

  // ── Recent admin actions ───────────────────────────────────────────────
  const auditQ = useQuery<{ total: number; entries: AuditEntry[] }>({
    queryKey: ['today:audit'],
    queryFn: () => getAuditLog(1, 10),
    refetchInterval: 30_000,
  })
  const entries = auditQ.data?.entries ?? []

  return (
    <div className="space-y-6 p-(--content-padding)">
      <div>
        <div className="text-muted-foreground/80 flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Server className="size-3" /> System › Today
        </div>
        <h1 className="text-foreground mt-1 text-lg font-semibold">Cross-surface ops snapshot</h1>
        <p className="text-muted-foreground mt-0.5 text-xs">
          One-line read per vertical, active alerts, recent admin actions. Infrastructure
          detail (CPU / memory / disk, per-service state) lives at{' '}
          <Link href="/dashboard/system/infrastructure" className="text-primary hover:underline">/system/infrastructure</Link>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Trade · MRR"
          value={tradeQ.data ? fmtMoney(tradeQ.data.mrr_usd) : '—'}
          loading={tradeQ.isLoading}
          icon={BarChart3}
          accent
          sub={tradeQ.data
            ? `${tradeQ.data.active_subscriptions} active subs`
            : tradeQ.isError ? 'trade-admin unreachable' : null}
        />
        <Kpi
          label="Grow · Buyers"
          value={buyersQ.data?.count ?? '—'}
          loading={buyersQ.isLoading}
          icon={ShoppingCart}
          sub={leadsQ.data ? `${leadsQ.data.count} lead${leadsQ.data.count === 1 ? '' : 's'}` : null}
        />
        <Kpi
          label="Edge · Status"
          value={edgeQ.isLoading ? '…' : edgeQ.isSuccess ? 'reachable' : 'unreachable'}
          loading={edgeQ.isLoading}
          icon={Target}
          accent={edgeQ.isSuccess}
          trend={edgeQ.isSuccess ? 'up' : 'down'}
          sub={edgeQ.data?.env ?? (edgeQ.isError ? 'edge-api down' : null)}
        />
        <Kpi
          label="Alerts"
          value={alerts.length}
          loading={alertsQ.isLoading}
          icon={AlertCircle}
          accent={alerts.length > 0}
          trend={alerts.length === 0 ? 'up' : 'down'}
          sub={critical > 0 ? `${critical} critical` : alerts.length === 0 ? 'all clear' : null}
        />
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm',
                a.severity === 'critical'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
              )}>
              <AlertCircle className="size-4" />
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Go to surface</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SurfaceCard
            surface="Trade"
            headline="Trade · Business"
            body="Revenue, users, subscriptions, billing for the Glitch Trade SaaS."
            to="/dashboard/trade/revenue"
            icon={BarChart3}
          />
          <SurfaceCard
            surface="Grow"
            headline="Grow · Business"
            body="Paid buyers, customer-user database, and Grow-side billing."
            to="/dashboard/grow/customers"
            icon={Bot}
          />
          <SurfaceCard
            surface="Edge"
            headline="Edge · Platform"
            body="Service health for glitch-edge-api. Betting accounts and signals."
            to="/dashboard/edge"
            icon={Target}
          />
          <SurfaceCard
            surface="System"
            headline="Server Map"
            body="Read-only ingest of glitch-trade-app/docs/SERVER_*.md."
            to="/dashboard/system/server-map"
            icon={LayoutGrid}
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between">
          <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Recent admin actions</h2>
          <Link
            href="/dashboard/system/audit-logs"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-[10px]">
            <FileClock className="size-3" /> full audit log <ArrowRight className="size-3" />
          </Link>
        </div>
        <Card>
          <CardContent className="py-2">
            {auditQ.isError ? (
              <p className="text-destructive px-2 py-3 text-xs">
                Couldn&apos;t load audit feed. <code className="font-mono">/api/settings/audit</code> returned an error.
              </p>
            ) : auditQ.isLoading ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-xs">No admin actions yet.</p>
            ) : (
              <ul className="divide-border divide-y">
                {entries.map(e => (
                  <li key={e.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-1 py-2 text-xs">
                    <span className="text-muted-foreground whitespace-nowrap" title={e.created_at}>
                      {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-foreground/90 truncate font-mono">{e.admin_email ?? 'system'}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{e.action}</Badge>
                    <span className="text-muted-foreground truncate font-mono">
                      {e.target_type ? `${e.target_type}${e.target_id ? ` · ${e.target_id}` : ''}` : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <Activity className="mt-0.5 size-3 shrink-0" />
          <p>
            This is the System overview. CPU / memory / disk lives at{' '}
            <Link href="/dashboard/system/infrastructure" className="text-primary hover:underline">Infrastructure</Link>;
            container / queue / log operations at{' '}
            <Link href="/dashboard/system/control-centre" className="text-primary hover:underline">Control Centre</Link>;
            per-vertical KPIs under their owning surface.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
