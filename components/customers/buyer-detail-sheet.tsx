/**
 * BuyerDetailSheet — read-only drawer for a single buyer.
 *
 * Wired to admin_api GET /api/customers/buyer/:paymentId. Mutations
 * (refund, resend welcome, reinvite codeberg, add note) are visible
 * as buttons but disabled in v2.0 — wiring them is DOMAIN-3.5 once
 * the read-only surface is verified.
 *
 * URL contract: parent passes the active paymentId; null closes the
 * sheet. Parent owns URL state (?paymentId=…) so deep-links work.
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Ban, Check, Clock, Github, Loader2, Mail, RotateCcw, X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { customersBuyer, type BuyerDetailResponse, type SinkState } from '@/lib/api/grow'

interface Props {
  paymentId: string | null
  onClose: () => void
}

function fmtMoney(minor: number, currency: 'USD' | 'INR') {
  const major = minor / 100
  const symbol = currency === 'INR' ? '₹' : '$'
  return `${symbol}${major.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function SinkBadge({ state }: { state: SinkState }) {
  const status = state.status
  const tone =
    status === 'ok' ? 'text-emerald-600 dark:text-emerald-400' :
    status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
    status === 'failed' ? 'text-destructive' :
    'text-muted-foreground'
  const Icon = status === 'ok' ? Check : status === 'failed' ? X : Clock
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-mono', tone)}>
      <Icon className="size-3" /> {status}
    </span>
  )
}

const SINK_LABELS: Record<keyof BuyerDetailResponse['sinks'], string> = {
  payment_captured: 'Payment captured',
  ledger_write: 'Ledger write',
  welcome_email: 'Welcome email',
  codeberg_invite: 'Codeberg invite',
  discord_role: 'Discord role',
  capi_meta: 'Meta CAPI',
  capi_tiktok: 'TikTok CAPI',
}

export default function BuyerDetailSheet({ paymentId, onClose }: Props) {
  const q = useQuery({
    queryKey: ['buyer', paymentId],
    queryFn: () => customersBuyer(paymentId as string),
    enabled: !!paymentId,
  })

  const buyer = q.data?.buyer
  const sinks = q.data?.sinks
  const activity = q.data?.activity ?? []
  const stub = q.data?.stub

  return (
    <Sheet open={!!paymentId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-base">
            {buyer?.buyer_name ?? buyer?.email ?? 'Buyer'}
          </SheetTitle>
          <SheetDescription className="font-mono text-[11px]">
            payment_id · {paymentId ?? '—'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4 pt-0">
          {q.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {q.isError && (
            <Card>
              <CardContent className="text-destructive py-4 text-xs">
                Couldn&apos;t load buyer detail. <code className="font-mono">GET /api/customers/buyer/{paymentId}</code>{' '}
                returned an error.
              </CardContent>
            </Card>
          )}

          {stub && (
            <Card className="border-yellow-500/40 bg-yellow-500/10">
              <CardContent className="py-3 text-[11px] text-yellow-700 dark:text-yellow-300">
                Stub data — admin_api proxy returned a placeholder. Check
                that GROW_FULFILL_SECRET is wired on the payment-server.
              </CardContent>
            </Card>
          )}

          {buyer && (
            <>
              {/* Headline card */}
              <Card>
                <CardContent className="space-y-2 py-4 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="font-mono text-[10px]">{buyer.sku}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{buyer.provider}</Badge>
                    {buyer.refunded_at
                      ? <Badge variant="destructive">refunded</Badge>
                      : buyer.fulfilled_at
                        ? <Badge variant="default" className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-400">fulfilled</Badge>
                        : <Badge variant="secondary">pending</Badge>}
                  </div>
                  <Row label="Amount">
                    <span className="text-foreground font-mono">{fmtMoney(buyer.amount_minor, buyer.currency)}</span>
                  </Row>
                  <Row label="Email"><span className="font-mono">{buyer.email}</span></Row>
                  {buyer.buyer_name && <Row label="Name">{buyer.buyer_name}</Row>}
                  {buyer.github_username && <Row label="Codeberg"><span className="font-mono">@{buyer.github_username}</span></Row>}
                  {buyer.promo_code && <Row label="Promo"><span className="font-mono">{buyer.promo_code}</span></Row>}
                  {buyer.created_at && (
                    <Row label="Captured">
                      <span title={buyer.created_at}>{formatDistanceToNow(new Date(buyer.created_at), { addSuffix: true })}</span>
                    </Row>
                  )}
                  {buyer.fulfilled_at && (
                    <Row label="Fulfilled">
                      <span title={buyer.fulfilled_at}>{formatDistanceToNow(new Date(buyer.fulfilled_at), { addSuffix: true })}</span>
                    </Row>
                  )}
                  {buyer.refunded_at && (
                    <Row label="Refunded">
                      <span title={buyer.refunded_at}>{formatDistanceToNow(new Date(buyer.refunded_at), { addSuffix: true })}</span>
                    </Row>
                  )}
                </CardContent>
              </Card>

              {/* Sinks timeline */}
              {sinks && (
                <div>
                  <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                    Fulfilment sinks
                  </div>
                  <Card>
                    <CardContent className="space-y-1.5 py-3">
                      {(Object.keys(SINK_LABELS) as Array<keyof typeof SINK_LABELS>).map((k) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{SINK_LABELS[k]}</span>
                          <SinkBadge state={sinks[k]} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent activity */}
              {activity.length > 0 && (
                <div>
                  <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                    Activity
                  </div>
                  <Card>
                    <CardContent className="space-y-2 py-3 text-xs">
                      {activity.map((a, i) => (
                        <div key={i} className="grid grid-cols-[auto_1fr] gap-3">
                          <span className="text-muted-foreground whitespace-nowrap" title={a.at}>
                            {formatDistanceToNow(new Date(a.at), { addSuffix: true })}
                          </span>
                          <span>
                            <Badge variant="secondary" className="font-mono text-[10px]">{a.kind}</Badge>
                            {a.detail && <span className="text-muted-foreground ml-2">{a.detail}</span>}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action buttons — visible but disabled (DOMAIN-3.5 wires) */}
              <div>
                <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                  Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled title="Wires in DOMAIN-3.5">
                    <Mail className="size-3" /> Resend welcome
                  </Button>
                  <Button variant="outline" size="sm" disabled title="Wires in DOMAIN-3.5">
                    <Github className="size-3" /> Re-invite codeberg
                  </Button>
                  <Button variant="outline" size="sm" disabled title="Wires in DOMAIN-3.5">
                    <RotateCcw className="size-3" /> Refund
                  </Button>
                  <Button variant="outline" size="sm" disabled title="Wires in DOMAIN-3.5">
                    <Ban className="size-3" /> Add note
                  </Button>
                </div>
                <p className="text-muted-foreground/80 mt-2 text-[10px]">
                  Mutations stubbed in v2.0 — backend POSTs exist but writes aren&apos;t wired from
                  the SPA until DOMAIN-3.5 verifies the read surface first.
                </p>
              </div>
            </>
          )}

          {!q.isLoading && !buyer && !q.isError && (
            <div className="text-muted-foreground py-6 text-center text-xs">
              <Loader2 className="mx-auto mb-2 size-4 animate-spin" />
              Loading buyer…
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-xs">
      <span className="text-muted-foreground/80 text-[10px] tracking-wide uppercase">{label}</span>
      <span className="text-foreground/90">{children}</span>
    </div>
  )
}
