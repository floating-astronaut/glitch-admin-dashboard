import { useNavigate } from 'react-router-dom'
import { Sprout, ArrowRight, Construction, Cannabis } from 'lucide-react'

const BUSINESSES = [
  {
    id: 'budz',
    name: 'Glitch Budz',
    tagline: 'Ontario cannabis retail outbound · sales-agent v1',
    icon: Cannabis,
    href: '/grow/budz',
    live: true,
  },
]

export default function GrowOverview() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Sprout size={14} className="text-accent" /> Grow
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESSES.map(b => (
          <button
            key={b.id}
            onClick={() => navigate(b.href)}
            disabled={!b.live}
            className={`text-left rounded-xl border bg-g-card p-5 group transition-all ${
              b.live
                ? 'border-g-border hover:border-accent/40 hover:bg-accent/5'
                : 'border-g-border opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <b.icon size={20} className="text-accent" />
              {b.live
                ? <ArrowRight size={14} className="text-g-dim group-hover:text-accent" />
                : <span className="text-[10px] text-g-dim uppercase">soon</span>}
            </div>
            <h3 className="text-base font-bold text-white mb-1">{b.name}</h3>
            <p className="text-xs text-g-muted">{b.tagline}</p>
          </button>
        ))}

        <div className="rounded-xl border border-dashed border-g-border bg-transparent p-5 flex flex-col items-center justify-center text-center text-g-muted">
          <Construction size={20} className="text-g-dim mb-2" />
          <span className="text-xs">More businesses to come</span>
        </div>
      </div>

      <div className="rounded-xl border border-g-border bg-g-card p-5">
        <h3 className="text-sm font-semibold text-white mb-2">HITL marketing-ops</h3>
        <p className="text-xs text-g-muted leading-relaxed">
          Approval queues for emails, posts, ads, and replies currently flow through
          Discord/Telegram. The dashboard surface for those will live under each
          business — see <strong>Glitch Budz → Drafts</strong> for the current
          email-draft approval queue.
        </p>
      </div>
    </div>
  )
}
