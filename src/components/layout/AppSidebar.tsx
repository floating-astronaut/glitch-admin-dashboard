import {
  LayoutDashboard, Users, CreditCard, Server, Settings, Zap,
  Sprout, LayoutGrid, ShieldCheck, Target, FileClock, Network,
  ChevronsUpDown, LogOut, User,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
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

interface NavItem { title: string; url: string; icon: any; end?: boolean }
interface NavGroup { title: string; items: NavItem[] }

/**
 * Sidebar IA — locked at v1.4 in docs/ADMIN_IA.md §2.
 *
 * Single-user model: the dashboard binds to admin@glitchexecutor.com
 * (sole operator account; SSO enforces). No per-user gating is needed
 * inside the dashboard — earlier OPERATOR_EMAIL / gateEmail / TejasOnly
 * machinery was removed as dead ceremony.
 *
 * Surfaces not listed here (Trade · Engine internals at /trade/engine
 * etc., Grow agent shells at /grow/sales /grow/ads etc.) intentionally
 * stay off the sidebar — they're reachable via the Grow Overview's
 * agent cards, the ⌘K command palette, and direct URLs. Sidebar holds
 * the recurring business-operator surfaces, not every page.
 */
const NAV: NavGroup[] = [
  {
    title: 'Trade · Business',
    items: [
      { title: 'Revenue',       url: '/trade/revenue', icon: LayoutDashboard, end: true },
      { title: 'Users',         url: '/trade/users', icon: Users },
      { title: 'Subscriptions', url: '/trade/subscriptions', icon: CreditCard },
      { title: 'Billing',       url: '/trade/billing', icon: CreditCard },
    ],
  },
  {
    title: 'Grow',
    items: [
      { title: 'Overview',  url: '/grow', icon: Sprout, end: true },
      { title: 'Customers', url: '/grow/customers', icon: Users },
      { title: 'Users',     url: '/grow/users', icon: Users },
      { title: 'Billing',   url: '/grow/billing', icon: CreditCard },
    ],
  },
  {
    title: 'Edge',
    items: [
      { title: 'Overview', url: '/edge',         icon: LayoutDashboard, end: true },
      { title: 'Betting',  url: '/edge/betting', icon: Target },
      { title: 'Users',    url: '/edge/users',   icon: Users },
      { title: 'Billing',  url: '/edge/billing', icon: CreditCard },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Today',           url: '/', icon: LayoutDashboard, end: true },
      { title: 'Infrastructure',  url: '/system/infrastructure', icon: Server },
      { title: 'Server Map',      url: '/system/server-map',     icon: Network },
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
        {NAV.map((g) => <AppSidebarGroup key={g.title} group={g} />)}
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
