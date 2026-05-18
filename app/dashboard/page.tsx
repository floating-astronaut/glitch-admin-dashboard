/**
 * /dashboard — root redirect to the default landing.
 *
 * Per the operator's "Sales as /" pick in the v2 migration plan,
 * any hit on /dashboard (or post-login navigations that resolve to
 * /dashboard) lands on /dashboard/sales. When step 5 ports the
 * v1 System › Today surface, switch this redirect to that route.
 */
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function DashboardRoot() {
  redirect('/dashboard/sales')
}
