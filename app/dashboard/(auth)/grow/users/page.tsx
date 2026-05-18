/**
 * /dashboard/grow/users — preview shell.
 *
 * Grow has its own app + database for users (separate from Trade
 * subscribers and Edge bettors per the v1.4 ownership rule). When
 * the Grow operator API exposes a read endpoint, this page wires
 * the same way /grow/customers wires to admin_api /api/customers/buyers.
 */
import { CreditCard, Link as LinkIcon, UserCheck, UserPlus, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function GrowUsersPage() {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Users className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Grow · Users</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Operator view of the Grow app&apos;s customer-user database. Distinct
            from Grow buyers (see <code className="font-mono">/grow/customers</code>) and
            admin operators (see <code className="font-mono">/system/users</code>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total users', icon: Users, sub: 'needs Grow operator API' },
          { label: 'Active (30d)', icon: UserCheck, sub: '—' },
          { label: 'Signups (7d)', icon: UserPlus, sub: '—' },
          { label: 'Connected brands', icon: LinkIcon, sub: '—' },
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
          <Users className="mx-auto mb-2 size-5" />
          <p className="font-medium">Operator API not wired yet</p>
          <p className="mx-auto mt-1 max-w-md">
            When the Grow app exposes an admin/operator user-read endpoint, this page
            lists active users, signup dates, brand scoping, and plan/quota state.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex items-start gap-2 py-3 text-[11px]">
          <CreditCard className="mt-0.5 size-3 shrink-0" />
          <p>
            For paid-buyer state see{' '}
            <a href="/dashboard/grow/customers" className="text-primary hover:underline">Grow · Customers</a>.
            Plans + invoices live at <a href="/dashboard/grow/billing" className="text-primary hover:underline">Grow · Billing</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
