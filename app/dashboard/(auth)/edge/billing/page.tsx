/**
 * /dashboard/edge/billing — preview shell.
 *
 * Edge is BYOK / sportsbook-funds — bettors keep funds at Cloudbet,
 * Glitch Edge bills only for the automation tier (subscription /
 * per-strategy). Surface lists subscription state once that pricing
 * ships.
 */
import { CreditCard, DollarSign, FileText, TrendingDown } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function EdgeBillingPage() {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <CreditCard className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Edge · Billing</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Edge subscription billing — automation tier, not bettor bankroll. Edge is BYOK so
            funds stay at Cloudbet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Automation MRR', icon: DollarSign, sub: 'Edge automation pricing not shipped' },
          { label: 'Active subs', icon: CreditCard, sub: '—' },
          { label: 'Churn (30d)', icon: TrendingDown, sub: '—' },
          { label: 'Open invoices', icon: FileText, sub: '—' },
        ].map((k) => (
          <Card key={k.label} className="border-dashed">
            <CardContent className="space-y-1.5 py-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
                <k.icon className="size-3" />
                {k.label}
              </div>
              <div className="text-muted-foreground/70 text-[11px]">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-xs">
          <CreditCard className="mx-auto mb-2 size-5" />
          <p className="font-medium">No Edge billing data yet</p>
          <p className="mx-auto mt-1 max-w-md">
            Edge automation pricing has not shipped. When subscriptions go live, this surface lists
            active plans, MRR, and per-bettor billing state.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
