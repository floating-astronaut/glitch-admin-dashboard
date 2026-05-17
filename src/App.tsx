import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
// `/` is the System › Today overview per docs/ADMIN_IA.md §1. The
// pre-app-era `DashboardHome.tsx` was retired in ADMIN-1c — it
// mixed Trade engine KPIs, customer counts, and MRR into a single
// landing card grid, which violated the ownership boundary in the
// IA's appendix invariants. `system/Today.tsx` replaces it.
import Today from './pages/system/Today'
import Infrastructure  from './pages/system/Infrastructure'
import Settings        from './pages/system/Settings'
import ControlCentre   from './pages/system/ControlCentre'
import UserManagement  from './pages/system/UserManagement'
import AuditLogs       from './pages/system/AuditLogs'
// Customers + Billing relocated under their owning verticals in
// ADMIN-RELOC-1 per the v1.1 ownership rule. /system/* paths
// redirect below; bookmarks survive.
import CustomersLayout from './pages/grow/customers/Layout'
import CustomersBuyers from './pages/grow/customers/Buyers'
import CustomersLeads  from './pages/grow/customers/Leads'
import BuyerDetail     from './pages/grow/customers/BuyerDetail'

// Trade vertical — Trade · Business only (Revenue / Users /
// Subscriptions / Billing). Engine internals (Bots / Signals / Trades
// / Oracle / News / engine cockpit) are NOT part of the admin
// dashboard per the v1.4 IA — they live elsewhere.
import TradeRevenue       from './pages/trade/Revenue'
import TradeUsers         from './pages/trade/Users'
import TradeSubscriptions from './pages/trade/Subscriptions'
import TradeBilling       from './pages/trade/Billing'

// Grow vertical — business-operator surfaces only (Overview / Customers
// / Users / Billing). Per-agent shells (Sales / Ads / Social / UGC /
// SEO / Voice) are NOT part of the admin dashboard per the v1.4 IA.
import GrowOverview from './pages/grow/Overview'
import GrowUsers    from './pages/grow/Users'
import GrowBilling  from './pages/grow/Billing'

// Edge vertical — split into Overview (platform health, /edge) and
// Betting (accounts/positions/signals, /edge/betting) per ADMIN-1e.
// Users + Billing are SHELLS-1 preview surfaces.
import EdgeOverview from './pages/edge/Overview'
import EdgeBetting  from './pages/edge/Betting'
import EdgeUsers    from './pages/edge/Users'
import EdgeBilling  from './pages/edge/Billing'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  const location = useLocation()
  if (!token) {
    // Preserve the deep link so Login can restore it post-sign-in.
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Today />} />

          {/* Trade · Business — open to all admins. Backed by /v1/admin/*
              on trade-api (next ship). */}
          <Route path="trade"                element={<Navigate to="/trade/revenue" replace />} />
          <Route path="trade/revenue"        element={<TradeRevenue />} />
          <Route path="trade/users"          element={<TradeUsers />} />
          <Route path="trade/subscriptions"  element={<TradeSubscriptions />} />
          <Route path="trade/billing"        element={<TradeBilling />} />

          {/* Grow vertical — business-operator surfaces only per v1.4 IA. */}
          <Route path="grow"            element={<GrowOverview />} />
          <Route path="grow/customers" element={<CustomersLayout />}>
            <Route index                    element={<CustomersBuyers />} />
            <Route path="leads"             element={<CustomersLeads />} />
            <Route path="buyers/:paymentId" element={<BuyerDetail />} />
          </Route>
          <Route path="grow/users"   element={<GrowUsers />} />
          <Route path="grow/billing" element={<GrowBilling />} />

          {/* Edge vertical — /edge is the platform overview, /edge/betting
              is the betting accounts / positions / signals surface.
              /edge/users + /edge/billing are SHELLS-1 preview surfaces. */}
          <Route path="edge"              element={<EdgeOverview />} />
          <Route path="edge/betting"      element={<EdgeBetting />} />
          <Route path="edge/users"        element={<EdgeUsers />} />
          <Route path="edge/billing"      element={<EdgeBilling />} />

          {/* System (cross-cutting). Renamed from "Admin" per ADMIN_IA §1.
              Customers + Billing relocated to their owning verticals in
              ADMIN-RELOC-1; legacy redirects below preserve bookmarks. */}
          <Route path="system/infrastructure"  element={<Infrastructure />} />
          <Route path="system/settings"        element={<Settings />} />
          <Route path="system/control-centre"  element={<ControlCentre />} />
          <Route path="system/users"           element={<UserManagement />} />
          <Route path="system/audit-logs"      element={<AuditLogs />} />

          {/* RELOC-1 legacy redirects — Customers + Billing moved out. */}
          <Route path="system/customers"                 element={<Navigate to="/grow/customers"       replace />} />
          <Route path="system/customers/leads"           element={<Navigate to="/grow/customers/leads" replace />} />
          <Route path="system/customers/buyers/:paymentId" element={<Navigate to="/grow/customers"     replace />} />
          <Route path="system/billing"                   element={<Navigate to="/trade/billing"        replace />} />

          {/* Legacy redirects — preserve nav from bookmarks / external links.
              Customers + Billing redirects target the new RELOC-1 locations. */}
          <Route path="clients"               element={<Navigate to="/grow/customers" replace />} />
          <Route path="clients/:id"           element={<Navigate to="/grow/customers" replace />} />
          <Route path="billing"               element={<Navigate to="/trade/billing" replace />} />
          <Route path="infrastructure"        element={<Navigate to="/system/infrastructure" replace />} />
          <Route path="settings"              element={<Navigate to="/system/settings" replace />} />
          <Route path="admin/customers"       element={<Navigate to="/grow/customers" replace />} />
          <Route path="admin/customers/leads" element={<Navigate to="/grow/customers/leads" replace />} />
          <Route path="admin/control-centre"  element={<Navigate to="/system/control-centre" replace />} />
          <Route path="admin/users"           element={<Navigate to="/system/users" replace />} />
          <Route path="admin/audit-logs"      element={<Navigate to="/system/audit-logs" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
