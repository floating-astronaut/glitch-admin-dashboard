/**
 * Grow › Billing — view into Grow's billing data.
 *
 * Preview shell. Distinct from Trade · Billing (Trade-SaaS
 * subscribers) — this surface will carry Grow-side billing once the
 * underlying revenue stream exists (per-brand Grow plans, agent
 * usage metering, etc.). Today GROW-WEDGE-1 is still in lead-capture
 * phase; no paid Grow customers yet.
 */
import {
  CreditCard, DollarSign, TrendingUp, FileText,
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
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
            metering, invoices. Distinct from Trade · Billing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="MRR"            value="—" icon={DollarSign} sub="no paid Grow customers yet" />
        <KpiCard label="Active plans"   value="—" icon={CreditCard} sub="—" />
        <KpiCard label="Trial users"    value="—" icon={TrendingUp} sub="—" />
        <KpiCard label="Open invoices"  value="—" icon={FileText}   sub="—" />
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
