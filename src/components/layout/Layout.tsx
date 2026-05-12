import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuthStore } from '../../stores/auth'
import { useWebSocket } from '../../hooks/useWebSocket'

const PAGE_TITLES: Record<string, string> = {
  '/':                'Admin Home',
  '/trade':           'Trade · Overview',
  '/trade/bots':      'Trade · Bots',
  '/trade/signals':   'Trade · Signals',
  '/trade/trades':    'Trade · Trades',
  '/trade/oracle':    'Trade · Oracle',
  '/trade/news':      'Trade · News',
  '/grow':                          'Grow · Command Center',
  '/grow/sales':                    'Grow · Sales Agent',
  '/grow/sales/budz':               'Grow · Sales · Glitch Budz',
  '/grow/sales/budz/leads':         'Grow · Sales · Budz · Leads',
  '/grow/sales/budz/drafts':        'Grow · Sales · Budz · Drafts',
  '/grow/sales/budz/sends':         'Grow · Sales · Budz · Sends',
  '/grow/ads':                      'Grow · Ads Agent',
  '/grow/social':                   'Grow · Social Agent',
  '/grow/ugc':                      'Grow · UGC Agent',
  '/grow/seo':                      'Grow · SEO Agent',
  '/grow/voice':                    'Grow · Voice / COD Agent',
  '/edge':            'Edge · Betting',
  '/clients':         'Customers',
  '/billing':         'Billing',
  '/infrastructure':  'Infrastructure',
  '/settings':        'Settings',
  '/admin/control-centre': 'Admin · Control Centre',
  '/admin/users':          'Admin · User Management',
  '/admin/audit-logs':     'Admin · Audit Logs',
}

export default function Layout() {
  const { pathname } = useLocation()
  const { token } = useAuthStore()
  // Mount the WS hook for live invalidations (no-op if no token).
  useWebSocket()

  useEffect(() => { void token /* dependency anchor for hook lifecycle */ }, [token])

  const exact = PAGE_TITLES[pathname]
  const base = '/' + pathname.split('/')[1]
  const title = exact || PAGE_TITLES[base] || 'Admin'

  return (
    <div className="flex h-screen bg-g-bg overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
