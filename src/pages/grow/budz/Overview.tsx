import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Cannabis, Mail, Inbox, Send, Eye, MessageSquare,
  ArrowRight, Users, Pause,
} from 'lucide-react'
import { budzStats, budzFunnel } from '../../../api/grow'
import KpiCard from '../../../components/ui/KpiCard'

export default function BudzOverview() {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['grow:budz:stats'],
    queryFn: budzStats,
    refetchInterval: 30_000,
  })
  const { data: funnel = [] } = useQuery({
    queryKey: ['grow:budz:funnel'],
    queryFn: budzFunnel,
    refetchInterval: 60_000,
  })

  const dim = (n: number | null | undefined) => isLoading ? '…' : (n ?? 0)

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Cannabis size={14} className="text-accent" /> Glitch Budz
      </h2>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Leads"
          value={dim(stats?.leads_total)}
          icon={Users}
          accent
          sub={`${stats?.leads_by_status?.scored ?? 0} scored · ${stats?.leads_by_status?.sent ?? 0} sent`}
        />
        <KpiCard
          label="Pending Approval"
          value={dim(stats?.drafts_pending)}
          icon={Inbox}
          sub={`${stats?.drafts_24h ?? 0} drafts in 24h`}
          trend={(stats?.drafts_pending ?? 0) > 0 ? 'up' : 'neutral'}
        />
        <KpiCard
          label="Sends (24h)"
          value={dim(stats?.sends_24h)}
          icon={Send}
          sub={`${stats?.sends_total ?? 0} total`}
        />
        <KpiCard
          label="Open / Reply"
          value={isLoading ? '…' : `${stats?.open_rate_pct ?? 0}% / ${stats?.reply_rate_pct ?? 0}%`}
          icon={Eye}
          sub={`${stats?.opens ?? 0} opens · ${stats?.replies ?? 0} replies`}
        />
      </div>

      {/* Email pipeline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Approved drafts"  value={dim(stats?.drafts_by_state?.approved)}  icon={Mail} />
        <KpiCard label="Superseded"        value={dim(stats?.drafts_by_state?.superseded)} icon={Pause} />
        <KpiCard label="Bounced"           value={dim(stats?.bounces)} icon={MessageSquare} />
        <KpiCard label="Unsubscribed"      value={dim(stats?.unsubs)}  icon={MessageSquare} />
      </div>

      {/* Funnel snapshot */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Funnel</h3>
        <div className="overflow-x-auto rounded-xl border border-g-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-g-border bg-g-deep">
                {['Status','Total','7D','24H'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funnel.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-g-muted">Funnel view empty</td></tr>
              )}
              {funnel.map(r => (
                <tr key={r.status} className="border-b border-g-border/50 hover:bg-white/2">
                  <td className="px-4 py-2 text-sm capitalize text-white font-medium">{r.status}</td>
                  <td className="px-4 py-2 text-sm text-accent font-bold">{r.lead_count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-g-text">{r.lead_count_7d.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-g-text">{r.lead_count_24h.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Leads',  to: '/grow/budz/leads',  icon: Users,
            sub: `${stats?.leads_total ?? 0} total` },
          { label: 'Drafts (HITL)', to: '/grow/budz/drafts', icon: Inbox,
            sub: `${stats?.drafts_pending ?? 0} pending approval` },
          { label: 'Sends', to: '/grow/budz/sends', icon: Send,
            sub: `${stats?.sends_total ?? 0} total` },
        ].map(({ label, to, icon: Icon, sub }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex items-center justify-between px-4 py-3 bg-g-card border border-g-border rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group"
          >
            <div className="flex items-center gap-3 text-sm text-g-text">
              <Icon size={16} className="text-g-muted group-hover:text-accent" />
              <div className="text-left">
                <div>{label}</div>
                <div className="text-[10px] text-g-dim">{sub}</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-g-dim group-hover:text-accent" />
          </button>
        ))}
      </div>
    </div>
  )
}
