/**
 * Edge › Overview — platform health + operational entry point.
 *
 * Per docs/ADMIN_IA.md §5 ADMIN-1e: /edge becomes the Overview
 * (platform health, env, deeper-surface links), /edge/betting becomes
 * the Betting accounts/positions surface.
 *
 * Data sources (read-only):
 *   - edge-api /healthz  (unauthed; via the CF Pages proxy at /api/edge)
 *   - edge-api /readyz   (unauthed; verifies DB connectivity)
 *
 * Out of scope for ADMIN-1e: bet history, signals, wallet balances,
 * worker tick state — those require an operator API on edge-api that
 * doesn't exist yet. Surfaced as honest placeholders on /edge/betting.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowRight, Database, Server, Target,
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import Card from '../../components/ui/Surface'
import { edgeHealthz, edgeReadyz } from '../../api/edge'

export default function EdgeOverview() {
  const health = useQuery({
    queryKey: ['edge:healthz'],
    queryFn: edgeHealthz,
    refetchInterval: 30_000,
    retry: 1,
  })
  const ready = useQuery({
    queryKey: ['edge:readyz'],
    queryFn: edgeReadyz,
    refetchInterval: 30_000,
    retry: 1,
  })

  const apiReachable = health.isSuccess
  const dbReachable  = ready.isSuccess && ready.data?.ok === true
  const env          = health.data?.env

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Target size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Edge — Platform</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Cloudbet automation platform (<code className="font-mono">glitch-edge-api</code>).
            Operator view of service health and reachability. Betting accounts,
            signals, and bet history live on the dedicated{' '}
            <Link to="/edge/betting" className="text-accent hover:underline">Betting</Link>{' '}
            surface.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="API"
          value={health.isLoading ? '…' : apiReachable ? 'reachable' : 'unreachable'}
          icon={Server}
          accent={apiReachable}
          sub={health.isError ? 'GET /healthz failed' : health.data?.service ?? '—'}
          trend={apiReachable ? 'up' : 'down'}
        />
        <KpiCard
          label="Database"
          value={ready.isLoading ? '…' : dbReachable ? 'up' : 'down'}
          icon={Database}
          accent={dbReachable}
          sub={ready.isError ? 'GET /readyz failed' : ready.data?.db ?? '—'}
          trend={dbReachable ? 'up' : 'down'}
        />
        <KpiCard
          label="Environment"
          value={env ?? '—'}
          icon={Activity}
        />
        <KpiCard
          label="Open Bets"
          value="—"
          icon={Target}
          sub="needs operator API"
        />
      </div>

      {(health.isError || ready.isError) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-yellow-200">edge-api unreachable from this dashboard.</p>
            <p className="mt-1 text-yellow-300/80">
              The Pages Function proxy at <code className="font-mono">/api/edge/*</code> couldn't
              reach <code className="font-mono">edge-app.glitchexecutor.com</code>. Check the
              service: <code className="font-mono">systemctl status glitch-edge-api</code>.
            </p>
          </div>
        </div>
      )}

      <Section title="Deeper surfaces">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/edge/betting"
            className="group flex items-start justify-between gap-3 rounded-xl border border-g-border bg-g-card p-4 transition-all hover:border-accent/30 hover:bg-accent/5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-g-dim">
                <Target size={12} className="text-g-muted group-hover:text-accent" />
                Edge › Betting
              </div>
              <div className="mt-1 text-sm font-semibold text-white">Betting accounts</div>
              <p className="mt-1 text-xs text-g-muted">
                Cloudbet accounts, open bets, strategies, and EV signals. Reads
                land once the operator API ships on edge-api.
              </p>
            </div>
            <ArrowRight size={14} className="text-g-dim shrink-0 mt-1 group-hover:text-accent" />
          </Link>
        </div>
      </Section>

      <Card>
        <p className="text-[11px] text-g-muted leading-relaxed">
          This Overview is the operator's read-only platform-health view. Per-user
          surfaces — strategies, wallets, audit log — live in the customer-facing
          app at <code className="font-mono">edge-app.glitchexecutor.com</code> and
          require an edge-api JWT. They will surface here only after an admin
          /v1/admin/* layer lands on edge-api.
        </p>
      </Card>
    </div>
  )
}
