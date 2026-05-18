/**
 * /dashboard/grow/customers — shell shared by Buyers + Leads sub-pages.
 *
 * Server component (no async data, no cookies). Renders the header +
 * a client-side tab strip that picks active state from pathname.
 */
import { Users } from 'lucide-react'

import { CustomersTabs } from './_components/tabs'

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Users className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Grow · Customers</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Paid buyers + Vibe Kit leads for the Grow vertical. Trade subscribers
            live under <code className="font-mono">/trade/*</code>; Edge accounts
            under <code className="font-mono">/edge/*</code>.
          </p>
        </div>
      </div>

      <CustomersTabs />

      {children}
    </div>
  )
}
