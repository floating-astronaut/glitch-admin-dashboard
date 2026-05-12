import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function SocialAgentOverview() {
  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Social Media Agent</strong> ideates,
          drafts, schedules, and posts across LinkedIn / X / Instagram / TikTok
          on a defined brand cadence with HITL approval.
        </>
      }
      emptyTitle="No social channels wired yet"
      emptyDescription="Connect a channel in Settings → Integrations to surface scheduled posts and approvals."
    />
  )
}
