import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, CheckCircle, Layers } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'
import { growAgentsSummary } from '../../../api/grow'

export default function SeoAgentOverview() {
  const { data: agents } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const seo = agents?.agents.find(a => a.id === 'seo')

  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">SEO Agent</strong> handles keyword
          research, programmatic page generation, on-page audits, and AI-search
          (LLMO/AEO) optimisation per business.
        </>
      }
      metrics={[
        { label: 'Status',            value: seo?.status ?? 'coming_soon', icon: Activity },
        { label: 'Pending Approvals', value: seo?.pending_approvals ?? 0,  icon: Clock },
        { label: 'Outputs (7d)',      value: seo?.outputs_7d ?? 0,         icon: CheckCircle },
        { label: 'Deployments',       value: seo?.deployments ?? 0,        icon: Layers },
      ]}
      emptyTitle="No SEO sites wired yet"
      emptyDescription="Add a site in Settings → Integrations to surface keyword tracking and audits."
    />
  )
}
