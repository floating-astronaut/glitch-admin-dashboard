import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Bot, Users, CreditCard, Server, Settings, Zap,
  Sprout, Shield, BarChart3, Newspaper, LayoutGrid, ShieldCheck,
  MessageSquare, Megaphone, Share2, Film, Search, PhoneCall,
  Target, FileClock, ChevronRight, ChevronsUpDown, LogOut, User,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem { title: string; url: string; icon: any; end?: boolean }
interface NavGroup { title: string; items: NavItem[]; gateEmail?: string }

// Email that gates the legacy engine-internals group. Anyone else
// (other operators / future team members) sees the business-only
// Trade group. Keep in sync with the routes' TejasOnly wrapper in
// src/App.tsx.
const OPERATOR_EMAIL = 'tejaskagrawalgwl@gmail.com'

const NAV: NavGroup[] = [
  {
    // Business surface for the Glitch Trade subscription product.
    // Revenue, customers, subscription state — what the operator
    // monitors day-to-day. Backend lands in trade-api /v1/admin/*.
    title: 'Trade · Business',
    items: [
      { title: 'Revenue',       url: '/trade/revenue', icon: LayoutDashboard, end: true },
      { title: 'Users',         url: '/trade/users', icon: Users },
      { title: 'Subscriptions', url: '/trade/subscriptions', icon: CreditCard },
    ],
  },
  {
    // Engine-internals from the legacy dashboard era. Personal-use
    // only — gated to OPERATOR_EMAIL since these surfaces expose the
    // proprietary Snake/Ouroboros ensemble's internals and aren't
    // shared with future operators.
    title: 'Trade · Engine (personal)',
    gateEmail: OPERATOR_EMAIL,
    items: [
      { title: 'Overview',  url: '/trade/legacy', icon: LayoutDashboard, end: true },
      { title: 'Bots',      url: '/trade/bots', icon: Bot },
      { title: 'Signals',   url: '/trade/signals', icon: Zap },
      { title: 'Trades',    url: '/trade/trades', icon: BarChart3 },
      { title: 'Oracle',    url: '/trade/oracle', icon: Shield },
      { title: 'News',      url: '/trade/news', icon: Newspaper },
    ],
  },
  {
    title: 'Grow',
    items: [
      { title: 'Overview',     url: '/grow', icon: Sprout, end: true },
      { title: 'Sales Agent',  url: '/grow/sales', icon: MessageSquare },
      { title: 'Ads Agent',    url: '/grow/ads', icon: Megaphone },
      { title: 'Social Agent', url: '/grow/social', icon: Share2 },
      { title: 'UGC Agent',    url: '/grow/ugc', icon: Film },
      { title: 'SEO Agent',    url: '/grow/seo', icon: Search },
      { title: 'Voice Agent',  url: '/grow/voice', icon: PhoneCall },
    ],
  },
  {
    title: 'Edge',
    items: [
      { title: 'Betting', url: '/edge', icon: Target },
    ],
  },
  {
    // Renamed from "Admin" per ADMIN_IA §1: System is a peer of Trade /
    // Grow / Edge, not a meta-layer above them. URLs follow the same
    // /system/* namespace.
    title: 'System',
    items: [
      { title: 'Home',            url: '/', icon: LayoutDashboard, end: true },
      { title: 'Customers',       url: '/system/customers', icon: Users },
      { title: 'Billing',         url: '/system/billing', icon: CreditCard },
      { title: 'Infrastructure',  url: '/system/infrastructure', icon: Server },
      { title: 'Control Centre',  url: '/system/control-centre', icon: LayoutGrid },
      { title: 'User Management', url: '/system/users', icon: ShieldCheck },
      { title: 'Audit Logs',      url: '/system/audit-logs', icon: FileClock },
      { title: 'Settings',        url: '/system/settings', icon: Settings },
    ],
  },
]

function AppSidebarItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const isActive = item.end ? pathname === item.url : pathname.startsWith(item.url)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <NavLink to={item.url} end={item.end}>
          <item.icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebarGroup({ group }: { group: NavGroup }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) => <AppSidebarItem key={item.url} item={item} />)}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function FilteredNavGroups() {
  const { user } = useAuthStore()
  const email = (user?.email ?? '').toLowerCase()
  const visible = NAV.filter((g) => !g.gateEmail || g.gateEmail.toLowerCase() === email)
  return <>{visible.map((g) => <AppSidebarGroup key={g.title} group={g} />)}</>
}

function AppSidebarUser() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const initials = (user?.email ?? 'GE')
    .split('@')[0]
    .split(/[.\-_]/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                {initials || 'GE'}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.email?.split('@')[0] ?? 'admin'}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.role ?? 'admin'}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/system/settings')}>
              <User className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Zap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">GlitchExecutor</span>
                <span className="truncate text-xs text-muted-foreground">Admin Console</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* gateEmail filters out groups whose audience is locked to a
            single operator (the "personal" engine views). Other admins
            never see the link; route guards (TejasOnly in App.tsx)
            block direct URL access. */}
        <FilteredNavGroups />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
