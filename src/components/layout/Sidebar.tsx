import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Bot, Users, CreditCard,
  Server, Settings, Zap, X, Sprout,
  Shield, BarChart3, Newspaper,
  ChevronDown, ShieldCheck, LayoutGrid,
  MessageSquare, Megaphone, Share2, Film, Search, PhoneCall,
  Target, FileClock,
} from 'lucide-react'
import { useUIStore } from '../../stores/ui'
import clsx from 'clsx'

interface NavItem { label: string; icon: any; to: string; end?: boolean }
interface NavGroup { section: string; defaultOpen?: boolean; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    section: 'TRADE',
    defaultOpen: true,
    items: [
      { label: 'Overview',  icon: LayoutDashboard, to: '/trade', end: true },
      { label: 'Bots',      icon: Bot,             to: '/trade/bots' },
      { label: 'Signals',   icon: Zap,             to: '/trade/signals' },
      { label: 'Trades',    icon: BarChart3,       to: '/trade/trades' },
      { label: 'Oracle',    icon: Shield,          to: '/trade/oracle' },
      { label: 'News',      icon: Newspaper,       to: '/trade/news' },
    ],
  },
  {
    section: 'GROW',
    defaultOpen: true,
    items: [
      { label: 'Overview',     icon: Sprout,        to: '/grow', end: true },
      { label: 'Sales Agent',  icon: MessageSquare, to: '/grow/sales' },
      { label: 'Ads Agent',    icon: Megaphone,     to: '/grow/ads' },
      { label: 'Social Agent', icon: Share2,        to: '/grow/social' },
      { label: 'UGC Agent',    icon: Film,          to: '/grow/ugc' },
      { label: 'SEO Agent',    icon: Search,        to: '/grow/seo' },
      { label: 'Voice Agent',  icon: PhoneCall,     to: '/grow/voice' },
    ],
  },
  {
    section: 'EDGE',
    defaultOpen: true,
    items: [
      { label: 'Betting',      icon: Target,          to: '/edge' },
    ],
  },
  {
    section: 'ADMIN',
    defaultOpen: true,
    items: [
      { label: 'Home',            icon: LayoutDashboard, to: '/', end: true },
      { label: 'Customers',       icon: Users,           to: '/clients' },
      { label: 'Billing',         icon: CreditCard,      to: '/billing' },
      { label: 'Infrastructure',  icon: Server,          to: '/infrastructure' },
      { label: 'Control Centre',  icon: LayoutGrid,      to: '/admin/control-centre' },
      { label: 'User Management', icon: ShieldCheck,     to: '/admin/users' },
      { label: 'Audit Logs',      icon: FileClock,       to: '/admin/audit-logs' },
      { label: 'Settings',        icon: Settings,        to: '/settings' },
    ],
  },
]

function Group({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(group.defaultOpen ?? true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 mb-1 group"
      >
        <p className="text-[10px] font-semibold text-g-dim tracking-widest group-hover:text-accent transition-colors">
          {group.section}
        </p>
        <ChevronDown
          size={12}
          className={clsx(
            'text-g-dim transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>
      {open && group.items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            isActive
              ? 'bg-accent/10 text-accent font-medium'
              : 'text-g-muted hover:text-g-text hover:bg-white/5'
          )}
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-30 flex flex-col',
        'bg-g-deep border-r border-g-border transition-transform duration-200',
        'w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        <div className="flex items-center gap-2 px-4 h-14 border-b border-g-border shrink-0">
          <Zap size={18} className="text-accent" />
          <span className="font-bold text-sm tracking-wide text-white">GlitchExecutor</span>
          <span className="ml-1 text-xs text-g-muted font-mono">admin</span>
          <button
            className="ml-auto lg:hidden text-g-muted hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {NAV.map(g => <Group key={g.section} group={g} />)}
        </nav>

        <div className="px-4 py-3 border-t border-g-border text-[10px] text-g-dim font-mono">
          v2.1.0
        </div>
      </aside>
    </>
  )
}
