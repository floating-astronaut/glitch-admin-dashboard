import { ReactNode } from 'react'
import { Activity, CheckCircle, Clock, Layers, LucideIcon } from 'lucide-react'
import Card from '../ui/Surface'
import Section from '../ui/Section'
import EmptyState from '../ui/EmptyState'
import KpiCard from '../ui/KpiCard'

export interface AgentMetric {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
}

export interface AgentDeployment {
  id: string
  name: string
  tagline?: string
  href: string
  live: boolean
}

interface Props {
  description?: ReactNode
  metrics?: AgentMetric[]
  deployments?: AgentDeployment[]
  /** When set, renders an empty/EmptyState body instead of the deployment grid. */
  emptyTitle?: string
  emptyDescription?: string
  children?: ReactNode
}

const DEFAULT_METRICS: AgentMetric[] = [
  { label: 'Health',           value: '—', icon: Activity },
  { label: 'Active Jobs',      value: 0,   icon: Layers },
  { label: 'Pending Approvals',value: 0,   icon: Clock },
  { label: 'Outputs (7d)',     value: 0,   icon: CheckCircle },
]

export default function AgentOverviewBody({
  description, metrics, deployments, emptyTitle, emptyDescription, children,
}: Props) {
  const m = metrics && metrics.length ? metrics : DEFAULT_METRICS
  return (
    <div className="space-y-6">
      {description && (
        <Card><p className="text-xs text-g-muted leading-relaxed">{description}</p></Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {m.map(k => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} icon={k.icon} />
        ))}
      </div>

      <Section title="Deployments">
        {deployments && deployments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployments.map(d => (
              <a
                key={d.id}
                href={d.href}
                className={`block rounded-xl border p-4 transition-all bg-g-card ${
                  d.live
                    ? 'border-g-border hover:border-accent/40 hover:bg-accent/5'
                    : 'border-g-border opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{d.name}</span>
                  <span className="text-[10px] text-g-dim uppercase">
                    {d.live ? 'live' : 'soon'}
                  </span>
                </div>
                {d.tagline && <p className="text-xs text-g-muted">{d.tagline}</p>}
              </a>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              title={emptyTitle ?? 'No deployments yet'}
              description={emptyDescription ?? 'When this agent has live businesses or campaigns wired up, they will appear here.'}
            />
          </Card>
        )}
      </Section>

      {children}
    </div>
  )
}
