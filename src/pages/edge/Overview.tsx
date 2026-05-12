import { Target } from 'lucide-react'
import Card from '../../components/ui/Card'
import Section from '../../components/ui/Section'
import EmptyState from '../../components/ui/EmptyState'
import KpiCard from '../../components/ui/KpiCard'
import { Activity, TrendingUp, BarChart3, DollarSign } from 'lucide-react'

export default function EdgeOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Target size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Edge — AI Betting</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Sports and market betting models, signal generation, and bankroll
            management. Separate engine from Trade — different brokers, different
            risk profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Bankroll" value="—" icon={DollarSign} />
        <KpiCard label="Open Bets" value={0} icon={Activity} />
        <KpiCard label="ROI (30d)" value="—" icon={TrendingUp} />
        <KpiCard label="Signals (24h)" value={0} icon={BarChart3} />
      </div>

      <Section title="Models">
        <Card>
          <EmptyState
            title="No Edge models deployed yet"
            description="Wire an Edge engine via Settings → Integrations to surface live signals, open bets, and historical ROI."
          />
        </Card>
      </Section>
    </div>
  )
}
