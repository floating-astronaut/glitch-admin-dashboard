/**
 * CustomersTabs — route-driven sub-nav under /dashboard/grow/customers.
 *
 * Two tabs: Buyers (default) and Leads. Each is a sibling route, so
 * active state is read from `usePathname()`. The `_components` dir
 * prefix is the Next.js convention for a folder Next.js should NOT
 * treat as a route — keeps this co-located with its consumers.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Buyers', href: '/dashboard/grow/customers' },
  { label: 'Leads',  href: '/dashboard/grow/customers/leads' },
] as const

export function CustomersTabs() {
  const pathname = usePathname()
  return (
    <div className="border-border flex items-center gap-1 border-b">
      {TABS.map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
