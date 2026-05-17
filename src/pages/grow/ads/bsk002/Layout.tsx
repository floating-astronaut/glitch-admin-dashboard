import { Megaphone } from 'lucide-react'
import AgentShell, { AgentTab } from '../../../../components/grow/AgentShell'

const BASE = '/grow/ads/bsk002'

const tabs: AgentTab[] = [
  { label: 'Overview',  to: BASE, end: true },
  { label: 'Campaigns', to: `${BASE}/campaigns` },
  { label: 'Creatives', to: `${BASE}/creatives` },
  { label: 'Reports',   to: `${BASE}/reports` },
]

export default function AdsBsk002Layout() {
  return (
    <AgentShell
      icon={Megaphone}
      name="Ads Agent · BSK-002"
      tagline="Shopify D2C India wedge · preview shell (customers onboard via GROW-WEDGE-1)"
      status="coming_soon"
      tabs={tabs}
    />
  )
}
