import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function VoiceAgentOverview() {
  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Voice / COD Agent</strong> handles
          outbound calls, inbound triage, and Cash-on-Delivery confirmation flows
          with human supervision and call review.
        </>
      }
      emptyTitle="No voice flows wired yet"
      emptyDescription="Connect a telephony provider in Settings → Integrations to surface call queues and recordings."
    />
  )
}
