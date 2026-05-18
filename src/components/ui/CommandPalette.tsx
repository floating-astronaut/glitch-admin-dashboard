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
  LayoutDashboard, Sprout, Target, Users, CreditCard, Server,
  LayoutGrid, ShieldCheck, FileClock, Network, Settings,
} from 'lucide-react'

interface Cmd {
  label: string
  to: string
  group: string
  icon: any
}

const COMMANDS: Cmd[] = [
  { group: 'Trade',  label: 'Trade · Business',     to: '/trade',               icon: LayoutDashboard },
  { group: 'Trade',  label: 'Trade · Revenue',      to: '/trade/revenue',       icon: LayoutDashboard },
  { group: 'Trade',  label: 'Trade · Users',        to: '/trade/users',         icon: Users },
  { group: 'Trade',  label: 'Trade · Subscriptions',to: '/trade/subscriptions', icon: CreditCard },
  { group: 'Trade',  label: 'Trade · Billing',      to: '/trade/billing',       icon: CreditCard },
  { group: 'Grow',   label: 'Grow · Overview',      to: '/grow',                icon: Sprout },
  { group: 'Grow',   label: 'Grow · Customers',     to: '/grow/customers',      icon: Users },
  { group: 'Grow',   label: 'Grow · Customers · Leads', to: '/grow/customers/leads', icon: Users },
  { group: 'Grow',   label: 'Grow · Users',         to: '/grow/users',          icon: Users },
  { group: 'Grow',   label: 'Grow · Billing',       to: '/grow/billing',        icon: CreditCard },
  { group: 'Edge',   label: 'Edge · Platform',      to: '/edge',                icon: LayoutDashboard },
  { group: 'Edge',   label: 'Edge · Betting',       to: '/edge/betting',        icon: Target },
  { group: 'Edge',   label: 'Edge · Users',         to: '/edge/users',          icon: Users },
  { group: 'Edge',   label: 'Edge · Billing',       to: '/edge/billing',        icon: CreditCard },
  { group: 'System', label: 'Today',                to: '/',                    icon: LayoutDashboard },
  { group: 'System', label: 'Infrastructure',       to: '/system/infrastructure', icon: Server },
  { group: 'System', label: 'Server Map',           to: '/system/server-map',     icon: Network },
  { group: 'System', label: 'Control Centre',       to: '/system/control-centre', icon: LayoutGrid },
  { group: 'System', label: 'User Management',      to: '/system/users',        icon: ShieldCheck },
  { group: 'System', label: 'Audit Logs',           to: '/system/audit-logs',   icon: FileClock },
  { group: 'System', label: 'Settings',             to: '/system/settings',     icon: Settings },
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
