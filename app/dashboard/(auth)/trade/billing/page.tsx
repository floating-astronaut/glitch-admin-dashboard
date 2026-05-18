/**
 * /dashboard/trade/billing — Trade-SaaS subscription billing.
 *
 * Wired to admin_api /api/billing/*:
 *   GET /api/billing/summary       MRR / ARR / per-tier counts
 *   GET /api/billing/plans         plan catalogue + subscriber count
 *   GET /api/billing/email-signups paginated, date-filterable leads
 *
 * Trade · Revenue / Users / Subscriptions sidebar items are still
 * Coming Soon; they wait on a trade-api /v1/admin/* layer (cross-
 * repo). This page is the first live Trade · Business surface.
 */
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle2, ChevronLeft, ChevronRight, CreditCard, DollarSign,
  Mail, RefreshCw, TrendingUp, Users,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { getBillingSummary, getPlans, getEmailSignups } from '@/lib/api/endpoints'

interface PlanFeature {
  id: string
  name: string
  price_mo: number
  price_yr: number
  tagline?: string
  subscriber_count: number
}

interface BillingSummary {
  mrr_usd: number
  arr_usd: number
  total_active: number
  total_trial: number
  by_tier?: Record<string, { count: number; revenue: number; price_mo: number }>
}

interface EmailSignup {
  email?: string
  source?: string
  signed_up_at?: string
  [k: string]: unknown
}

interface EmailSignupsResp {
  total: number
  page: number
  limit: number
  signups: EmailSignup[]
}

function fmtMoney(n: number, digits = 0): string {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

function Kpi({
  label, value, sub, icon: Icon, accent, loading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: LucideIcon
  accent?: boolean
  loading?: boolean
}) {
  return (
    <Card className={cn(accent && 'border-primary/30 bg-primary/5')}>
      <CardContent className="space-y-1.5 py-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="size-3" />
          {label}
        </div>
        <div className="text-foreground text-xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-6 w-20" /> : value}
        </div>
        {sub != null && <div className="text-muted-foreground text-[11px]">{sub}</div>}
      </CardContent>
    </Card>
  )
}

const TIER_COLORS: Record<string, string> = {
  starter: 'border-blue-500/30 bg-blue-500/5',
  pro:     'border-purple-500/30 bg-purple-500/5',
  elite:   'border-yellow-500/30 bg-yellow-500/5',
}

export default function TradeBillingPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const sumQ = useQuery<BillingSummary>({
    queryKey: ['billing:summary'],
    queryFn: getBillingSummary,
    refetchInterval: 60_000,
  })
  const plansQ = useQuery<PlanFeature[]>({
    queryKey: ['billing:plans'],
    queryFn: getPlans,
    refetchInterval: 120_000,
  })
  const signupsQ = useQuery<EmailSignupsResp>({
    queryKey: ['billing:signups', page, limit, dateFrom, dateTo],
    queryFn: () => getEmailSignups(page, limit, dateFrom || undefined, dateTo || undefined),
    refetchInterval: 60_000,
  })

  const summary = sumQ.data
  const plans = plansQ.data ?? []
  const signupsResp = signupsQ.data
  const signups = signupsResp?.signups ?? []
  const totalSignups = signupsResp?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalSignups / limit))

  return (
    <div className="space-y-6 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <CreditCard className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Trade · Billing</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Trade-SaaS subscriber billing — MRR / ARR / plan counts / email signups. Sourced
            from admin_api <code className="font-mono">/api/billing/*</code>. Revenue / Users /
            Subscriptions sub-pages wait on a trade-api operator layer.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { sumQ.refetch(); plansQ.refetch(); signupsQ.refetch() }}>
          <RefreshCw className={cn('size-3', (sumQ.isRefetching || plansQ.isRefetching || signupsQ.isRefetching) && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="MRR"
          value={summary ? fmtMoney(summary.mrr_usd) : '—'}
          loading={sumQ.isLoading}
          icon={DollarSign}
          accent
          sub={summary && summary.arr_usd ? `ARR ${fmtMoney(summary.arr_usd)}` : null}
        />
        <Kpi
          label="ARR"
          value={summary ? fmtMoney(summary.arr_usd) : '—'}
          loading={sumQ.isLoading}
          icon={TrendingUp}
        />
        <Kpi
          label="Active subscribers"
          value={summary?.total_active ?? 0}
          loading={sumQ.isLoading}
          icon={Users}
        />
        <Kpi
          label="Trial users"
          value={summary?.total_trial ?? 0}
          loading={sumQ.isLoading}
          icon={Users}
        />
      </div>

      {/* Plans */}
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Plans</h2>
        {plansQ.isError ? (
          <Card>
            <CardContent className="text-destructive py-4 text-xs">
              Couldn&apos;t load plans. <code className="font-mono">/api/billing/plans</code> returned an error.
            </CardContent>
          </Card>
        ) : plansQ.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((p) => {
              const monthly = p.subscriber_count * p.price_mo
              return (
                <Card key={p.id} className={cn('border', TIER_COLORS[p.id])}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-foreground text-sm font-semibold">{p.name}</h3>
                        {p.tagline && (
                          <p className="text-muted-foreground mt-1 text-[11px]">{p.tagline}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">{p.id}</Badge>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-foreground text-xl font-semibold tabular-nums">
                        {fmtMoney(p.price_mo)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">/mo</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-[11px]">
                      {fmtMoney(p.price_yr)}/yr
                    </div>
                    <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-xs">
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {p.subscriber_count.toLocaleString()} subscriber{p.subscriber_count === 1 ? '' : 's'}
                      </span>
                      <span className="text-foreground/90 font-mono tabular-nums">{fmtMoney(monthly)}/mo</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {plans.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-muted-foreground py-6 text-center text-xs">
                  No plans configured.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Email signups */}
      <section className="space-y-2">
        <div className="flex items-end justify-between">
          <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Email signups</h2>
          <span className="text-muted-foreground/80 font-mono text-[10px]">
            {signupsQ.isLoading ? '…' : `${totalSignups.toLocaleString()} matching`}
          </span>
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
              <span className="text-muted-foreground">Rows</span>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1) }}>
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {signupsQ.isError ? (
          <Card>
            <CardContent className="text-destructive py-4 text-xs">
              Couldn&apos;t load email signups. <code className="font-mono">/api/billing/email-signups</code> returned an error.
            </CardContent>
          </Card>
        ) : signupsQ.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : signups.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-6 text-center text-xs">
              <Mail className="mx-auto mb-2 size-4" />
              No email signups in range.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Captured</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((s, i) => (
                    <TableRow key={`${s.email ?? i}`}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {s.signed_up_at ? (
                          <span title={String(s.signed_up_at)}>
                            {formatDistanceToNow(new Date(s.signed_up_at), { addSuffix: true })}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.email ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {s.source || 'landing'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {totalPages > 1 && (
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="size-3" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="size-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <CheckCircle2 className="mt-0.5 size-3 shrink-0" />
          <p>
            Subscriber breakdown (per-customer rows, Stripe IDs, churn) will live at{' '}
            <code className="font-mono">/dashboard/trade/users</code> and{' '}
            <code className="font-mono">/dashboard/trade/subscriptions</code> once the
            trade-api operator layer (<code className="font-mono">/v1/admin/*</code>) ships.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
