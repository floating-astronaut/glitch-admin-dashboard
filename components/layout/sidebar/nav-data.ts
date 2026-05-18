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
      { title: 'Revenue',       href: '#', icon: LayoutDashboardIcon, isComing: true },
      { title: 'Users',         href: '#', icon: UsersIcon,           isComing: true },
      { title: 'Subscriptions', href: '#', icon: CreditCardIcon,      isComing: true },
      { title: 'Billing',       href: '#', icon: CreditCardIcon,      isComing: true },
    ],
  },
  {
    title: 'Grow',
    items: [
      { title: 'Overview',  href: '#', icon: SproutIcon,       isComing: true },
      { title: 'Customers', href: '#', icon: ShoppingCartIcon, isComing: true },
      { title: 'Users',     href: '#', icon: UsersIcon,        isComing: true },
      { title: 'Billing',   href: '#', icon: CreditCardIcon,   isComing: true },
    ],
  },
  {
    title: 'Edge',
    items: [
      { title: 'Overview', href: '#', icon: LayoutDashboardIcon, isComing: true },
      { title: 'Betting',  href: '#', icon: TargetIcon,          isComing: true },
      { title: 'Users',    href: '#', icon: UsersIcon,           isComing: true },
      { title: 'Billing',  href: '#', icon: CreditCardIcon,      isComing: true },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Today',           href: '#',                              icon: LayoutDashboardIcon, isComing: true },
      { title: 'Infrastructure',  href: '#',                              icon: ServerIcon,          isComing: true },
      { title: 'Server Map',      href: '/dashboard/system/server-map',   icon: NetworkIcon },
      { title: 'Control Centre',  href: '#',                              icon: LayoutGridIcon,      isComing: true },
      { title: 'User Management', href: '#',                              icon: ShieldCheckIcon,     isComing: true },
      { title: 'Audit Logs',      href: '#',                              icon: FileClockIcon,       isComing: true },
      { title: 'Settings',        href: '#',                              icon: SettingsIcon,        isComing: true },
    ],
  },
]
