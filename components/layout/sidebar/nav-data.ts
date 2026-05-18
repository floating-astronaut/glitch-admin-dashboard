/**
 * Sidebar navigation — locked to docs/ADMIN_IA.md v1.4.
 *
 * Four peer groups, single-user model. Per-vertical ownership rule:
 * business-operational data (customers / users / billing) lives under
 * the owning vertical; System carries shared platform/ops only.
 *
 * In v2 the route prefix is /dashboard/* (Next.js App Router (auth)
 * group), so the v1 paths like /trade/billing become
 * /dashboard/trade/billing. The Sales + Website Analytics surfaces
 * are kit-shipped, kept as ad-hoc landing surfaces under a "Reports"
 * group until they're absorbed into the per-vertical pages.
 *
 * Items still pending a Next.js port from the v1 SPA are flagged
 * isComing: true and link to '#' — they'll go live one by one in
 * step 5 of the v2 migration plan. Doing this lets the operator see
 * the full IA shape immediately while the pages catch up.
 */
import {
  CreditCardIcon,
  FileClockIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  NetworkIcon,
  ServerIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SproutIcon,
  TargetIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'

export type NavLeaf = {
  title: string
  href: string
  icon?: LucideIcon
  isComing?: boolean
  isDataBadge?: string
  isNew?: boolean
  newTab?: boolean
  // Optional nested sub-items — the kit's NavMain renders a dropdown
  // when present. None of our v1.4 IA items use this, but the field
  // is here for structural compatibility with NavMain.tsx.
  items?: NavLeaf[]
}

export type NavGroup = {
  title: string
  items: NavLeaf[]
}

export const navItems: NavGroup[] = [
  {
    title: 'Trade · Business',
    items: [
      { title: 'Revenue',       href: '/dashboard/trade/revenue',       icon: LayoutDashboardIcon },
      { title: 'Users',         href: '/dashboard/trade/users',         icon: UsersIcon },
      { title: 'Subscriptions', href: '/dashboard/trade/subscriptions', icon: CreditCardIcon },
      { title: 'Billing',       href: '/dashboard/trade/billing',       icon: CreditCardIcon },
    ],
  },
  {
    title: 'Grow',
    items: [
      { title: 'Overview',  href: '/dashboard/grow', icon: SproutIcon },
      { title: 'Customers', href: '/dashboard/grow/customers', icon: ShoppingCartIcon },
      { title: 'Users',     href: '/dashboard/grow/users',    icon: UsersIcon },
      { title: 'Billing',   href: '/dashboard/grow/billing',  icon: CreditCardIcon },
    ],
  },
  {
    title: 'Edge',
    items: [
      { title: 'Overview', href: '/dashboard/edge',         icon: LayoutDashboardIcon },
      { title: 'Betting',  href: '/dashboard/edge/betting', icon: TargetIcon },
      { title: 'Users',    href: '/dashboard/edge/users',   icon: UsersIcon },
      { title: 'Billing',  href: '/dashboard/edge/billing', icon: CreditCardIcon },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Today',           href: '/dashboard/system/today',        icon: LayoutDashboardIcon },
      { title: 'Infrastructure',  href: '/dashboard/system/infrastructure', icon: ServerIcon },
      { title: 'Server Map',      href: '/dashboard/system/server-map',   icon: NetworkIcon },
      { title: 'Control Centre',  href: '/dashboard/system/control-centre', icon: LayoutGridIcon },
      { title: 'User Management', href: '/dashboard/system/users',        icon: ShieldCheckIcon },
      { title: 'Audit Logs',      href: '/dashboard/system/audit-logs',   icon: FileClockIcon },
      { title: 'Settings',        href: '/dashboard/system/settings',     icon: SettingsIcon },
    ],
  },
]
