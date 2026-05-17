import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth'
import { useWebSocket } from '@/hooks/useWebSocket'
import AppSidebar from './AppSidebar'
import ThemeSwitch from '@/components/ThemeSwitch'
import CommandPalette from '@/components/ui/CommandPalette'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/':                'System · Today',
  '/trade':           'Trade · Overview',
  '/trade/engine':    'Trade · Engine',
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
  '/grow/ads/bsk002':               'Grow · Ads · BSK-002',
  '/grow/ads/bsk002/campaigns':     'Grow · Ads · BSK-002 · Campaigns',
  '/grow/ads/bsk002/creatives':     'Grow · Ads · BSK-002 · Creatives',
  '/grow/ads/bsk002/reports':       'Grow · Ads · BSK-002 · Reports',
  '/grow/social':                   'Grow · Social Agent',
  '/grow/ugc':                      'Grow · UGC Agent',
  '/grow/seo':                      'Grow · SEO Agent',
  '/grow/voice':                    'Grow · Voice / COD Agent',
  '/edge':            'Edge · Platform',
  '/edge/betting':    'Edge · Betting',
  '/system/customers':       'System · Customers',
  '/system/customers/leads': 'System · Customers · Leads',
  '/system/billing':         'System · Billing',
  '/system/infrastructure':  'System · Infrastructure',
  '/system/settings':        'System · Settings',
  '/system/control-centre':  'System · Control Centre',
  '/system/users':           'System · User Management',
  '/system/audit-logs':      'System · Audit Logs',
}

export default function Layout() {
  const { pathname } = useLocation()
  const { token } = useAuthStore()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useWebSocket()
  useEffect(() => { void token }, [token])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const exact = PAGE_TITLES[pathname]
  const base = '/' + pathname.split('/')[1]
  const title = exact || PAGE_TITLES[base] || 'Admin'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex h-8 gap-2 text-muted-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Jump to…</span>
              <kbd className="ml-1 hidden md:inline-flex rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </Button>
            <ThemeSwitch />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </SidebarProvider>
  )
}
