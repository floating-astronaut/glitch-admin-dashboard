import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  LayoutDashboard, Bot, Zap, BarChart3, Shield, Newspaper,
  Sprout, MessageSquare, Megaphone, Share2, Film, Search, PhoneCall,
  Target, Users, CreditCard, Server, LayoutGrid, ShieldCheck,
  FileClock, Settings,
} from 'lucide-react'

interface Cmd {
  label: string
  to: string
  group: string
  icon: any
}

const COMMANDS: Cmd[] = [
  { group: 'Trade', label: 'Trade · Overview', to: '/trade', icon: LayoutDashboard },
  { group: 'Trade', label: 'Trade · Bots', to: '/trade/bots', icon: Bot },
  { group: 'Trade', label: 'Trade · Signals', to: '/trade/signals', icon: Zap },
  { group: 'Trade', label: 'Trade · Trades', to: '/trade/trades', icon: BarChart3 },
  { group: 'Trade', label: 'Trade · Oracle', to: '/trade/oracle', icon: Shield },
  { group: 'Trade', label: 'Trade · News', to: '/trade/news', icon: Newspaper },
  { group: 'Grow', label: 'Grow · Command Center', to: '/grow', icon: Sprout },
  { group: 'Grow', label: 'Sales Agent', to: '/grow/sales', icon: MessageSquare },
  { group: 'Grow', label: 'Sales · Glitch Budz', to: '/grow/sales/budz', icon: MessageSquare },
  { group: 'Grow', label: 'Sales · Budz · Leads', to: '/grow/sales/budz/leads', icon: Users },
  { group: 'Grow', label: 'Sales · Budz · Drafts', to: '/grow/sales/budz/drafts', icon: MessageSquare },
  { group: 'Grow', label: 'Sales · Budz · Sends', to: '/grow/sales/budz/sends', icon: Zap },
  { group: 'Grow', label: 'Ads Agent', to: '/grow/ads', icon: Megaphone },
  { group: 'Grow', label: 'Social Agent', to: '/grow/social', icon: Share2 },
  { group: 'Grow', label: 'UGC Agent', to: '/grow/ugc', icon: Film },
  { group: 'Grow', label: 'SEO Agent', to: '/grow/seo', icon: Search },
  { group: 'Grow', label: 'Voice / COD Agent', to: '/grow/voice', icon: PhoneCall },
  { group: 'Edge', label: 'Edge · Betting', to: '/edge', icon: Target },
  { group: 'Admin', label: 'Home', to: '/', icon: LayoutDashboard },
  { group: 'Admin', label: 'Customers', to: '/admin/customers', icon: Users },
  { group: 'Admin', label: 'Customers · Leads', to: '/admin/customers/leads', icon: Users },
  { group: 'Admin', label: 'Billing', to: '/billing', icon: CreditCard },
  { group: 'Admin', label: 'Infrastructure', to: '/infrastructure', icon: Server },
  { group: 'Admin', label: 'Control Centre', to: '/admin/control-centre', icon: LayoutGrid },
  { group: 'Admin', label: 'User Management', to: '/admin/users', icon: ShieldCheck },
  { group: 'Admin', label: 'Audit Logs', to: '/admin/audit-logs', icon: FileClock },
  { group: 'Admin', label: 'Settings', to: '/settings', icon: Settings },
]

const GROUPS = Array.from(new Set(COMMANDS.map((c) => c.group)))

interface Props { open: boolean; onClose: () => void }

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const go = (to: string) => { onClose(); navigate(to) }
  return (
    <CommandDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <CommandInput placeholder="Jump to…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        {GROUPS.map((group) => (
          <CommandGroup key={group} heading={group}>
            {COMMANDS.filter((c) => c.group === group).map((c) => (
              <CommandItem
                key={c.to}
                value={`${c.group} ${c.label}`}
                onSelect={() => go(c.to)}
              >
                <c.icon className="mr-2 h-4 w-4" />
                <span>{c.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
