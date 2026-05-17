import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary } from '../../../api/grow'

export default function SocialAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const social = agents?.agents.find(a => a.id === 'social')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Social Media Agent</strong> ideates,
          drafts, schedules, and posts across LinkedIn / X / Instagram / TikTok
          on a defined brand cadence with HITL approval.
        </>
      }
      metrics={[
        { label: 'Status',            value: social?.status ?? 'coming_soon', icon: Activity },
        { label: 'Pending Approvals', value: social?.pending_approvals ?? 0,  icon: Clock },
        { label: 'Outputs (7d)',      value: social?.outputs_7d ?? 0,         icon: CheckCircle },
        { label: 'Deployments',       value: social?.deployments ?? 0,        icon: Layers },
      ]}
      emptyTitle="No social channels wired yet"
      emptyDescription="Connect a channel in Settings → Integrations to surface scheduled posts and approvals."
    />
  )
}
