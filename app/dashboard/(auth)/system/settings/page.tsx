/**
 * /dashboard/system/settings — operator-side configuration view.
 *
 * Three read-only sections:
 *   1. Upstream APIs   live reachability probes (admin_api /health,
 *                      trade-admin /metrics, edge /healthz).
 *   2. Environment     admin_api env-var presence flags from
 *                      GET /api/settings/env-status. Values never
 *                      leave the server — presence-only.
 *   3. Build info      lightweight commit/timestamp display when
 *                      NEXT_PUBLIC_BUILD_* env vars are present.
 *
 * Admin users live at /dashboard/system/users (separate page);
 * audit log lives at /dashboard/system/audit-logs.
 */
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3, Check, GitBranch, RefreshCw, Server,
  Settings as SettingsIcon, ShieldCheck, Target, X,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import api from '@/lib/api/client'
import { getEnvStatus } from '@/lib/api/endpoints'
import { getTradeMetrics } from '@/lib/api/tradeAdmin'
import { edgeHealthz } from '@/lib/api/edge'

// ── Env-var categories (client-side lookup; backend returns flat) ──────────
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
  icon: LucideIcon
  fetcher: () => Promise<unknown>
}

const UPSTREAMS: UpstreamProbe[] = [
  {
    key: 'admin-api',
    label: 'admin_api',
    url: '/health',
    icon: Server,
    fetcher: () => api.get('/health').then((r) => r.data),
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
  return (
    <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="text-muted-foreground size-3 shrink-0" />
        <div className="min-w-0">
          <div className="text-foreground text-xs">{probe.label}</div>
          <div className="text-muted-foreground/80 truncate font-mono text-[10px]">{probe.url}</div>
        </div>
      </div>
      {q.isLoading ? (
        <Skeleton className="h-4 w-16" />
      ) : q.isSuccess ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" /> reachable
        </span>
      ) : (
        <span className="text-destructive inline-flex shrink-0 items-center gap-1 text-[11px]">
          <X className="size-3" /> unreachable
        </span>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const envQ = useQuery({
    queryKey: ['envStatus'],
    queryFn: getEnvStatus,
    refetchInterval: 60_000,
  })

  const entries = envQ.data ? Object.entries(envQ.data) : []
  const total = entries.length
  const present = entries.filter(([, ok]) => ok).length
  const missing = total - present

  const grouped = useMemo(() => {
    const acc = {} as Record<Category, [string, boolean][]>
    for (const [k, v] of entries) {
      const cat = CATEGORY_MAP[k] ?? 'Other'
      ;(acc[cat] ??= []).push([k, Boolean(v)])
    }
    for (const cat of CATEGORY_ORDER) {
      if (acc[cat]) acc[cat].sort(([a], [b]) => a.localeCompare(b))
    }
    return acc
  }, [entries])

  return (
    <div className="space-y-6 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <SettingsIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">System · Settings</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Upstream reachability + admin_api environment flags. Admin users live at{' '}
            <Link href="/dashboard/system/users" className="text-primary hover:underline">/system/users</Link>;
            audit log at{' '}
            <Link href="/dashboard/system/audit-logs" className="text-primary hover:underline">/system/audit-logs</Link>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => envQ.refetch()}>
          <RefreshCw className={cn('size-3', envQ.isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* Upstream APIs — 3-AM-incident gold */}
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Upstream APIs</h2>
        <Card>
          <CardContent className="space-y-2 py-3">
            {UPSTREAMS.map((p) => <UpstreamRow key={p.key} probe={p} />)}
          </CardContent>
        </Card>
      </section>

      {/* Environment */}
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          admin_api environment
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Kpi label="Tracked vars" value={envQ.isLoading ? null : total} icon={SettingsIcon} />
          <Kpi
            label="Present"
            value={envQ.isLoading ? null : present}
            icon={Check}
            accent={total > 0 && missing === 0}
          />
          <Kpi
            label="Missing"
            value={envQ.isLoading ? null : missing}
            icon={X}
            accent={missing > 0}
            danger={missing > 0}
          />
        </div>

        <Card>
          <CardContent className="space-y-5 py-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <ShieldCheck className="text-primary size-3" />
              Values are never displayed — only presence is indicated.
            </div>

            {envQ.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
              </div>
            ) : total === 0 ? (
              <p className="text-muted-foreground text-xs">No environment vars tracked.</p>
            ) : (
              CATEGORY_ORDER.map((cat) => {
                const rows = grouped[cat]
                if (!rows || rows.length === 0) return null
                return (
                  <div key={cat}>
                    <div className="text-muted-foreground mb-1.5 text-[10px] tracking-wide uppercase">{cat}</div>
                    <div className="space-y-1.5">
                      {rows.map(([k, ok]) => (
                        <div key={k} className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-1.5">
                          <span className="text-foreground/90 font-mono text-xs">{k}</span>
                          {ok ? (
                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="text-destructive size-3.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* Build info — slim placeholder until we wire NEXT_PUBLIC_BUILD_* */}
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Build info</h2>
        <Card>
          <CardContent className="py-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <GitBranch className="size-3" /> Bundle
              </span>
              <span className="text-foreground font-mono">Next.js · React · shadcn (New York)</span>
            </div>
            <p className="text-muted-foreground/80 mt-2 text-[10px]">
              Build timestamp + commit SHA inject via next.config.ts in a small follow-up
              (NEXT_PUBLIC_BUILD_* env vars).
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Kpi({
  label, value, icon: Icon, accent, danger,
}: {
  label: string
  value: number | null
  icon: LucideIcon
  accent?: boolean
  danger?: boolean
}) {
  return (
    <Card className={cn(accent && !danger && 'border-primary/30 bg-primary/5', danger && 'border-destructive/30 bg-destructive/5')}>
      <CardContent className="space-y-1.5 py-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="size-3" />
          {label}
        </div>
        <div className="text-foreground text-xl font-semibold tabular-nums">
          {value === null ? <Skeleton className="h-6 w-16" /> : value}
        </div>
      </CardContent>
    </Card>
  )
}

