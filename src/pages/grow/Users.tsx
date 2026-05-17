/**
 * Grow › Users — view into the Grow app's user database.
 *
 * Preview shell per ADMIN-SHELLS-1. Grow has its own app + database
 * for users (separate from Trade subscribers and Edge bettors per
 * the v1.1 ownership rule). When the operator API on the Grow app
 * exposes a read endpoint, this page wires to it the same way
 * /grow/customers wires to admin_api `/api/customers/buyers`.
 */
import { Users } from 'lucide-react'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function GrowUsers() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Users size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Grow · Users</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Operator view of the Grow app's user database. Distinct
            from Grow buyers (see <code className="font-mono">/grow/customers</code>)
            and admin operators (see <code className="font-mono">/system/users</code>).
          </p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon={Users}
          title="Operator API not wired yet"
          description="When the Grow app exposes an admin/operator user-read endpoint, this page lists active users, signup dates, brand scoping, and plan/quota state."
        />
      </Card>
    </div>
  )
}
