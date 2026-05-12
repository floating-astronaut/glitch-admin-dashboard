import AgentOverviewBody from '../../../components/grow/AgentOverviewBody'

export default function SeoAgentOverview() {
  return (
    <AgentOverviewBody
      description={
        <>
          The <strong className="text-white">SEO Agent</strong> handles keyword
          research, programmatic page generation, on-page audits, and AI-search
          (LLMO/AEO) optimisation per business.
        </>
      }
      emptyTitle="No SEO sites wired yet"
      emptyDescription="Add a site in Settings → Integrations to surface keyword tracking and audits."
    />
  )
}
