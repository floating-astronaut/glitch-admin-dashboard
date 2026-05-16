/**
 * /trade/users — operator-side user management for Glitch Trade.
 *
 * Lists users with their subscription state, connected accounts,
 * saved replays count, last seen. Click into a row → user detail
 * (next ship — for now the row click is a no-op).
 *
 * Data source (next ship): GET /v1/admin/users on trade-api. Schema:
 *   { users: [{ id, email, role, created_at, last_seen_at,
 *               subscription: { tier, status, current_period_end },
 *               counts: { accounts, replays } }] }
 */
import { Users, Search, Sparkles } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function TradeUsers() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Users</h1>
        <p className="text-sm text-muted-foreground">
          Every signed-up user on trade.glitchexecutor.com — subscription state, connected
          accounts, saved replays, last seen. Reads from <code className="font-mono text-xs">/v1/admin/users</code> on trade-api.
        </p>
      </header>

      <Section title="At a glance">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total users"
            value="—"
            sub="all-time signups"
            icon={Users}
          />
          <KpiCard
            label="Active 30d"
            value="—"
            sub="last_seen_at within 30 days"
            icon={Users}
          />
          <KpiCard
            label="Paid"
            value="—"
            sub="active or trialing subscription"
            icon={Users}
          />
          <KpiCard
            label="Free"
            value="—"
            sub="signed up, never subscribed"
            icon={Users}
          />
        </div>
      </Section>

      <Section
        title="Users"
        action={
          <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Search by email / Stripe customer id
          </div>
        }
      >
        <Card className="p-6">
          <EmptyState
            icon={Sparkles}
            title="Waiting on /v1/admin/users"
            description="The admin endpoint that returns the paginated user list with joined subscription state + activity counts hasn't shipped yet. Once it lands this section renders a sortable table with row-click → user detail."
          />
        </Card>
      </Section>
    </div>
  )
}
