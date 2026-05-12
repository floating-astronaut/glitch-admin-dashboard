import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import DashboardHome from './pages/DashboardHome'
import Billing from './pages/Billing'
import Infrastructure from './pages/Infrastructure'
import Settings from './pages/Settings'
import ControlCentre  from './pages/admin/ControlCentre'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs      from './pages/admin/AuditLogs'
import CustomersLayout from './pages/admin/customers/Layout'
import CustomersBuyers from './pages/admin/customers/Buyers'
import CustomersLeads  from './pages/admin/customers/Leads'
import BuyerDetail     from './pages/admin/customers/BuyerDetail'

// Trade vertical
import TradeOverview from './pages/trade/Overview'
import TradeBots from './pages/trade/Bots'
import TradeSignals from './pages/trade/Signals'
import TradeTrades from './pages/trade/Trades'
import TradeOracle from './pages/trade/Oracle'
import TradeNews from './pages/trade/News'

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

// Edge vertical
import EdgeOverview from './pages/edge/Overview'

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
          <Route index element={<DashboardHome />} />

          {/* Trade vertical */}
          <Route path="trade"          element={<TradeOverview />} />
          <Route path="trade/bots"     element={<TradeBots />} />
          <Route path="trade/signals"  element={<TradeSignals />} />
          <Route path="trade/trades"   element={<TradeTrades />} />
          <Route path="trade/oracle"   element={<TradeOracle />} />
          <Route path="trade/news"     element={<TradeNews />} />

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
          <Route path="grow/social"        element={<SocialAgentOverview />} />
          <Route path="grow/ugc"           element={<UgcAgentOverview />} />
          <Route path="grow/seo"           element={<SeoAgentOverview />} />
          <Route path="grow/voice"         element={<VoiceAgentOverview />} />

          {/* Legacy /grow/budz/* → /grow/sales/budz/* */}
          <Route path="grow/budz"         element={<Navigate to="/grow/sales/budz" replace />} />
          <Route path="grow/budz/leads"   element={<Navigate to="/grow/sales/budz/leads" replace />} />
          <Route path="grow/budz/drafts"  element={<Navigate to="/grow/sales/budz/drafts" replace />} />
          <Route path="grow/budz/sends"   element={<Navigate to="/grow/sales/budz/sends" replace />} />

          {/* Edge vertical */}
          <Route path="edge"              element={<EdgeOverview />} />
          <Route path="edge/betting"      element={<EdgeOverview />} />

          {/* Admin (cross-cutting) */}
          <Route path="admin/customers" element={<CustomersLayout />}>
            <Route index                          element={<CustomersBuyers />} />
            <Route path="leads"                   element={<CustomersLeads />} />
            <Route path="buyers/:paymentId"       element={<BuyerDetail />} />
          </Route>
          {/* Legacy /clients routes redirect to the new unified customers surface */}
          <Route path="clients"        element={<Navigate to="/admin/customers" replace />} />
          <Route path="clients/:id"    element={<Navigate to="/admin/customers" replace />} />
          <Route path="billing"        element={<Billing />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="admin/control-centre" element={<ControlCentre />} />
          <Route path="admin/users"          element={<UserManagement />} />
          <Route path="admin/audit-logs"     element={<AuditLogs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
