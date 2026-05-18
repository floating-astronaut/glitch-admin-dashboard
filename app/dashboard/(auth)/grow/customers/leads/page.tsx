/**
 * /dashboard/grow/customers/leads — Vibe Kit lead aggregate.
 *
 * Wired to admin_api GET /api/customers/leads (which proxies to
 * payment-server /api/grow/leads). Upstream row shape is loose
 * (Google Sheet kit-leads + Resend audience), so the table picks
 * common fields when present and falls back to "—". Row click opens
 * a Sheet showing the full raw row.
 */
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { customersLeads } from '@/lib/api/grow'
import LeadDetailSheet, { type LeadRow } from '@/components/customers/lead-detail-sheet'

function tryDate(v: unknown): string | undefined {
  if (typeof v !== 'string' && typeof v !== 'number') return undefined
  const d = new Date(v as string | number)
  return isNaN(d.valueOf()) ? undefined : d.toISOString()
}

function pickCreatedAt(r: LeadRow): string | undefined {
  return tryDate(r.created_at) ?? tryDate(r.captured_at) ?? tryDate(r.signed_up_at) ?? tryDate(r.timestamp)
}

export default function LeadsPage() {
  const [selected, setSelected] = useState<LeadRow | null>(null)

  const q = useQuery({
    queryKey: ['leads'],
    queryFn: customersLeads,
    refetchInterval: 60_000,
  })

  const leads: LeadRow[] = (q.data?.leads ?? []) as LeadRow[]
  const count = q.data?.count ?? leads.length

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex items-center gap-3 py-3">
          <p className="text-muted-foreground flex-1 text-xs">
            Vibe Kit leads — Google Sheet <code className="font-mono">kit-leads</code> merged with the
            Resend <code className="font-mono">kit-leads</code> audience. Click a row to inspect the
            full lead record.
          </p>
          <span className="text-muted-foreground/80 font-mono text-[11px]">
            {q.isLoading ? '…' : `${count} lead${count === 1 ? '' : 's'}`}
          </span>
          <Button variant="outline" size="sm" onClick={() => q.refetch()}>
            <RefreshCw className="size-3" /> Refresh
          </Button>
        </CardContent>
      </Card>

      {q.isError ? (
        <Card>
          <CardContent className="text-destructive py-6 text-xs">
            Couldn&apos;t load leads. <code className="font-mono">/api/customers/leads</code> returned an error.
          </CardContent>
        </Card>
      ) : q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-xs">
            No Vibe Kit signups have landed yet. Once the Google Sheet + Resend audience
            populate, rows will surface here.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Captured</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((r, i) => {
                const t = pickCreatedAt(r)
                return (
                  <TableRow
                    key={String(r.email ?? i)}
                    onClick={() => setSelected(r)}
                    className={cn('hover:bg-accent cursor-pointer')}>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                      {t ? (
                        <span title={t}>{formatDistanceToNow(new Date(t), { addSuffix: true })}</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.email ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.name ?? r.full_name ?? r.first_name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] uppercase">
                      {r.source ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {r.status ? (
                        <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
