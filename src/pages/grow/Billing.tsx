/**
 * Grow › Billing — view into Grow's billing data.
 *
 * Preview shell per ADMIN-SHELLS-1. Distinct from Trade · Billing
 * (Trade-SaaS subscribers) — this surface will carry Grow-side
 * billing once the underlying revenue stream exists (per-brand
 * Grow plans, agent usage metering, etc.). Today GROW-WEDGE-1 is
 * still in lead-capture phase; no paid Grow customers yet.
 */
import { CreditCard } from 'lucide-react'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function GrowBilling() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <CreditCard size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Grow · Billing</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Grow-specific billing: per-brand plans, agent usage
            metering, invoices. Distinct from Trade · Billing (the
            Trade SaaS subscriber surface).
          </p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon={CreditCard}
          title="No Grow billing data yet"
          description="GROW-WEDGE-1 is still in lead-capture; no paid Grow customers exist. When per-brand plans and metering ship, this surface lists invoices, MRR, and per-agent usage."
        />
      </Card>
    </div>
  )
}
