/**
 * /dashboard — redirect to the post-login landing.
 *
 * Today (v1.4 IA) lives at /dashboard/system/today. The RSC redirect
 * works under static export — generates a meta-refresh HTML page.
 */
import { redirect } from 'next/navigation'

export default function DashboardRoot() {
  redirect('/dashboard/system/today')
}
