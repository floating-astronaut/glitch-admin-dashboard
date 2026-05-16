/**
 * /trade/revenue — Glitch Trade subscription business overview.
 *
 * Data: GET /api/trade-admin/metrics (admin_api proxy → trade-api
 * /v1/admin/metrics, secret injected server-side). Refetches every
 * 60s — Stripe events flow through CF Pages → trade-api fast enough
 * that a minute lag is invisible.
 */
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Users, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import { getTradeMetrics } from '../../api/tradeAdmin'

const TIER_LABEL: Record<string, string> = {
  pro: 'Pro',
  'pro-plus': 'Pro+',
  'pro-quant': 'Pro Quant',
}
const TIER_ORDER = ['pro', 'pro-plus', 'pro-quant']

export default function TradeRevenue() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tradeAdmin', 'metrics'],
    queryFn: getTradeMetrics,
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Subscription business overview for trade.glitchexecutor.com — MRR, active subs by
          tier, churn, trial conversion. Reads from <code className="font-mono text-xs">/v1/admin/metrics</code> on trade-api.
          {data?.generated_at && (
            <span className="ml-2 text-xs">· generated {new Date(data.generated_at).toLocaleTimeString()}</span>
          )}
        </p>
      </header>

      <Section title="Headline">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="MRR"
            value={data ? `$${data.mrr_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            sub="monthly recurring revenue (excludes trialing)"
            icon={CreditCard}
            loading={isLoading}
          />
          <KpiCard
            label="Active subs"
            value={data?.active_subscriptions ?? '—'}
            sub="active + trialing + past_due"
            icon={Users}
            loading={isLoading}
          />
          <KpiCard
            label="Churn (30d)"
            value={data ? `${data.churn_30d_pct.toFixed(1)}%` : '—'}
            sub="cancellations / active at month start"
            icon={TrendingDown}
            loading={isLoading}
          />
          <KpiCard
            label="Trial → paid"
            value={data ? `${data.trial_conversion_30d_pct.toFixed(1)}%` : '—'}
            sub="trial conversion last 30d"
            icon={TrendingUp}
            loading={isLoading}
          />
        </div>
      </Section>

      <Section title="Subscriptions by tier">
        <Card className="p-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <div className="text-sm text-red-400">Failed to load metrics: {(error as Error).message}</div>
          ) : !data || Object.keys(data.by_tier).length === 0 ? (
            <div className="text-sm text-muted-foreground">No paid subscriptions yet — first conversion will populate this view.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {TIER_ORDER.filter(t => data.by_tier[t]).map(tier => (
                <div key={tier} className="rounded-md border border-g-border bg-g-card p-4">
                  <div className="text-xs uppercase tracking-wider text-g-muted">{TIER_LABEL[tier] || tier}</div>
                  <div className="mt-2 text-2xl font-semibold">{data.by_tier[tier]}</div>
                  <div className="mt-1 text-xs text-muted-foreground">subscribers</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>

      <Section title="Users at a glance">
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Total users" value={data?.total_users ?? '—'} sub="all-time signups" icon={Users} loading={isLoading} />
          <KpiCard label="Paid" value={data?.paid_users ?? '—'} sub="active or trialing subscription" icon={Users} loading={isLoading} />
          <KpiCard label="Free" value={data?.free_users ?? '—'} sub="signed up, never subscribed" icon={Users} loading={isLoading} />
        </div>
      </Section>
    </div>
  )
}
