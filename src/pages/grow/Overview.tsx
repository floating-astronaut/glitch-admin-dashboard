import { useNavigate } from 'react-router-dom'
import {
  Sprout, MessageSquare, Megaphone, Share2, Film, Search, PhoneCall, ArrowRight,
} from 'lucide-react'
import Section from '../../components/ui/Section'
import StatusBadge from '../../components/ui/StatusBadge'

type AgentStatus = 'healthy' | 'degraded' | 'stale' | 'offline' | 'coming_soon'

interface AgentCard {
  id: string
  name: string
  tagline: string
  icon: any
  href: string
  status: AgentStatus
  deployments: number
  pendingApprovals?: number
  outputs7d?: number
}

const AGENTS: AgentCard[] = [
  {
    id: 'sales',
    name: 'Sales Agent',
    tagline: 'Outbound B2B sequences · HITL drafts',
    icon: MessageSquare,
    href: '/grow/sales',
    status: 'healthy',
    deployments: 1,
  },
  {
    id: 'ads',
    name: 'Ads Agent',
    tagline: 'Meta / Google / TikTok paid acquisition',
    icon: Megaphone,
    href: '/grow/ads',
    status: 'coming_soon',
    deployments: 0,
  },
  {
    id: 'social',
    name: 'Social Agent',
    tagline: 'LinkedIn / X / IG / TikTok cadence',
    icon: Share2,
    href: '/grow/social',
    status: 'coming_soon',
    deployments: 0,
  },
  {
    id: 'ugc',
    name: 'UGC Agent',
    tagline: 'AI-generated short-form video',
    icon: Film,
    href: '/grow/ugc',
    status: 'coming_soon',
    deployments: 0,
  },
  {
    id: 'seo',
    name: 'SEO Agent',
    tagline: 'Keywords · programmatic · AEO/LLMO',
    icon: Search,
    href: '/grow/seo',
    status: 'coming_soon',
    deployments: 0,
  },
  {
    id: 'voice',
    name: 'Voice / COD Agent',
    tagline: 'Outbound calls · COD confirmations',
    icon: PhoneCall,
    href: '/grow/voice',
    status: 'coming_soon',
    deployments: 0,
  },
]

export default function GrowOverview() {
  const navigate = useNavigate()

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
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => navigate(a.href)}
              className="text-left rounded-xl border bg-g-card p-4 group transition-all border-g-border hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <a.icon size={18} />
                </div>
                <ArrowRight size={14} className="text-g-dim group-hover:text-accent" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">{a.name}</h3>
                <StatusBadge value={a.status} dot />
              </div>
              <p className="text-xs text-g-muted">{a.tagline}</p>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-g-dim font-mono">
                <span>{a.deployments} deployment{a.deployments === 1 ? '' : 's'}</span>
                {a.pendingApprovals != null && <span>· {a.pendingApprovals} pending</span>}
                {a.outputs7d != null && <span>· {a.outputs7d}/7d</span>}
              </div>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
