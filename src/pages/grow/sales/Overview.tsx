import { MessageSquare } from 'lucide-react'
import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function SalesAgentOverview() {
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
