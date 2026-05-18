/**
 * System › Settings
 *
 * Three operator-useful sections — every value is read-only:
 *
 *   1. Upstream APIs   — live reachability probes of the services the
 *                        dashboard sits on top of (admin_api, trade-
 *                        admin, edge-api). 3-AM-incident gold: one
 *                        glance tells you which upstream is the problem.
 *   2. Environment     — admin_api env-var presence flags from
 *                        GET /api/settings/env-status, grouped by
 *                        purpose. Values are never displayed.
 *   3. Build info      — which build of the SPA is live (timestamp +
 *                        branch + short SHA, injected at vite build
 *                        time). Useful for "did my last push deploy?".
 *
 * Admin users moved to /system/users (UserManagement); audit log lives
 * at /system/audit-logs (AuditLogs).
 */
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Check, X, ShieldCheck, Settings as SettingsIcon, RefreshCw,
  Server as ServerIcon, BarChart3, Target, GitBranch,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { getEnvStatus } from '../../api/endpoints'
import { getTradeMetrics } from '../../api/tradeAdmin'
import { edgeHealthz } from '../../api/edge'
import Card from '../../components/ui/Surface'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'

// ── Categories for env vars (client-side lookup; backend returns flat) ─────
type Category =
  | 'Auth + bootstrap'
  | 'Databases'
  | 'Upstreams'
  | 'OAuth + integrations'
  | 'Webhooks'
  | 'SSO'
  | 'Other'

const CATEGORY_MAP: Record<string, Category> = {
  ADMIN_EMAIL: 'Auth + bootstrap',
  ADMIN_PASSWORD: 'Auth + bootstrap',
  ADMIN_JWT_SECRET: 'Auth + bootstrap',
  DATABASE_URL: 'Databases',
  ML_DATABASE_URL: 'Databases',
  SA_DATABASE_URL: 'Databases',
  REDIS_HOST: 'Databases',
  REDIS_PORT: 'Databases',
  PAYMENT_SERVICE_URL: 'Upstreams',
  GROW_FULFILL_SECRET: 'Upstreams',
  TRADE_API_URL: 'Upstreams',
  TRADE_ADMIN_API_SECRET: 'Upstreams',
  CTRADER_PUBLIC_CLIENT_ID: 'OAuth + integrations',
  CTRADER_PUBLIC_CLIENT_SECRET: 'OAuth + integrations',
  CTRADER_OAUTH_SCOPE: 'OAuth + integrations',
  IB_HOST: 'OAuth + integrations',
  IB_PORT: 'OAuth + integrations',
  TRADE_WEBHOOK_SECRET: 'Webhooks',
  SSO_TIMEOUT_SECONDS: 'SSO',
}
const CATEGORY_ORDER: Category[] = [
  'Auth + bootstrap',
  'Databases',
  'Upstreams',
  'OAuth + integrations',
  'Webhooks',
  'SSO',
  'Other',
]

// ── Upstream probes ────────────────────────────────────────────────────────
interface UpstreamProbe {
  key: string
  label: string
  url: string
  icon: typeof ServerIcon
  fetcher: () => Promise<unknown>
}

const UPSTREAMS: UpstreamProbe[] = [
  {
    key: 'admin-api',
    label: 'admin_api',
    url: '/health',
    icon: ServerIcon,
    fetcher: () => api.get('/health').then(r => r.data),
  },
  {
    key: 'trade-admin',
    label: 'trade-admin (/api/trade-admin)',
    url: '/api/trade-admin/metrics',
    icon: BarChart3,
    fetcher: () => getTradeMetrics(),
  },
  {
    key: 'edge-api',
    label: 'edge-api (/api/edge proxy)',
    url: '/api/edge/healthz',
    icon: Target,
    fetcher: () => edgeHealthz(),
  },
]

