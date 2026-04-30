import { Sprout, Construction } from 'lucide-react'

export default function GrowOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Sprout size={14} className="text-accent" /> Grow
      </h2>
      <div className="rounded-2xl border border-g-border bg-g-card p-12 text-center space-y-3">
        <Construction className="mx-auto text-accent/60" size={48} />
        <h3 className="text-lg font-semibold text-white">Grow vertical — coming soon</h3>
        <p className="text-sm text-g-muted max-w-md mx-auto">
          HITL approval queue (Telegram/Discord), per-business sections (glitch-budz first),
          campaign controls, lead funnels.
        </p>
      </div>
    </div>
  )
}
