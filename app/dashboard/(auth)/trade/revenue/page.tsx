/**
 * /dashboard/trade/revenue — Trade-SaaS revenue overview.
 *
 * Live MRR/ARR/subscriber counts come from admin_api /api/billing/summary
 * (same source as /trade/billing). The historical time-series breakdown
 * (per-month revenue, churn waterfall, cohort retention) waits on a
 * trade-api /v1/admin/revenue layer (cross-repo).
 *
 * This page is intentionally lighter than /trade/billing — that page
 * is the operational source of truth for plan counts and email signups.
 * Revenue is the leadership/finance view; today it's a teaser strip.
 */
'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, LineChart, RefreshCw, TrendingUp, Users,
  type LucideIcon,
} from 'lucide-react'

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

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
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

export default function TradeRevenuePage() {
  const sumQ = useQuery<BillingSummary>({
    queryKey: ['billing:summary'],
    queryFn: getBillingSummary,
    refetchInterval: 60_000,
  })
  const s = sumQ.data

  return (
    <div className="space-y-6 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <LineChart className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Trade · Revenue</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Trade-SaaS revenue overview — live MRR / ARR from admin_api{' '}
            <code className="font-mono">/api/billing/summary</code>. Historical breakdown,
            churn waterfall, and cohort retention wait on a trade-api operator layer.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => sumQ.refetch()}>
          <RefreshCw className={cn('size-3', sumQ.isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="MRR"
          value={s ? fmtMoney(s.mrr_usd) : '—'}
          loading={sumQ.isLoading}
          icon={DollarSign}
          accent
        />
        <Kpi
          label="ARR"
          value={s ? fmtMoney(s.arr_usd) : '—'}
          loading={sumQ.isLoading}
          icon={TrendingUp}
        />
        <Kpi
          label="Active subscribers"
          value={s?.total_active ?? 0}
          loading={sumQ.isLoading}
          icon={Users}
        />
        <Kpi
          label="Trial users"
          value={s?.total_trial ?? 0}
          loading={sumQ.isLoading}
          icon={Users}
        />
      </div>

      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-xs">
          <LineChart className="mx-auto mb-2 size-5" />
          <p className="font-medium">Historical breakdown not wired yet</p>
          <p className="mx-auto mt-1 max-w-md">
            Per-month revenue, per-tier growth, churn waterfall, and cohort retention will
            chart here once trade-api exposes an{' '}
            <code className="font-mono">/v1/admin/revenue</code> operator endpoint.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <DollarSign className="mt-0.5 size-3 shrink-0" />
          <p>
            Per-plan counts and email-signup leads live at{' '}
            <Link href="/dashboard/trade/billing" className="text-primary hover:underline">Trade · Billing</Link>.
            Per-customer subscription rows arrive at{' '}
            <Link href="/dashboard/trade/subscriptions" className="text-primary hover:underline">Trade · Subscriptions</Link>{' '}
            when the trade-api operator layer ships.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
