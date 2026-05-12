import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function AdsAgentOverview() {
  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">Ads Agent</strong> manages paid acquisition
          across Meta, Google, and TikTok — creative iteration, audience tests,
          and budget allocation per campaign.
        </>
      }
      emptyTitle="No campaigns wired yet"
      emptyDescription="Connect an ad account in Settings → Integrations to surface live campaigns."
    />
  )
}
