import { NavLink, Outlet } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '../ui/StatusBadge'

export type AgentStatus = 'healthy' | 'degraded' | 'stale' | 'offline' | 'coming_soon'

export interface AgentTab {
  label: string
  to: string
  end?: boolean
}

interface Props {
  icon: LucideIcon
  name: string
  tagline?: string
  status?: AgentStatus
  tabs: AgentTab[]
}

export default function AgentShell({ icon: Icon, name, tagline, status, tabs }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-semibold text-white">{name}</h1>
            {status && <StatusBadge value={status} dot />}
          </div>
          {tagline && <p className="text-xs text-g-muted mt-0.5">{tagline}</p>}
        </div>
      </div>

      <div className="border-b border-g-border flex items-center gap-1 overflow-x-auto">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => clsx(
              'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-g-muted hover:text-g-text'
            )}
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
