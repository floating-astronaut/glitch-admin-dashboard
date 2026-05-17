import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary } from '../../../api/grow'

export default function VoiceAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const voice = agents?.agents.find(a => a.id === 'voice')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Voice / COD Agent</strong> handles
          outbound calls, inbound triage, and Cash-on-Delivery confirmation flows
          with human supervision and call review.
        </>
      }
      metrics={[
        { label: 'Status',            value: voice?.status ?? 'coming_soon', icon: Activity },
        { label: 'Pending Approvals', value: voice?.pending_approvals ?? 0,  icon: Clock },
        { label: 'Outputs (7d)',      value: voice?.outputs_7d ?? 0,         icon: CheckCircle },
        { label: 'Deployments',       value: voice?.deployments ?? 0,        icon: Layers },
      ]}
      emptyTitle="No voice flows wired yet"
      emptyDescription="Connect a telephony provider in Settings → Integrations to surface call queues and recordings."
    />
  )
}
