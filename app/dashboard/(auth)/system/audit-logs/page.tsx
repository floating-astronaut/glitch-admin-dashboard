/**
 * /dashboard/system/audit-logs — append-only record of admin actions.
 *
 * Wired to admin_api GET /api/settings/audit (table audit_log joined
 * to admin_users for the actor email). Paginated, date-range
 * filterable, click row to inspect full details JSON in a Sheet.
 */
'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, FileClock, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { getAuditLog } from '@/lib/api/endpoints'
import AuditEntrySheet, { type AuditEntry } from '@/components/audit/audit-entry-sheet'

interface AuditPage {
  total: number
  page: number
  limit: number
  entries: AuditEntry[]
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditSkeleton />}>
      <AuditLogs />
    </Suspense>
  )
}

function AuditLogs() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const q = useQuery<AuditPage>({
    queryKey: ['audit-log', page, limit, dateFrom, dateTo],
    queryFn: () => getAuditLog(page, limit, dateFrom || undefined, dateTo || undefined),
    refetchInterval: 60_000,
  })

  const entries = q.data?.entries ?? []
  const total = q.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <FileClock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Audit Logs</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Append-only record from <code className="font-mono">audit_log</code>: who took what
            action against which target, and when. Backed by admin_api.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => q.refetch()}>
          <RefreshCw className={cn('size-3', q.isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">From</span>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="w-[150px]"
            />
            <span className="text-muted-foreground">To</span>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="w-[150px]"
            />
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}>
                Clear
              </Button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground">{q.isLoading ? '…' : `${total.toLocaleString()} matching`}</span>
            <span className="text-muted-foreground">· Rows</span>
            <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1) }}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {q.isError ? (
        <Card>
          <CardContent className="text-destructive py-6 text-xs">
            Couldn&apos;t load audit log. <code className="font-mono">/api/settings/audit</code> returned an error.
          </CardContent>
        </Card>
      ) : q.isLoading ? (
        <AuditSkeleton />
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-xs">
            No audit events in range. Widen the date filter or clear it.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => {
                  const detailsStr =
                    e.details == null
                      ? ''
                      : typeof e.details === 'string'
                        ? e.details
                        : JSON.stringify(e.details)
                  return (
                    <TableRow
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="hover:bg-accent cursor-pointer">
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        <span title={e.created_at}>
                          {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {e.admin_email ?? <span className="text-muted-foreground">system</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px]">{e.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {e.target_type ? (
                          <>
                            {e.target_type}
                            {e.target_id ? <span className="text-muted-foreground"> · {e.target_id}</span> : null}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground max-w-[260px] truncate font-mono text-[11px]"
                        title={detailsStr}>
                        {detailsStr || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {e.ip_address ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}>
                  <ChevronLeft className="size-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}>
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AuditEntrySheet entry={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function AuditSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )
}
