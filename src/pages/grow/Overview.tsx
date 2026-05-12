import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Sprout, MessageSquare, Megaphone, Share2, Film, Search, PhoneCall, ArrowRight,
} from 'lucide-react'
import Section from '../../components/ui/Section'
import StatusBadge from '../../components/ui/StatusBadge'
import { growAgentsSummary, type GrowAgentId, type GrowAgentSummary } from '../../api/grow'

const AGENT_META: Record<GrowAgentId, { icon: any; tagline: string; href: string }> = {
  sales: {
    icon: MessageSquare,
    tagline: 'Outbound B2B sequences · HITL drafts',
    href: '/grow/sales',
  },
  ads: {
    icon: Megaphone,
    tagline: 'Meta / Google / TikTok paid acquisition',
    href: '/grow/ads',
  },
  social: {
    icon: Share2,
    tagline: 'LinkedIn / X / IG / TikTok cadence',
    href: '/grow/social',
  },
  ugc: {
    icon: Film,
    tagline: 'AI-generated short-form video',
    href: '/grow/ugc',
  },
  seo: {
    icon: Search,
    tagline: 'Keywords · programmatic · AEO/LLMO',
    href: '/grow/seo',
  },
  voice: {
    icon: PhoneCall,
    tagline: 'Outbound calls · COD confirmations',
    href: '/grow/voice',
  },
}

export default function GrowOverview() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['grow:agents:summary'],
    queryFn: growAgentsSummary,
    refetchInterval: 30_000,
  })

  const agents: GrowAgentSummary[] = data?.agents ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sprout size={14} className="text-accent" /> Grow — Marketing Control Plane
        </h2>
        <p className="text-xs text-g-muted mt-1">
          Six specialised agents handle outbound, paid, organic, and conversational
          marketing across all businesses. Each agent runs one or more deployments.
        </p>
      </div>

      <Section title="Agents">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isLoading ? Object.keys(AGENT_META) as GrowAgentId[] : agents.map(a => a.id)).map(id => {
            const meta = AGENT_META[id]
            const a = agents.find(x => x.id === id)
            const Icon = meta?.icon ?? Sprout
            return (
              <button
                key={id}
                onClick={() => meta && navigate(meta.href)}
                className="text-left rounded-xl border bg-g-card p-4 group transition-all border-g-border hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={14} className="text-g-dim group-hover:text-accent" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{a?.name ?? id}</h3>
                  {a && <StatusBadge value={a.status} dot />}
                </div>
                <p className="text-xs text-g-muted">{meta?.tagline}</p>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-g-dim font-mono">
                  <span>{a?.deployments ?? 0} deployment{(a?.deployments ?? 0) === 1 ? '' : 's'}</span>
                  {a && a.pending_approvals > 0 && (
                    <span className="text-yellow-300">· {a.pending_approvals} pending</span>
                  )}
                  {a && a.outputs_7d > 0 && (
                    <span>· {a.outputs_7d}/7d</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
