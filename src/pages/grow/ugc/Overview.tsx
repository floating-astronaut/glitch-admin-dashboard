import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function UgcAgentOverview() {
  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">UGC Agent</strong> generates short-form
          creator-style videos and product demos from prompts and brand assets,
          ready for Ads or Social distribution.
        </>
      }
      emptyTitle="No UGC pipelines wired yet"
      emptyDescription="Connect Higgsfield / Seedance and define a brand profile to surface generated outputs here."
    />
  )
}
