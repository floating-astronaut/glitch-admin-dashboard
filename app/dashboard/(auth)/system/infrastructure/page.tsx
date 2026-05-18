/**
 * /dashboard/system/infrastructure — service heartbeat board.
 *
 * Wired to admin_api /api/infra:
 *   GET /api/infra/services   docker container statuses + host pseudo-svcs
 *   GET /api/infra/system     CPU / memory / disk %
 *
 * Logs reader (/api/infra/logs?service=…&lines=…) lives in a follow-up
 * lane — opens a modal with tail output. Out of scope for the v2.0 port.
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle, CheckCircle2, Cpu, HardDrive, MemoryStick, RefreshCw,
  Server, XCircle,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { getServices, getSystem } from '@/lib/api/endpoints'

interface ServiceRow {
  name: string
  status: string
  health: string
  image: string
  started_at: string | null
  type?: string
  category?: string
  age_sec?: number | null
}

interface SystemMetrics {
  cpu_percent: number
  memory: { total_gb: number; used_gb: number; percent: number }
  disk: { total_gb: number; used_gb: number; percent: number }
}

function ProgressBar({
  label, percent, icon: Icon, sub,
}: {
  label: string
  percent: number
  icon: LucideIcon
  sub?: string
}) {
  const tone =
    percent >= 85 ? 'bg-red-500' :
    percent >= 70 ? 'bg-yellow-500' :
    'bg-emerald-500'
  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="size-3" />
          {label}
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-foreground text-xl font-semibold tabular-nums">{percent.toFixed(0)}%</div>
          {sub && <div className="text-muted-foreground text-[11px]">{sub}</div>}
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${Math.min(100, percent)}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}

function statusTone(status: string): { tone: string; Icon: LucideIcon; label: string } {
  switch (status) {
    case 'running':
    case 'active':
      return { tone: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle2, label: 'running' }
    case 'restarting':
    case 'paused':
      return { tone: 'text-yellow-600 dark:text-yellow-400', Icon: AlertTriangle, label: status }
    case 'exited':
    case 'dead':
    case 'failed':
    case 'inactive':
    case 'stopped':
      return { tone: 'text-destructive', Icon: XCircle, label: status }
    case 'not_found':
      return { tone: 'text-muted-foreground', Icon: XCircle, label: 'missing' }
    default:
      return { tone: 'text-muted-foreground', Icon: AlertTriangle, label: status || 'unknown' }
  }
}

function healthBadge(health: string) {
  if (!health || health === 'none' || health === 'unknown') return null
  if (health === 'healthy')
    return <Badge className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-[10px]">healthy</Badge>
  if (health === 'unhealthy' || health === 'unreachable')
    return <Badge variant="destructive" className="text-[10px]">{health}</Badge>
  if (health === 'stale')
    return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[10px]">stale</Badge>
  return <Badge variant="secondary" className="text-[10px]">{health}</Badge>
}

export default function InfrastructurePage() {
  const servicesQ = useQuery<ServiceRow[]>({
    queryKey: ['infra:services'],
    queryFn: getServices,
    refetchInterval: 30_000,
  })
  const systemQ = useQuery<SystemMetrics>({
    queryKey: ['infra:system'],
    queryFn: getSystem,
    refetchInterval: 30_000,
  })

  const services = Array.isArray(servicesQ.data) ? servicesQ.data : []
  const upCount = services.filter((s) => s.status === 'running' || s.status === 'active').length
  const downCount = services.filter((s) =>
    s.status === 'exited' || s.status === 'dead' || s.status === 'failed' ||
    s.status === 'inactive' || s.status === 'stopped' || s.status === 'not_found'
  ).length

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Server className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">System · Infrastructure</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Docker container health, host pseudo-services, and host-level CPU/mem/disk.
            Source: <code className="font-mono">/api/infra/{'{'} services, system{'}'} </code>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { servicesQ.refetch(); systemQ.refetch() }}>
          <RefreshCw className={cn('size-3', (servicesQ.isRefetching || systemQ.isRefetching) && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* Host metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {systemQ.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : systemQ.data ? (
          <>
            <ProgressBar
              label="CPU"
              percent={systemQ.data.cpu_percent ?? 0}
              icon={Cpu}
              sub={`${(systemQ.data.cpu_percent ?? 0).toFixed(1)}% util`}
            />
            <ProgressBar
              label="Memory"
              percent={systemQ.data.memory?.percent ?? 0}
              icon={MemoryStick}
              sub={`${systemQ.data.memory.used_gb} / ${systemQ.data.memory.total_gb} GB`}
            />
            <ProgressBar
              label="Disk"
              percent={systemQ.data.disk?.percent ?? 0}
              icon={HardDrive}
              sub={`${systemQ.data.disk.used_gb} / ${systemQ.data.disk.total_gb} GB`}
            />
          </>
        ) : (
          <Card className="col-span-3">
            <CardContent className="text-destructive py-4 text-xs">
              Couldn&apos;t load host metrics. <code className="font-mono">/api/infra/system</code> returned an error.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Services */}
      <Card>
        <CardContent className="flex items-center gap-3 py-3 text-xs">
          <Server className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground">Services</span>
          {servicesQ.isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">{upCount}</span>
              {' / '}
              <span className={cn(downCount > 0 ? 'text-destructive' : 'text-foreground')}>{services.length}</span>
              {' running'}
            </span>
          )}
        </CardContent>
      </Card>

      {servicesQ.isError ? (
        <Card>
          <CardContent className="text-destructive py-6 text-xs">
            Couldn&apos;t load services. <code className="font-mono">/api/infra/services</code> returned an error.
          </CardContent>
        </Card>
      ) : servicesQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-xs">
            No services tracked.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => {
                const { tone, Icon, label } = statusTone(s.status)
                return (
                  <TableRow key={s.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{s.name}</span>
                        {s.type === 'host' && (
                          <Badge variant="outline" className="text-[9px] uppercase">host</Badge>
                        )}
                      </div>
                      {s.category && (
                        <div className="text-muted-foreground/80 mt-0.5 text-[10px]">{s.category}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 text-xs', tone)}>
                        <Icon className="size-3" />
                        {label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {healthBadge(s.health) ?? <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate font-mono text-[10px]">
                      {s.image}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {s.started_at ? (
                        <span title={s.started_at}>
                          {formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}
                        </span>
                      ) : s.age_sec != null ? (
                        <span title={`${s.age_sec}s since last heartbeat`}>
                          {s.age_sec}s ago
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-3 text-[11px]">
          Per-service logs (tail via <code className="font-mono">/api/infra/logs?service=…&amp;lines=…</code>) are
          a future enhancement — not in the v2.0 Infrastructure port. The full system map (every
          server-side service, repo, env file, route) lives at{' '}
          <a href="/dashboard/system/server-map" className="text-primary hover:underline">Server Map</a>.
        </CardContent>
      </Card>
    </div>
  )
}
