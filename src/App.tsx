import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
// `/` is the System › Today overview per docs/ADMIN_IA.md §1. The
// pre-app-era `DashboardHome.tsx` was retired in ADMIN-1c — it
// mixed Trade engine KPIs, customer counts, and MRR into a single
// landing card grid, which violated the ownership boundary in the
// IA's appendix invariants. `system/Today.tsx` replaces it.
import Today from './pages/system/Today'
import Billing         from './pages/system/Billing'
import Infrastructure  from './pages/system/Infrastructure'
import Settings        from './pages/system/Settings'
import ControlCentre   from './pages/system/ControlCentre'
import UserManagement  from './pages/system/UserManagement'
import AuditLogs       from './pages/system/AuditLogs'
import CustomersLayout from './pages/system/customers/Layout'
import CustomersBuyers from './pages/system/customers/Buyers'
import CustomersLeads  from './pages/system/customers/Leads'
import BuyerDetail     from './pages/system/customers/BuyerDetail'

// Trade vertical
//   * Trade · Business — Revenue / Users / Subscriptions. Read from
//     trade-api /v1/admin/* (next ship). Shown to all admins.
//   * Trade · Engine (personal) — legacy Bots / Signals / Trades / Oracle
//     / News. Proprietary engine internals; gated to OPERATOR_EMAIL via
//     <TejasOnly>. Sidebar also hides the links for non-Tejas users.
import { TejasOnly } from './components/TejasOnly'
import TradeOverview from './pages/trade/Overview'
import TradeBots from './pages/trade/Bots'
import TradeSignals from './pages/trade/Signals'
import TradeTrades from './pages/trade/Trades'
import TradeOracle from './pages/trade/Oracle'
import TradeNews from './pages/trade/News'
// Trade · Business pages (placeholders until /v1/admin/* lands)
import TradeRevenue from './pages/trade/Revenue'
import TradeUsers from './pages/trade/Users'
import TradeSubscriptions from './pages/trade/Subscriptions'

// Grow vertical
import GrowOverview from './pages/grow/Overview'
import SalesAgentOverview from './pages/grow/sales/Overview'
import AdsAgentOverview from './pages/grow/ads/Overview'
import SocialAgentOverview from './pages/grow/social/Overview'
import UgcAgentOverview from './pages/grow/ugc/Overview'
import SeoAgentOverview from './pages/grow/seo/Overview'
import VoiceAgentOverview from './pages/grow/voice/Overview'
import BudzLayout   from './pages/grow/sales/budz/Layout'
import BudzOverview from './pages/grow/sales/budz/Overview'
import BudzLeads    from './pages/grow/sales/budz/Leads'
import BudzDrafts   from './pages/grow/sales/budz/Drafts'
import BudzSends    from './pages/grow/sales/budz/Sends'
// Ads · BSK-002 deployment shell (active Phase-1 commercial wedge:
// Shopify D2C India). Preview surface — customer-level data lands
// once the ads-agent operator API ships.
import AdsBsk002Layout    from './pages/grow/ads/bsk002/Layout'
import AdsBsk002Overview  from './pages/grow/ads/bsk002/Overview'
import AdsBsk002Campaigns from './pages/grow/ads/bsk002/Campaigns'
import AdsBsk002Creatives from './pages/grow/ads/bsk002/Creatives'
import AdsBsk002Reports   from './pages/grow/ads/bsk002/Reports'

