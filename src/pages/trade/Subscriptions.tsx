/**
 * /trade/subscriptions — operator-side subscription state browser.
 *
 * Different lens vs /trade/users: this page is keyed by subscription
 * (one row per active/past row in `subscriptions` table), not by user.
 * Lets the operator answer "who's past_due", "who's about to renew",
 * "who cancelled in the last 30d".
 *
 * Data source (next ship): GET /v1/admin/subscriptions on trade-api.
 *   { subscriptions: [{ id, user_email, sku, status,
 *                       current_period_end, cancel_at_period_end,
 *                       stripe_customer_id, stripe_subscription_id,
 *                       created_at, updated_at }] }
 */
import { CreditCard, AlertTriangle, Calendar, Sparkles } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function TradeSubscriptions() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Every subscription row in the trade-api <code className="font-mono text-xs">subscriptions</code> table —
          one entry per Stripe subscription, including cancelled ones.
          Reads from <code className="font-mono text-xs">/v1/admin/subscriptions</code>.
        </p>
      </header>

      <Section title="State">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Active"
            value="—"
            sub="status = active | trialing"
            icon={CreditCard}
          />
          <KpiCard
            label="Past due"
            value="—"
            sub="payment failed, in dunning"
            icon={AlertTriangle}
          />
          <KpiCard
            label="Cancel pending"
            value="—"
            sub="cancel_at_period_end = true"
            icon={Calendar}
          />
          <KpiCard
            label="Cancelled (30d)"
            value="—"
            sub="hard-cancelled last 30 days"
            icon={CreditCard}
          />
        </div>
      </Section>

      <Section title="Subscription list">
        <Card className="p-6">
          <EmptyState
            icon={Sparkles}
            title="Waiting on /v1/admin/subscriptions"
            description="The admin endpoint hasn't shipped yet. Once it lands this section renders a sortable table with status filters (active / past_due / cancelled), each row linking to the user + a Stripe-dashboard deep link to the subscription page."
          />
        </Card>
      </Section>
    </div>
  )
}
