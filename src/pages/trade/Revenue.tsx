/**
 * /trade/revenue — Glitch Trade subscription business overview.
 *
 * Data source (next ship): GET /v1/admin/metrics on glitch-trade-api
 * returns MRR, active subscriptions by tier, churn rate (30d), trial
 * conversion. Schema is sketched below in the placeholder block; the
 * SPA-side client lands in src/api/tradeAdmin.ts alongside.
 *
 * For now this page renders the layout + skeleton tiles so the route
 * exists + the sidebar link doesn't 404. Wiring real data is the
 * follow-up.
 */
import { CreditCard, Users, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function TradeRevenue() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Subscription business overview for trade.glitchexecutor.com — MRR, active subs by
          tier, churn, trial conversion. Reads from <code className="font-mono text-xs">/v1/admin/metrics</code> on trade-api.
        </p>
      </header>

      {/* Headline KPIs — placeholder values until /v1/admin/metrics ships. */}
      <Section title="Headline">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="MRR"
            value="—"
            sub="monthly recurring revenue (live + trialing)"
            icon={CreditCard}
          />
          <KpiCard
            label="Active subs"
            value="—"
            sub="active + trialing + past_due"
            icon={Users}
          />
          <KpiCard
            label="Churn (30d)"
            value="—"
            sub="cancellations / active at month start"
            icon={TrendingDown}
          />
          <KpiCard
            label="Trial → paid"
            value="—"
            sub="trial conversion last 30d"
            icon={TrendingUp}
          />
        </div>
      </Section>

      <Section title="Subscriptions by tier">
        <Card className="p-6">
          <EmptyState
            icon={Sparkles}
            title="Waiting on /v1/admin/metrics"
            description="The admin endpoint that aggregates per-tier subscription counts hasn't shipped yet. Once it lands this section renders a small bar chart per tier (Pro / Pro+ / Pro Quant) + a list of active subs with their renew dates."
          />
        </Card>
      </Section>

      <Section title="Recent events">
        <Card className="p-6">
          <EmptyState
            icon={CreditCard}
            title="Latest 20 Stripe events"
            description="checkout.session.completed / invoice.paid / invoice.payment_failed / subscription.* — same stream that posts to Discord #ops-feed."
          />
        </Card>
      </Section>
    </div>
  )
}
