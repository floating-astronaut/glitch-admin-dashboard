/**
 * AuditEntrySheet — read-only drawer for a single audit_log row.
 *
 * Wired to the existing entry passed by the parent (no separate fetch
 * — list endpoint returns full rows). Renders the structured fields
 * up top + a pretty-printed JSON pre-block for the `details` column.
 */
'use client'

import { format as fmtDate, formatDistanceToNow } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export interface AuditEntry {
  id: number
  admin_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: unknown
  ip_address: string | null
  created_at: string
}

interface Props {
  entry: AuditEntry | null
  onClose: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-xs">
      <span className="text-muted-foreground/80 text-[10px] tracking-wide uppercase">{label}</span>
      <span className="text-foreground/90 break-words">{children}</span>
    </div>
  )
}

export default function AuditEntrySheet({ entry, onClose }: Props) {
  const detailsEmpty =
    entry?.details == null
      ? true
      : typeof entry.details === 'object'
        ? Object.keys(entry.details as object).length === 0
        : String(entry.details).length === 0

  return (
    <Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-base">
            {entry?.action ?? 'Audit entry'}
          </SheetTitle>
          <SheetDescription className="font-mono text-[11px]">
            event_id · {entry?.id ?? '—'}
          </SheetDescription>
        </SheetHeader>

        {entry && (
          <div className="space-y-4 p-4 pt-0">
            <Card>
              <CardContent className="space-y-2 py-4">
                <Row label="When">
                  <span title={entry.created_at}>
                    {fmtDate(new Date(entry.created_at), "yyyy-MM-dd HH:mm:ss 'UTC'")}
                    <span className="text-muted-foreground ml-2">
                      ({formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })})
                    </span>
                  </span>
                </Row>
                <Row label="Actor">
                  {entry.admin_email ? (
                    <span className="font-mono">{entry.admin_email}</span>
                  ) : (
                    <span className="text-muted-foreground">system</span>
                  )}
                </Row>
                <Row label="Action">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {entry.action}
                  </Badge>
                </Row>
                <Row label="Target">
                  {entry.target_type ? (
                    <span className="font-mono">
                      {entry.target_type}
                      {entry.target_id ? ` · ${entry.target_id}` : ''}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Row>
                <Row label="IP">
                  {entry.ip_address ? (
                    <span className="font-mono">{entry.ip_address}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Row>
              </CardContent>
            </Card>

            <div>
              <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                Details
              </div>
              {detailsEmpty ? (
                <p className="text-muted-foreground text-xs">—</p>
              ) : (
                <pre className="bg-muted border-border overflow-x-auto rounded-lg border p-3 font-mono text-[11px] break-all whitespace-pre-wrap">
                  {typeof entry.details === 'string'
                    ? entry.details
                    : JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