// Edge vertical — split into Overview (platform health, /edge) and
// Betting (accounts/positions/signals, /edge/betting) per ADMIN-1e.
import EdgeOverview from './pages/edge/Overview'
import EdgeBetting  from './pages/edge/Betting'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
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

          {/* Trade · Engine (personal) — proprietary engine internals,
              locked to OPERATOR_EMAIL via <TejasOnly>. Sidebar hides
              the links for everyone else. /trade/engine is the
              operator path for the engine cockpit (renamed from the
              misleading "/trade/legacy" in ADMIN-1g — the surface is
              the *current* engine, not a deprecated one). The old
              /trade/legacy URL keeps working via the redirect below. */}
          <Route path="trade/engine"   element={<TejasOnly><TradeOverview /></TejasOnly>} />
          <Route path="trade/legacy"   element={<Navigate to="/trade/engine" replace />} />
          <Route path="trade/bots"     element={<TejasOnly><TradeBots /></TejasOnly>} />
          <Route path="trade/signals"  element={<TejasOnly><TradeSignals /></TejasOnly>} />
          <Route path="trade/trades"   element={<TejasOnly><TradeTrades /></TejasOnly>} />
          <Route path="trade/oracle"   element={<TejasOnly><TradeOracle /></TejasOnly>} />
          <Route path="trade/news"     element={<TejasOnly><TradeNews /></TejasOnly>} />

          {/* Grow vertical */}
          <Route path="grow"               element={<GrowOverview />} />
          <Route path="grow/sales"         element={<SalesAgentOverview />} />
          <Route path="grow/sales/budz" element={<BudzLayout />}>
            <Route index           element={<BudzOverview />} />
            <Route path="leads"    element={<BudzLeads />} />
            <Route path="drafts"   element={<BudzDrafts />} />
            <Route path="sends"    element={<BudzSends />} />
          </Route>
          <Route path="grow/ads"           element={<AdsAgentOverview />} />
          <Route path="grow/ads/bsk002" element={<AdsBsk002Layout />}>
            <Route index             element={<AdsBsk002Overview />} />
            <Route path="campaigns"  element={<AdsBsk002Campaigns />} />
            <Route path="creatives"  element={<AdsBsk002Creatives />} />
            <Route path="reports"    element={<AdsBsk002Reports />} />
          </Route>
          <Route path="grow/social"        element={<SocialAgentOverview />} />
          <Route path="grow/ugc"           element={<UgcAgentOverview />} />
          <Route path="grow/seo"           element={<SeoAgentOverview />} />
          <Route path="grow/voice"         element={<VoiceAgentOverview />} />

          {/* Legacy /grow/budz/* → /grow/sales/budz/* */}
          <Route path="grow/budz"         element={<Navigate to="/grow/sales/budz" replace />} />
          <Route path="grow/budz/leads"   element={<Navigate to="/grow/sales/budz/leads" replace />} />
          <Route path="grow/budz/drafts"  element={<Navigate to="/grow/sales/budz/drafts" replace />} />
          <Route path="grow/budz/sends"   element={<Navigate to="/grow/sales/budz/sends" replace />} />

          {/* Edge vertical — /edge is the platform overview, /edge/betting
              is the betting accounts / positions / signals surface. */}
          <Route path="edge"              element={<EdgeOverview />} />
          <Route path="edge/betting"      element={<EdgeBetting />} />

          {/* System (cross-cutting). Renamed from "Admin" per ADMIN_IA §1. */}
          <Route path="system/customers" element={<CustomersLayout />}>
            <Route index                          element={<CustomersBuyers />} />
            <Route path="leads"                   element={<CustomersLeads />} />
            <Route path="buyers/:paymentId"       element={<BuyerDetail />} />
          </Route>
          <Route path="system/billing"         element={<Billing />} />
          <Route path="system/infrastructure"  element={<Infrastructure />} />
          <Route path="system/settings"        element={<Settings />} />
          <Route path="system/control-centre"  element={<ControlCentre />} />
          <Route path="system/users"           element={<UserManagement />} />
          <Route path="system/audit-logs"      element={<AuditLogs />} />

          {/* Legacy redirects — preserve nav from bookmarks / external links. */}
          <Route path="clients"               element={<Navigate to="/system/customers" replace />} />
          <Route path="clients/:id"           element={<Navigate to="/system/customers" replace />} />
          <Route path="billing"               element={<Navigate to="/system/billing" replace />} />
          <Route path="infrastructure"        element={<Navigate to="/system/infrastructure" replace />} />
          <Route path="settings"              element={<Navigate to="/system/settings" replace />} />
          <Route path="admin/customers"       element={<Navigate to="/system/customers" replace />} />
          <Route path="admin/customers/leads" element={<Navigate to="/system/customers/leads" replace />} />
          <Route path="admin/control-centre"  element={<Navigate to="/system/control-centre" replace />} />
          <Route path="admin/users"           element={<Navigate to="/system/users" replace />} />
          <Route path="admin/audit-logs"      element={<Navigate to="/system/audit-logs" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
