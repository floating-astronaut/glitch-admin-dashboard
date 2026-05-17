/**
 * Grow › Customers — paid buyers + lead aggregate for the Grow vertical.
 *
 * Relocated from /system/customers in ADMIN-RELOC-1 per the v1.1
 * ownership rule (customer data lives under the owning vertical).
 * Edge customer accounts and Trade subscribers live under their own
 * verticals; they do NOT tab in here. Earlier "Grow / Edge / Trade"
 * vertical tabs at this layer were removed for the same reason.
 */
import { NavLink, Outlet } from 'react-router-dom'
import { Users } from 'lucide-react'
import clsx from 'clsx'

export default function CustomersLayout() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
          <Users size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white">Grow · Customers</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Paid buyers + free-kit leads for the Grow vertical. Trade
            subscribers live under <code className="font-mono">/trade/*</code>;
            Edge accounts under <code className="font-mono">/edge/*</code>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs">
        <NavLink
          to="/grow/customers"
          end
          className={({ isActive }) => clsx(
            'px-2.5 py-1 rounded-md transition-colors',
            isActive ? 'bg-accent/10 text-accent' : 'text-g-muted hover:text-g-text'
          )}
        >
          Buyers
        </NavLink>
        <NavLink
          to="/grow/customers/leads"
          className={({ isActive }) => clsx(
            'px-2.5 py-1 rounded-md transition-colors',
            isActive ? 'bg-accent/10 text-accent' : 'text-g-muted hover:text-g-text'
          )}
        >
          Leads
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}
