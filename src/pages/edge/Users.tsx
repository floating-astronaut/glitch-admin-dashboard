/**
 * Edge › Users — view into the Edge app's user database.
 *
 * Preview shell per ADMIN-SHELLS-1. Edge has its own app + database
 * for users (BYOK Cloudbet bettors via edge-app.glitchexecutor.com).
 * The user-shaped reads already exist on edge-api at /v1/me etc.
 * but are scoped to per-user JWTs; surfacing them aggregate from
 * the admin dashboard needs an admin/operator API layer on edge-api
 * (the same blocker as /edge/betting's deeper surfaces).
 */
import { Users } from 'lucide-react'
import Card from '../../components/ui/Surface'
import EmptyState from '../../components/ui/EmptyState'

export default function EdgeUsers() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Users size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Edge · Users</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Operator view of the Edge app's user database (BYOK
            Cloudbet bettors). Distinct from admin operators (see
            <code className="font-mono">/system/users</code>).
          </p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon={Users}
          title="Operator API not wired yet"
          description="Edge-api's per-user reads (/v1/me, /v1/me/cloudbet/info) require a per-user JWT. Aggregate user listing for the admin dashboard waits on an /v1/admin/* layer on edge-api — same blocker as /edge/betting."
        />
      </Card>
    </div>
  )
}
