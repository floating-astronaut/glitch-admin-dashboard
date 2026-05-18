/**
 * /dashboard/system/control-centre — operator control surface.
 *
 * Wired to admin_api /api/cc/*:
 *   GET  /api/cc/containers              docker container state
 *   POST /api/cc/containers/:name/restart restart a TARGET_CONTAINERS member
 *   GET  /api/cc/redis                   redis info() snapshot
 *   GET  /api/cc/postgres                pg_stat_activity + db size
 *
 * Per-container log tail (GET /api/cc/logs?service=…&lines=…) is a
 * future enhancement — opens in a modal, deferred.
 *
 * Restart action is destructive (~5-10 s downtime on the target
 * container). Gated behind an AlertDialog confirm; the mutation
 * lands in the audit log so /system/audit-logs shows who did what.
 */
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle, CheckCircle2, Database, LayoutGrid, Loader2,
  RefreshCw, RotateCw, XCircle, Zap,
  type LucideIcon,
} from 'lucide-react'

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  getCC_Containers, getCC_Postgres, getCC_Redis, restartContainer,
} from '@/lib/api/endpoints'

interface CcContainer {
  name: string
  status: string
  health?: string
  image?: string
  started_at?: string | null
  restart_count?: number
  uptime_sec?: number
}

interface RedisInfo {
  used_memory?: number
  used_memory_human?: string
  connected_clients?: number
  error?: string
}

interface PgInfo {
  connections?: number
  db_size?: string
  by_state?: Record<string, number>
  error?: string
}

