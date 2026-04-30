import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import DashboardHome from './pages/DashboardHome'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Billing from './pages/Billing'
import Infrastructure from './pages/Infrastructure'
import Settings from './pages/Settings'
import ControlCentre  from './pages/admin/ControlCentre'
import UserManagement from './pages/admin/UserManagement'

// Trade vertical
import TradeOverview from './pages/trade/Overview'
import TradeBots from './pages/trade/Bots'
import TradeSignals from './pages/trade/Signals'
import TradeTrades from './pages/trade/Trades'
import TradeOracle from './pages/trade/Oracle'
import TradeNews from './pages/trade/News'

// Grow vertical
import GrowOverview from './pages/grow/Overview'
import BudzOverview from './pages/grow/budz/Overview'
import BudzLeads    from './pages/grow/budz/Leads'
import BudzDrafts   from './pages/grow/budz/Drafts'
import BudzSends    from './pages/grow/budz/Sends'

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
          <Route path="grow"              element={<GrowOverview />} />
          <Route path="grow/budz"         element={<BudzOverview />} />
          <Route path="grow/budz/leads"   element={<BudzLeads />} />
          <Route path="grow/budz/drafts"  element={<BudzDrafts />} />
          <Route path="grow/budz/sends"   element={<BudzSends />} />

          {/* Admin (cross-cutting) */}
          <Route path="clients"        element={<Clients />} />
          <Route path="clients/:id"    element={<ClientDetail />} />
          <Route path="billing"        element={<Billing />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="admin/control-centre" element={<ControlCentre />} />
          <Route path="admin/users"          element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
