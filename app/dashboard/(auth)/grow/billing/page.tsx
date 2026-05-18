/**
 * /dashboard/grow/billing — preview shell.
 *
 * Grow-specific billing (per-brand plans, agent usage metering,
 * invoices). Distinct from Trade · Billing — which is Trade-SaaS
 * subscribers. Today GROW-WEDGE-1 is still in lead-capture; no paid
 * Grow customers exist yet.
 */
import { CreditCard, DollarSign, FileText, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function GrowBillingPage() {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <CreditCard className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Grow · Billing</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Grow-specific billing: per-brand plans, agent usage metering, invoices.
            Distinct from <code className="font-mono">/trade/billing</code> (Trade-SaaS subscribers).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'MRR', icon: DollarSign, sub: 'no paid Grow customers yet' },
          { label: 'Active plans', icon: CreditCard, sub: '—' },
          { label: 'Trial users', icon: TrendingUp, sub: '—' },
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
          <p className="font-medium">No Grow billing data yet</p>
          <p className="mx-auto mt-1 max-w-md">
            GROW-WEDGE-1 is still in lead-capture; no paid Grow customers exist.
            When per-brand plans and metering ship, this surface lists invoices, MRR,
            and per-agent usage.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