function UpstreamRow({ probe }: { probe: UpstreamProbe }) {
  const q = useQuery({
    queryKey: ['settings:upstream', probe.key],
    queryFn: probe.fetcher,
    refetchInterval: 30_000,
    retry: 1,
  })
  const Icon = probe.icon
  const ok = q.isSuccess
  const loading = q.isLoading
  return (
    <div className="flex items-center justify-between bg-g-deep border border-g-border rounded-lg px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={14} className="text-g-muted shrink-0" />
        <div className="min-w-0">
          <div className="text-xs text-g-text">{probe.label}</div>
          <div className="text-[10px] text-g-dim font-mono truncate">{probe.url}</div>
        </div>
      </div>
      {loading
        ? <span className="text-[11px] text-g-muted shrink-0">…</span>
        : ok
          ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
              <Check size={12} /> reachable
            </span>
          : <span className="inline-flex items-center gap-1 text-[11px] text-red-400 shrink-0">
              <X size={12} /> {q.error instanceof Error ? q.error.message.slice(0, 24) : 'unreachable'}
            </span>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Settings() {
  const { data: envStatus, isLoading, refetch } = useQuery({
    queryKey: ['envStatus'],
    queryFn: getEnvStatus,
    refetchInterval: 60_000,
  })

  const entries = envStatus ? Object.entries(envStatus) : []
  const total = entries.length
  const present = entries.filter(([, ok]) => ok).length
  const missing = total - present

  // Group env vars by category for display.
  const grouped = entries.reduce<Record<Category, [string, boolean][]>>((acc, [k, v]) => {
    const cat = CATEGORY_MAP[k] ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push([k, Boolean(v)])
    return acc
  }, {} as Record<Category, [string, boolean][]>)
  for (const cat of CATEGORY_ORDER) {
    if (grouped[cat]) grouped[cat].sort(([a], [b]) => a.localeCompare(b))
  }

  // Build info — defined in vite.config.ts; falls back to 'unknown' if
  // the build host didn't have git on PATH.
  const buildTimestamp = (typeof __BUILD_TIMESTAMP__ === 'string') ? __BUILD_TIMESTAMP__ : 'unknown'
  const buildSha       = (typeof __BUILD_SHA__       === 'string') ? __BUILD_SHA__       : 'unknown'
  const buildBranch    = (typeof __BUILD_BRANCH__    === 'string') ? __BUILD_BRANCH__    : 'unknown'
  const buildAgo = buildTimestamp !== 'unknown'
    ? formatDistanceToNow(new Date(buildTimestamp), { addSuffix: true })
    : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <SettingsIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white">System · Settings</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Upstream reachability, admin_api environment flags, and the
            current SPA build. Admin users live at{' '}
            <Link to="/system/users" className="text-accent hover:underline">/system/users</Link>;
            audit log at{' '}
            <Link to="/system/audit-logs" className="text-accent hover:underline">/system/audit-logs</Link>.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-g-border text-g-muted hover:text-accent hover:border-accent/30 transition-colors shrink-0"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* Upstream APIs — the 3-AM section. One line per upstream the
          dashboard depends on, refetched every 30 s. */}
      <Section title="Upstream APIs">
        <Card>
          <div className="space-y-2">
            {UPSTREAMS.map(p => <UpstreamRow key={p.key} probe={p} />)}
          </div>
        </Card>
      </Section>

      {/* Environment — admin_api env-var presence flags, grouped. */}
      <Section title="admin_api environment">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          <KpiCard
            label="Tracked vars"
            value={isLoading ? '…' : total}
            icon={SettingsIcon}
          />
          <KpiCard
            label="Present"
            value={isLoading ? '…' : present}
            icon={Check}
            accent={total > 0 && missing === 0}
            trend={missing === 0 ? 'up' : 'neutral'}
          />
          <KpiCard
            label="Missing"
            value={isLoading ? '…' : missing}
            icon={X}
            accent={missing > 0}
            trend={missing > 0 ? 'down' : 'neutral'}
          />
        </div>

        <Card>
          <div className="flex items-center gap-2 text-xs text-g-muted mb-3">
            <ShieldCheck size={14} className="text-accent" />
            Values are never displayed — only presence is indicated.
          </div>

          {isLoading ? (
            <p className="text-xs text-g-dim py-2">Loading…</p>
          ) : total === 0 ? (
            <p className="text-xs text-g-dim py-2">No environment vars tracked.</p>
          ) : (
            <div className="space-y-5">
              {CATEGORY_ORDER.map(cat => {
                const rows = grouped[cat]
                if (!rows || rows.length === 0) return null
                return (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-wide text-g-muted mb-1.5">
                      {cat}
                    </div>
                    <div className="space-y-1.5">
                      {rows.map(([k, ok]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between bg-g-deep border border-g-border rounded-lg px-3 py-2"
                        >
                          <span className="font-mono text-xs text-g-text">{k}</span>
                          {ok
                            ? <Check size={14} className="text-emerald-400" />
                            : <X size={14} className="text-red-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </Section>

      {/* Build info — injected at vite build time. */}
      <Section title="Build info">
        <Card>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-g-muted inline-flex items-center gap-1.5">
                <GitBranch size={12} /> Built
              </span>
              <span className="text-g-text font-mono" title={buildTimestamp}>
                {buildAgo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-g-muted">Branch</span>
              <span className="text-g-text font-mono">{buildBranch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-g-muted">Commit</span>
              <span className="text-g-text font-mono">{buildSha}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-g-muted">Bundle</span>
              <span className="text-g-text font-mono">vite + react + shadcn</span>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  )
}
