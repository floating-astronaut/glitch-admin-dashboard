import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary } from '../../../api/grow'

export default function UgcAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const ugc = agents?.agents.find(a => a.id === 'ugc')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">UGC Agent</strong> generates short-form
          creator-style videos and product demos from prompts and brand assets,
          ready for Ads or Social distribution.
        </>
      }
      metrics={[
        { label: 'Status',            value: ugc?.status ?? 'coming_soon', icon: Activity },
        { label: 'Pending Approvals', value: ugc?.pending_approvals ?? 0,  icon: Clock },
        { label: 'Outputs (7d)',      value: ugc?.outputs_7d ?? 0,         icon: CheckCircle },
        { label: 'Deployments',       value: ugc?.deployments ?? 0,        icon: Layers },
      ]}
      emptyTitle="No UGC pipelines wired yet"
      emptyDescription="Connect Higgsfield / Seedance and define a brand profile to surface generated outputs here."
    />
  )
}
