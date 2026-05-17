import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Users } from 'lucide-react'
import clsx from 'clsx'

const VERTICALS = [
  { id: 'grow',  label: 'Grow',  to: '/system/customers',         enabled: true },
  { id: 'edge',  label: 'Edge',  to: '/system/customers/edge',    enabled: false },
  { id: 'trade', label: 'Trade', to: '/system/customers/trade',   enabled: false },
] as const

export default function CustomersLayout() {
  const { pathname } = useLocation()

  // Sub-tabs (Buyers / Leads) only render on the Grow vertical.
  const onGrow = !pathname.startsWith('/system/customers/edge') &&
                 !pathname.startsWith('/system/customers/trade')

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
          <Users size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white">Customers</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Paid buyers + free-kit leads across every business vertical. Edge
            and Trade customer sources will merge in as they come online.
          </p>
        </div>
      </div>

      <div className="border-b border-g-border flex items-center gap-1">
        {VERTICALS.map(v => (
          v.enabled ? (
            <NavLink
              key={v.id}
              to={v.to}
              end={v.id === 'grow'}
              className={({ isActive }) => clsx(
                'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                isActive ? 'border-accent text-accent'
                         : 'border-transparent text-g-muted hover:text-g-text'
              )}
            >
              {v.label}
            </NavLink>
          ) : (
            <span
              key={v.id}
              title="Not wired yet"
              className="px-3 py-2 text-xs font-medium border-b-2 -mb-px border-transparent text-g-dim cursor-not-allowed"
            >
              {v.label}
              <span className="ml-1.5 text-[9px] uppercase text-g-dim">soon</span>
            </span>
          )
        ))}
      </div>

      {onGrow && (
        <div className="flex items-center gap-1 text-xs">
          <NavLink
            to="/system/customers"
            end
            className={({ isActive }) => clsx(
              'px-2.5 py-1 rounded-md transition-colors',
              isActive ? 'bg-accent/10 text-accent' : 'text-g-muted hover:text-g-text'
            )}
          >
            Buyers
          </NavLink>
          <NavLink
            to="/system/customers/leads"
            className={({ isActive }) => clsx(
              'px-2.5 py-1 rounded-md transition-colors',
              isActive ? 'bg-accent/10 text-accent' : 'text-g-muted hover:text-g-text'
            )}
          >
            Leads
          </NavLink>
        </div>
      )}

      <Outlet />
    </div>
  )
}
