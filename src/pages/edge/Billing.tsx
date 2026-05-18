/**
 * Edge › Billing — view into Edge's billing data.
 *
 * Preview shell. Edge is a BYOK / sportsbook-funds product — bettors
 * keep funds at Cloudbet, Glitch Edge bills only for the automation
 * tier (subscription / per-strategy). Surface lists subscription
 * state once that pricing ships.
 */
import {
  CreditCard, DollarSign, TrendingDown, FileText,
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function EdgeBilling() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <CreditCard size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Edge · Billing</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Edge subscription billing (automation tier — not bettor
            bankroll; Edge is BYOK so funds stay at Cloudbet).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Automation MRR"   value="—" icon={DollarSign}   sub="Edge automation pricing not shipped" />
        <KpiCard label="Active subs"      value="—" icon={CreditCard}   sub="—" />
        <KpiCard label="Churn (30d)"      value="—" icon={TrendingDown} sub="—" />
        <KpiCard label="Open invoices"    value="—" icon={FileText}     sub="—" />
      </div>

      <Card>
        <EmptyState
          icon={CreditCard}
          title="No Edge billing data yet"
          description="Edge automation pricing has not shipped. When subscriptions go live, this surface lists active plans, MRR, and per-bettor billing state."
        />
      </Card>
    </div>
  )
}
