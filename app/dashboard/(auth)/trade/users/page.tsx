/**
 * /dashboard/trade/users — preview shell.
 *
 * Operator view of paying Trade-SaaS subscribers (per-customer rows with
 * Stripe customer ID, plan, last billing, status). This is distinct from:
 *   - /system/users        (admin/operator accounts)
 *   - /trade/billing       (MRR/ARR and plan counts, no per-user grain)
 *   - /trade/subscriptions (Stripe subscription rows, recurring schedule)
 *
 * Data needs a trade-api /v1/admin/users layer (cross-repo); admin_api
 * only carries summary aggregates today. Active-subscriber count below is
 * a teaser pulled from /api/billing/summary so the page isn't entirely
 * blank.
 */
'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, RefreshCw, UserCheck, UserPlus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { getBillingSummary } from '@/lib/api/endpoints'

interface BillingSummary {
  mrr_usd: number
  arr_usd: number
  total_active: number
  total_trial: number
}

export default function TradeUsersPage() {
  const sumQ = useQuery<BillingSummary>({
    queryKey: ['billing:summary'],
    queryFn: getBillingSummary,
    refetchInterval: 60_000,
  })
  const s = sumQ.data

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Users className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Trade · Users</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Per-customer view of paying Trade-SaaS subscribers. Distinct from{' '}
            <code className="font-mono">/system/users</code> (admin/operator accounts).
            Needs a trade-api operator layer to wire fully.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => sumQ.refetch()}>
          <RefreshCw className={cn('size-3', sumQ.isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <UserCheck className="size-3" /> Active subscribers
            </div>
            <div className="text-foreground text-xl font-semibold tabular-nums">
              {sumQ.isLoading ? <Skeleton className="h-6 w-16" /> : s?.total_active ?? 0}
            </div>
            <div className="text-muted-foreground/80 text-[11px]">live from billing summary</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <UserPlus className="size-3" /> Trial users
            </div>
            <div className="text-foreground text-xl font-semibold tabular-nums">
              {sumQ.isLoading ? <Skeleton className="h-6 w-16" /> : s?.total_trial ?? 0}
            </div>
            <div className="text-muted-foreground/80 text-[11px]">live from billing summary</div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <Users className="size-3" /> Churned (30d)
            </div>
            <div className="text-muted-foreground/70 text-[11px]">needs trade-api /v1/admin/users</div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <CreditCard className="size-3" /> Stripe customers
            </div>
            <div className="text-muted-foreground/70 text-[11px]">needs trade-api /v1/admin/users</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-xs">
          <Users className="mx-auto mb-2 size-5" />
          <p className="font-medium">Per-customer rows not wired yet</p>
          <p className="mx-auto mt-1 max-w-md">
            Email, Stripe customer ID, plan, last billing, lifetime value, and churn risk
            will list here once trade-api exposes an{' '}
            <code className="font-mono">/v1/admin/users</code> operator endpoint.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <CreditCard className="mt-0.5 size-3 shrink-0" />
          <p>
            For MRR / ARR and per-plan counts see{' '}
            <Link href="/dashboard/trade/billing" className="text-primary hover:underline">Trade · Billing</Link>.
            Per-subscription Stripe rows live at{' '}
            <Link href="/dashboard/trade/subscriptions" className="text-primary hover:underline">Trade · Subscriptions</Link>{' '}
            once wired.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
