/**
 * Grow › Overview — business-operator landing for the Grow vertical.
 *
 * v1.4 IA: Grow in the admin dashboard carries Overview / Customers /
 * Users / Billing only. Per-agent operations live elsewhere (out of
 * the admin dashboard). This page is the surface-grid into Grow's
 * three deep operator surfaces + a cross-Grow KPI snapshot up top.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, CreditCard, MailQuestion, ShoppingCart,
  Sprout, Users, XCircle, type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import KpiCard from '../../components/ui/KpiCard'
import Card from '../../components/ui/Surface'
import Section from '../../components/ui/Section'
import { customersBuyers, customersLeads } from '../../api/grow'

function SurfaceCard({
  headline, body, to, icon: Icon,
}: {
  headline: string
  body: string
  to: string
  icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="group flex items-start justify-between gap-3 rounded-xl border border-g-border bg-g-card p-4 transition-all hover:border-accent/30 hover:bg-accent/5"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-g-dim">
          <Icon size={12} className="text-g-muted group-hover:text-accent" />
          Grow
        </div>
        <div className="mt-1 text-sm font-semibold text-white">{headline}</div>
        <p className="mt-1 text-xs text-g-muted">{body}</p>
      </div>
      <ArrowRight size={14} className="text-g-dim shrink-0 mt-1 group-hover:text-accent" />
    </Link>
  )
}

export default function GrowOverview() {
  const buyersQ = useQuery({
    queryKey: ['grow:overview:buyers'],
    // Pull a generous slice so client-side roll-ups (fulfilled,
    // refunded, most-recent) are accurate without paginating.
    queryFn: () => customersBuyers({ limit: 500 }),
    refetchInterval: 60_000,
  })
  const leadsQ = useQuery({
    queryKey: ['grow:overview:leads'],
    queryFn: customersLeads,
    refetchInterval: 60_000,
  })

  const buyers = buyersQ.data?.buyers ?? []
  const buyersCount = buyersQ.data?.count ?? 0
  const leadsCount = leadsQ.data?.count ?? 0
  const fulfilled = buyers.filter(b => b.fulfilled_at && !b.refunded_at).length
  const refunded  = buyers.filter(b => b.refunded_at).length
  const latest    = buyers
    .map(b => b.created_at ? new Date(b.created_at).valueOf() : 0)
    .filter(t => t > 0)
    .sort((a, b) => b - a)[0]

  const latestLabel = latest
    ? formatDistanceToNow(new Date(latest), { addSuffix: true })
    : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Sprout size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Grow — Business</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Operator console for the Grow vertical: paid buyers,
            customer-user database, and Grow-side billing.
          </p>
        </div>
      </div>

      {/* Cross-Grow snapshot — derived from /api/customers/buyers +
          /api/customers/leads. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Paid buyers"
          value={buyersQ.isLoading ? '…' : buyersCount}
          icon={ShoppingCart}
          accent
          sub={`latest ${latestLabel}`}
        />
        <KpiCard
          label="Fulfilled"
          value={buyersQ.isLoading ? '…' : fulfilled}
          icon={CheckCircle}
          sub={buyersCount > 0 ? `${Math.round((fulfilled / buyersCount) * 100)}% of total` : ''}
        />
        <KpiCard
          label="Refunded"
          value={buyersQ.isLoading ? '…' : refunded}
          icon={XCircle}
          sub={buyersCount > 0 ? `${Math.round((refunded / buyersCount) * 100)}% of total` : ''}
          trend={refunded > 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          label="Vibe Kit leads"
          value={leadsQ.isLoading ? '…' : leadsCount}
          icon={MailQuestion}
          sub="Google Sheet + Resend audience"
        />
      </div>

      <Section title="Surfaces">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SurfaceCard
            headline="Customers"
            body="Paid buyers + Vibe Kit lead aggregate."
            to="/grow/customers"
            icon={ShoppingCart}
          />
          <SurfaceCard
            headline="Users"
            body="Operator view of Grow's customer-user database."
            to="/grow/users"
            icon={Users}
          />
          <SurfaceCard
            headline="Billing"
            body="Per-brand plans, agent usage, invoices."
            to="/grow/billing"
            icon={CreditCard}
          />
        </div>
      </Section>

      <Card>
        <p className="text-[11px] text-g-muted leading-relaxed">
          Per-agent operations (Sales / Ads / Social / UGC / SEO /
          Voice) live in the Grow app itself, not in the admin
          dashboard. The admin console covers business-operator
          surfaces only.
        </p>
      </Card>
    </div>
  )
}
