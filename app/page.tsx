/**
 * / — root redirect to the dashboard landing.
 *
 * RSC redirect runs at build time under static export and produces a
 * meta-refresh HTML page (CF Pages serves the static file directly).
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
