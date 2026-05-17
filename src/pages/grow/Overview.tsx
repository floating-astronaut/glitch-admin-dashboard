/**
 * Grow › Overview — business-operator landing for the Grow vertical.
 *
 * v1.4 IA: Grow in the admin dashboard carries Overview / Customers /
 * Users / Billing only. Per-agent operations live elsewhere (out of
 * the admin dashboard). This page is the surface-grid into Grow's
 * three deep operator surfaces.
 */
import { Link } from 'react-router-dom'
import {
  ArrowRight, CreditCard, ShoppingCart, Sprout, Users,
  type LucideIcon,
} from 'lucide-react'
import Card from '../../components/ui/Surface'
import Section from '../../components/ui/Section'

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
