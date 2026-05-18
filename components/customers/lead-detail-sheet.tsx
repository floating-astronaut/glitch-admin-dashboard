/**
 * LeadDetailSheet — read-only drawer for a Vibe Kit lead row.
 *
 * Upstream lead shape is loose (Google Sheet "kit-leads" merged with
 * the Resend audience), so the renderer is defensive: pick common
 * fields first (email / name / source / status / captured), then
 * dump anything else as a JSON pre block.
 *
 * No mutations in v2.0 — Resend send-history + manual-onboard wires
 * in a future lane once admin_api exposes the needed endpoints.
 */
'use client'

import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export interface LeadRow {
  email?: string
  name?: string
  full_name?: string
  first_name?: string
  last_name?: string
  source?: string
  status?: string
  created_at?: string
  captured_at?: string
  signed_up_at?: string
  timestamp?: string
  [k: string]: unknown
}

interface Props {
  lead: LeadRow | null
  onClose: () => void
}

function tryDate(v: unknown): string | undefined {
  if (typeof v !== 'string' && typeof v !== 'number') return undefined
  const d = new Date(v as string | number)
  return isNaN(d.valueOf()) ? undefined : d.toISOString()
}

function pickCreatedAt(r: LeadRow): string | undefined {
  return tryDate(r.created_at) ?? tryDate(r.captured_at) ?? tryDate(r.signed_up_at) ?? tryDate(r.timestamp)
}

export default function LeadDetailSheet({ lead, onClose }: Props) {
  const open = lead !== null
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-base">
            {lead?.email ?? lead?.name ?? 'Lead'}
          </SheetTitle>
          <SheetDescription className="text-[11px]">
            Vibe Kit lead profile · read-only
          </SheetDescription>
        </SheetHeader>

        {lead && (() => {
          const t = pickCreatedAt(lead)
          const primaryKeys = ['email', 'name', 'full_name', 'first_name', 'last_name', 'source', 'status']
          const primary = primaryKeys
            .map((k) => [k, lead[k]] as const)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
          const handled = new Set([...primaryKeys, 'created_at', 'captured_at', 'signed_up_at', 'timestamp'])
          const rest = Object.entries(lead).filter(
            ([k, v]) => !handled.has(k) && v !== undefined && v !== null && v !== '',
          )
          return (
            <div className="space-y-4 p-4 pt-0">
              <Card>
                <CardContent className="space-y-2 py-4 text-xs">
                  {primary.length > 0 ? (
                    primary.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
                        <span className="text-muted-foreground/80 text-[10px] tracking-wide uppercase">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="text-foreground/90 font-mono break-words">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No standard fields on this row.</p>
                  )}
                  {t && (
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <span className="text-muted-foreground/80 text-[10px] tracking-wide uppercase">captured</span>
                      <span className="text-foreground/90" title={t}>
                        {formatDistanceToNow(new Date(t), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {rest.length > 0 && (
                <div>
                  <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                    Other fields
                  </div>
                  <pre className="bg-muted border-border overflow-x-auto rounded-lg border p-3 font-mono text-[11px] break-all whitespace-pre-wrap">
                    {JSON.stringify(Object.fromEntries(rest), null, 2)}
                  </pre>
                </div>
              )}

              <p className="text-muted-foreground/80 text-[10px] leading-relaxed">
                Resend send history + manual-onboard actions need new admin_api endpoints
                (cross-repo). When those ship, this drawer wires them in the same way
                BuyerDetailSheet wires the fulfilment sinks.
              </p>
            </div>
          )
        })()}
      </SheetContent>
    </Sheet>
  )
}
