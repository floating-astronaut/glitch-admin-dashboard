/**
 * /dashboard/edge/users — preview shell.
 *
 * Edge has its own app + database for users (BYOK Cloudbet bettors).
 * Per-user reads on edge-api (/v1/me, /v1/me/cloudbet/info) require
 * per-user JWTs; aggregate listing needs an admin operator layer
 * (cross-repo).
 */
import { Link as LinkIcon, UserCheck, UserPlus, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function EdgeUsersPage() {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Users className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Edge · Users</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Operator view of the Edge app&apos;s user database (BYOK Cloudbet bettors). Distinct
            from admin operators (see <code className="font-mono">/system/users</code>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total bettors', icon: Users, sub: 'needs edge-api /v1/admin/*' },
          { label: 'Active (30d)', icon: UserCheck, sub: '—' },
          { label: 'Signups (7d)', icon: UserPlus, sub: '—' },
          { label: 'Cloudbet-connected', icon: LinkIcon, sub: '—' },
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
            Edge-api&apos;s per-user reads (<code className="font-mono">/v1/me</code>,{' '}
            <code className="font-mono">/v1/me/cloudbet/info</code>) require a per-user JWT.
            Aggregate user listing for the admin dashboard waits on an{' '}
            <code className="font-mono">/v1/admin/*</code> layer on edge-api — same blocker as
            /edge/betting.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
