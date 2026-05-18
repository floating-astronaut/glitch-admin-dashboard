/**
 * /dashboard/edge — Edge platform overview.
 *
 * Service-health snapshot of glitch-edge-api via the CF Pages proxy
 * at /api/edge/*. Deeper surfaces (betting accounts, signals,
 * strategies) live at /edge/betting and wait on a /v1/admin/* layer
 * on edge-api (cross-repo).
 */
'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Activity, AlertTriangle, ArrowRight, Database, Server, Target,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { edgeHealthz, edgeReadyz } from '@/lib/api/edge'

function Kpi({
  label, value, sub, icon: Icon, accent, trend, loading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: LucideIcon
  accent?: boolean
  trend?: 'up' | 'down'
  loading?: boolean
}) {
  const trendDot = trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-red-500' : null
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
        {sub != null && <div className="text-muted-foreground text-[11px]">{sub}</div>}
      </CardContent>
    </Card>
  )
}

export default function EdgeOverviewPage() {
  const health = useQuery({ queryKey: ['edge:healthz'], queryFn: edgeHealthz, refetchInterval: 30_000, retry: 1 })
  const ready = useQuery({ queryKey: ['edge:readyz'], queryFn: edgeReadyz, refetchInterval: 30_000, retry: 1 })

  const apiOk = health.isSuccess
  const dbOk = ready.isSuccess && ready.data?.ok === true

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Target className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Edge — Platform</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Cloudbet automation platform (<code className="font-mono">glitch-edge-api</code>). Operator
            view of service health and reachability. Betting accounts, signals, and bet history live
            on the dedicated <Link href="/dashboard/edge/betting" className="text-primary hover:underline">Betting</Link> surface.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="API"
          value={health.isLoading ? '…' : apiOk ? 'reachable' : 'unreachable'}
          loading={health.isLoading}
          icon={Server}
          accent={apiOk}
          trend={apiOk ? 'up' : 'down'}
          sub={health.isError ? 'GET /healthz failed' : health.data?.service ?? '—'}
        />
        <Kpi
          label="Database"
          value={ready.isLoading ? '…' : dbOk ? 'up' : 'down'}
          loading={ready.isLoading}
          icon={Database}
          accent={dbOk}
          trend={dbOk ? 'up' : 'down'}
          sub={ready.isError ? 'GET /readyz failed' : ready.data?.db ?? '—'}
        />
        <Kpi label="Environment" value={health.data?.env ?? '—'} loading={health.isLoading} icon={Activity} />
        <Kpi label="Open bets" value="—" icon={Target} sub="needs operator API" />
      </div>

      {(health.isError || ready.isError) && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <div>
            <p className="font-medium">edge-api unreachable from this dashboard.</p>
            <p className="mt-1">
              The Pages Function proxy at <code className="font-mono">/api/edge/*</code> couldn&apos;t
              reach <code className="font-mono">edge-app.glitchexecutor.com</code>. Check the service:
              <code className="font-mono ml-1">systemctl status glitch-edge-api</code>.
            </p>
          </div>
        </div>
      )}

      <Link
        href="/dashboard/edge/betting"
        className="border-border bg-card hover:border-primary/30 hover:bg-primary/5 group flex items-start justify-between gap-3 rounded-xl border p-4 transition-colors">
        <div className="min-w-0">
          <div className="text-muted-foreground/80 flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
            <Target className="text-muted-foreground group-hover:text-primary size-3" />
            Edge › Betting
          </div>
          <div className="text-foreground mt-1 text-sm font-semibold">Betting accounts</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Cloudbet accounts, open bets, strategies, and EV signals. Reads land once the operator API
            ships on edge-api.
          </p>
        </div>
        <ArrowRight className="text-muted-foreground/60 group-hover:text-primary mt-1 size-4 shrink-0" />
      </Link>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-3 text-[11px]">
          This Overview is the read-only platform-health view. Per-user surfaces — strategies,
          wallets, audit log — live in the customer-facing app at{' '}
          <code className="font-mono">edge-app.glitchexecutor.com</code> and require an edge-api JWT.
          They will surface here only after an admin <code className="font-mono">/v1/admin/*</code> layer
          lands on edge-api.
        </CardContent>
      </Card>
    </div>
  )
}
