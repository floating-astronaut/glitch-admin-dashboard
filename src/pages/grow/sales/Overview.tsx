import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary, budzStats } from '../../../api/grow'

export default function SalesAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })
  const { data: stats } = useQuery({
    queryKey: ['grow:budz:stats'],
    queryFn: budzStats,
    refetchInterval: 30_000,
  })

  const sales = agents?.agents.find(a => a.id === 'sales')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Sales Agent</strong> runs outbound B2B
          sequences — lead discovery, personalised drafts, send + reply handling,
          and HITL approval queues. Each deployment is a separate business with its
          own audience, brand voice, and CRM.
        </>
      }
      metrics={[
        { label: 'Status',            value: sales?.status ?? '—', icon: Activity },
        { label: 'Pending Approvals', value: sales?.pending_approvals ?? 0, sub: stats ? `${stats.drafts_24h ?? 0} drafts today` : '', icon: Clock },
        { label: 'Outputs (7d)',      value: sales?.outputs_7d ?? 0, sub: stats ? `${stats.sends_24h ?? 0} sent today` : '', icon: CheckCircle },
        { label: 'Deployments',       value: sales?.deployments ?? 0, icon: Layers },
      ]}
      deployments={[
        {
          id: 'budz',
          name: 'Glitch Budz',
          tagline: 'Ontario cannabis retail outbound · v1',
          href: '/grow/sales/budz',
          live: true,
        },
      ]}
    />
  )
}
