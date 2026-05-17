import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary } from '../../../api/grow'

export default function AdsAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const ads = agents?.agents.find(a => a.id === 'ads')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Ads Agent</strong> runs paid acquisition
          across Meta, Google, and TikTok — creative iteration, audience testing,
          and budget allocation per campaign. Active commercial wedge:{' '}
          <strong className="text-white">Shopify D2C India (BSK-002)</strong>.
        </>
      }
      metrics={[
        { label: 'Status',            value: ads?.status ?? 'coming_soon', icon: Activity },
        { label: 'Pending Approvals', value: ads?.pending_approvals ?? 0,  icon: Clock },
        { label: 'Outputs (7d)',      value: ads?.outputs_7d ?? 0,         icon: CheckCircle },
        { label: 'Deployments',       value: ads?.deployments ?? 0,        icon: Layers },
      ]}
      deployments={[
        {
          id: 'bsk002',
          name: 'Ads Agent · BSK-002',
          tagline: 'Shopify D2C India wedge · preview shell (customer onboarding via GROW-WEDGE-1)',
          href: '/grow/ads/bsk002',
          live: true,
        },
      ]}
    />
  )
}
