/**
 * Edge › Billing — view into Edge's billing data.
 *
 * Preview shell per ADMIN-SHELLS-1. Edge is a BYOK / sportsbook-funds
 * product — bettors keep funds at Cloudbet, Glitch Edge bills only
 * for the automation tier (subscription / per-strategy). Surface
 * lists subscription state once that pricing ships.
 */
import { CreditCard } from 'lucide-react'
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
            Edge subscription billing (automation tier, not bettor
            bankroll — Edge is BYOK so bettor funds stay at Cloudbet).
          </p>
        </div>
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
