import { useQuery } from '@tanstack/react-query'
import { Cannabis } from 'lucide-react'
import AgentShell, { AgentTab } from '../../../../components/grow/AgentShell'
import { budzStats } from '../../../../api/grow'

const BASE = '/grow/sales/budz'

export default function BudzLayout() {
  // Pull stats once at the layout level so the pending badge can render
  // in the tab row regardless of which sub-tab is active.
  const { data: stats } = useQuery({
    queryKey: ['grow:budz:stats'],
    queryFn: budzStats,
    refetchInterval: 30_000,
  })

  const pending = stats?.drafts_pending ?? 0

  const tabs: AgentTab[] = [
    { label: 'Overview',                                                         to: BASE, end: true },
    { label: 'Leads',                                                            to: `${BASE}/leads` },
    { label: pending > 0 ? `Drafts (${pending})` : 'Drafts',                     to: `${BASE}/drafts` },
    { label: 'Sends',                                                            to: `${BASE}/sends` },
  ]

  return (
    <AgentShell
      icon={Cannabis}
      name="Glitch Budz"
      tagline="Sales Agent · Ontario cannabis retail outbound · v1"
      status="healthy"
      tabs={tabs}
    />
  )
}
