/**
 * /dashboard/trade/subscriptions — preview shell.
 *
 * Per-subscription row view (Stripe subscription ID, customer, plan, period
 * start/end, MRR contribution, status, renewal date, churn risk). Sits
 * alongside /trade/users (customer-grain) and /trade/billing (aggregate).
 *
 * Plan-count teaser below is live from admin_api /api/billing/plans so the
 * page isn't blank; per-subscription rows need a trade-api /v1/admin/subscriptions
 * layer (cross-repo).
 */
'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle, CalendarClock, CreditCard, RefreshCw, Users,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { getPlans } from '@/lib/api/endpoints'

interface PlanFeature {
  id: string
  name: string
  price_mo: number
  price_yr: number
  subscriber_count: number
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const TIER_COLORS: Record<string, string> = {
  starter: 'border-blue-500/30 bg-blue-500/5',
  pro:     'border-purple-500/30 bg-purple-500/5',
  elite:   'border-yellow-500/30 bg-yellow-500/5',
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

export default function TradeSubscriptionsPage() {
  const plansQ = useQuery<PlanFeature[]>({
    queryKey: ['billing:plans'],
    queryFn: getPlans,
    refetchInterval: 120_000,
  })
  const plans = plansQ.data ?? []
  const totalSubs = plans.reduce((acc, p) => acc + (p.subscriber_count ?? 0), 0)
  const totalMrr = plans.reduce((acc, p) => acc + (p.subscriber_count ?? 0) * (p.price_mo ?? 0), 0)

  return (
    <div className="space-y-6 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <CalendarClock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Trade · Subscriptions</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Per-subscription Stripe rows (period, renewal, churn risk). Aggregate plan counts
            below are live from admin_api <code className="font-mono">/api/billing/plans</code>;
            row-level data waits on trade-api.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => plansQ.refetch()}>
          <RefreshCw className={cn('size-3', plansQ.isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Subscriptions"
          value={plansQ.isLoading ? '—' : totalSubs}
          loading={plansQ.isLoading}
          icon={Users}
          accent
        />
        <Kpi
          label="MRR (computed)"
          value={plansQ.isLoading ? '—' : fmtMoney(totalMrr)}
          loading={plansQ.isLoading}
          icon={CreditCard}
        />
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <CalendarClock className="size-3" /> Renewals (next 7d)
            </div>
            <div className="text-muted-foreground/70 text-[11px]">needs trade-api</div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <AlertTriangle className="size-3" /> Past-due
            </div>
            <div className="text-muted-foreground/70 text-[11px]">needs trade-api</div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2">
        <h2 className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">By plan</h2>
        {plansQ.isError ? (
          <Card>
            <CardContent className="text-destructive py-4 text-xs">
              Couldn&apos;t load plans. <code className="font-mono">/api/billing/plans</code> returned an error.
            </CardContent>
          </Card>
        ) : plansQ.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-6 text-center text-xs">
              No plans configured.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id} className={cn('border', TIER_COLORS[p.id])}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-foreground text-sm font-semibold">{p.name}</h3>
                    <Badge variant="outline" className="font-mono text-[10px]">{p.id}</Badge>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-foreground text-xl font-semibold tabular-nums">
                      {p.subscriber_count.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-[11px]">subscribers</span>
                  </div>
                  <div className="text-muted-foreground border-border mt-3 flex items-center justify-between border-t pt-3 text-[11px]">
                    <span>{fmtMoney(p.price_mo)}/mo</span>
                    <span className="text-foreground/90 font-mono tabular-nums">
                      {fmtMoney(p.subscriber_count * p.price_mo)}/mo
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-xs">
          <CalendarClock className="mx-auto mb-2 size-5" />
          <p className="font-medium">Per-subscription rows not wired yet</p>
          <p className="mx-auto mt-1 max-w-md">
            Stripe sub ID, customer, plan, period start/end, renewal date, MRR contribution,
            and churn risk will list here once trade-api exposes{' '}
            <code className="font-mono">/v1/admin/subscriptions</code>.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <CreditCard className="mt-0.5 size-3 shrink-0" />
          <p>
            For aggregate MRR / ARR see{' '}
            <Link href="/dashboard/trade/billing" className="text-primary hover:underline">Trade · Billing</Link>.
            For per-customer rows see{' '}
            <Link href="/dashboard/trade/users" className="text-primary hover:underline">Trade · Users</Link>{' '}
            (also gated on trade-api).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