function fmtBytes(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KiB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MiB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GiB`
}

function statusTone(status: string): { tone: string; Icon: LucideIcon; label: string } {
  switch (status) {
    case 'running':
      return { tone: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle2, label: 'running' }
    case 'restarting':
    case 'paused':
      return { tone: 'text-yellow-600 dark:text-yellow-400', Icon: AlertTriangle, label: status }
    case 'exited':
    case 'dead':
    case 'not_found':
      return { tone: 'text-destructive', Icon: XCircle, label: status === 'not_found' ? 'missing' : status }
    default:
      return { tone: 'text-muted-foreground', Icon: AlertTriangle, label: status || 'unknown' }
  }
}

export default function ControlCentrePage() {
  const qc = useQueryClient()
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)

  const containersQ = useQuery<CcContainer[] | { error: string; containers: CcContainer[] }>({
    queryKey: ['cc:containers'],
    queryFn: getCC_Containers,
    refetchInterval: 30_000,
  })
  const redisQ = useQuery<RedisInfo>({
    queryKey: ['cc:redis'],
    queryFn: getCC_Redis,
    refetchInterval: 30_000,
  })
  const pgQ = useQuery<PgInfo>({
    queryKey: ['cc:postgres'],
    queryFn: getCC_Postgres,
    refetchInterval: 30_000,
  })

  const restart = useMutation({
    mutationFn: (name: string) => restartContainer(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cc:containers'] })
      // Also nudge the infra heartbeat board in case it's mounted.
      qc.invalidateQueries({ queryKey: ['infra:services'] })
    },
  })

  const containers: CcContainer[] = Array.isArray(containersQ.data)
    ? containersQ.data
    : (containersQ.data?.containers ?? [])

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <LayoutGrid className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">System · Control Centre</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Container management + database health. Restart actions land in the audit log at{' '}
            <a href="/dashboard/system/audit-logs" className="text-primary hover:underline">/system/audit-logs</a>.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            containersQ.refetch()
            redisQ.refetch()
            pgQ.refetch()
          }}>
          <RefreshCw
            className={cn(
              'size-3',
              (containersQ.isRefetching || redisQ.isRefetching || pgQ.isRefetching) && 'animate-spin',
            )}
          />
          Refresh
        </Button>
      </div>

      {/* Datastore health */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <Zap className="size-3" /> Redis
            </div>
            {redisQ.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : redisQ.data?.error ? (
              <p className="text-destructive text-xs">{redisQ.data.error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground/80 text-[10px] uppercase">Memory</div>
                  <div className="text-foreground font-mono tabular-nums">
                    {redisQ.data?.used_memory_human ??
                      (typeof redisQ.data?.used_memory === 'number' ? fmtBytes(redisQ.data.used_memory) : '—')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground/80 text-[10px] uppercase">Clients</div>
                  <div className="text-foreground font-mono tabular-nums">
                    {redisQ.data?.connected_clients ?? '—'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <Database className="size-3" /> PostgreSQL
            </div>
            {pgQ.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : pgQ.data?.error ? (
              <p className="text-destructive text-xs">{pgQ.data.error}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground/80 text-[10px] uppercase">Connections</div>
                    <div className="text-foreground font-mono tabular-nums">
                      {pgQ.data?.connections ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground/80 text-[10px] uppercase">DB size</div>
                    <div className="text-foreground font-mono tabular-nums">
                      {pgQ.data?.db_size ?? '—'}
                    </div>
                  </div>
                </div>
                {pgQ.data?.by_state && Object.keys(pgQ.data.by_state).length > 0 && (
                  <div className="border-border/50 mt-1 flex flex-wrap gap-1 border-t pt-2">
                    {Object.entries(pgQ.data.by_state).map(([state, n]) => (
                      <Badge key={state} variant="outline" className="font-mono text-[10px]">
                        {state} · {n}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Containers */}
      <div>
        <h2 className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wide uppercase">
          Containers
        </h2>
        {containersQ.isError ? (
          <Card>
            <CardContent className="text-destructive py-6 text-xs">
              Couldn&apos;t load containers. <code className="font-mono">/api/cc/containers</code> returned an error.
            </CardContent>
          </Card>
        ) : containersQ.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : containers.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-6 text-center text-xs">
              No containers tracked.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((c) => {
                  const { tone, Icon, label } = statusTone(c.status)
                  const isThisRestarting = restart.isPending && restart.variables === c.name
                  return (
                    <TableRow key={c.name}>
                      <TableCell>
                        <span className="font-mono text-xs">{c.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center gap-1 text-xs', tone)}>
                          <Icon className="size-3" />
                          {label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.health && c.health !== 'none' ? (
                          <Badge
                            variant={c.health === 'healthy' ? 'default' : 'destructive'}
                            className={cn(
                              'text-[10px]',
                              c.health === 'healthy' &&
                                'bg-emerald-600/20 text-emerald-700 dark:text-emerald-400',
                            )}>
                            {c.health}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.started_at ? (
                          <span title={c.started_at}>
                            {formatDistanceToNow(new Date(c.started_at), { addSuffix: true })}
                          </span>
                        ) : c.uptime_sec ? (
                          <span>{Math.round(c.uptime_sec / 60)} min</span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={c.status === 'not_found' || isThisRestarting}
                          onClick={() => setConfirmTarget(c.name)}>
                          {isThisRestarting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <RotateCw className="size-3" />
                          )}
                          {isThisRestarting ? 'Restarting…' : 'Restart'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {restart.isError && (
        <Card>
          <CardContent className="text-destructive py-3 text-xs">
            Restart failed:{' '}
            {restart.error && typeof restart.error === 'object' && 'response' in restart.error
              ? String(
                  (restart.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
                    'unknown error',
                )
              : 'unknown error'}
          </CardContent>
        </Card>
      )}
      {restart.isSuccess && !restart.isPending && (
        <Card>
          <CardContent className="text-foreground py-3 text-xs">
            <CheckCircle2 className="mr-1 inline size-3 text-emerald-600 dark:text-emerald-400" />
            Restarted{' '}
            <code className="font-mono">{restart.data?.container ?? '—'}</code>. New status will appear
            in the table on the next refresh tick.
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-3 text-[11px]">
          Per-container log tail (<code className="font-mono">/api/cc/logs?service=…&amp;lines=…</code>) is
          a future enhancement — not in this lane. Container heartbeat without restart controls
          lives at <a href="/dashboard/system/infrastructure" className="text-primary hover:underline">Infrastructure</a>;
          full static system map at <a href="/dashboard/system/server-map" className="text-primary hover:underline">Server Map</a>.
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart <code className="font-mono">{confirmTarget}</code>?</AlertDialogTitle>
            <AlertDialogDescription>
              The container will be stopped and started — expect a brief disruption (typically
              5-10 s) on any traffic served by this service. The action is logged to the audit
              trail under <code className="font-mono">container_restart</code>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmTarget) {
                  restart.mutate(confirmTarget)
                  setConfirmTarget(null)
                }
              }}>
              <RotateCw className="size-3" /> Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
