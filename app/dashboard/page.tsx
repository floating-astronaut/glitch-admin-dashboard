/**
 * /dashboard — placeholder landing.
 *
 * Steps 1-4 + the static-export switch produced an empty shell. The
 * v1.4 IA's domain pages (Trade · Business / Grow / Edge / System)
 * are scheduled for step 5; until then this page is the post-login
 * landing. Sidebar items are flagged `isComing: true` for every
 * unbuilt route — they're discoverable, just don't navigate yet.
 *
 * When step 5 lands /dashboard/system/today, switch this file to
 * `redirect('/dashboard/system/today')` (Next.js RSC redirect works
 * fine under static export — generates a meta-refresh HTML).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardLanding() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Glitch Admin Console</CardTitle>
          <CardDescription>
            v2 shell live. Domain pages land in step 5.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            The sidebar carries the locked v1.4 IA — Trade · Business / Grow /
            Edge / System. Items tagged <em>Coming soon</em> are queued for
            step 5 of the v2 migration.
          </p>
          <p>
            Operator surfaces from the v1 SPA (Server Map, Customers,
            Buyer Detail, Audit Logs, Trade Billing) port in next, with
            Server Map first since its backend already ships.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
