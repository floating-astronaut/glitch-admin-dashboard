/**
 * / — root redirect to the admin console landing.
 *
 * Replaces the kit's Node-runtime `proxy.ts` (Next.js 16's Proxy
 * convention can't run on Edge, which @cloudflare/next-on-pages
 * requires). A plain RSC redirect at `app/page.tsx` does the same job
 * and runs at the edge without ceremony.
 *
 * Per the v2 plan: "Sales as /" until step 5 lands System › Today,
 * at which point the redirect target flips.
 */
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function RootPage() {
  redirect('/dashboard/sales')
}
