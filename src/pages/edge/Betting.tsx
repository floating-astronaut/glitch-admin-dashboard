/**
 * Edge › Betting — accounts, open bets, strategies, EV signals.
 *
 * Preview shell. The data this page will surface already exists on
 * edge-api but lives behind per-user JWT auth:
 *
 *   GET /v1/bets                  open + recent bets for the user
 *   GET /v1/bets/summary/me       per-user roll-up
 *   GET /v1/strategies            user's active strategies
 *   GET /v1/markets/ev-signals    EV signals
 *   GET /v1/me/cloudbet/balance   Cloudbet bankroll
 *
 * The admin dashboard authenticates against admin-api (its own JWT),
 * not edge-api. Surfacing these reads from here requires an admin /
 * operator API on edge-api (e.g. /v1/admin/bets?user=...). When that
 * lands, the KPI cards below populate the same way Trade · Revenue
 * does today.
 */
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Target, Activity, Zap, DollarSign,
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Card from '../../components/ui/Surface'
import Section from '../../components/ui/Section'
import EmptyState from '../../components/ui/EmptyState'

export default function EdgeBetting() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/edge"
          className="inline-flex items-center gap-1.5 text-xs text-g-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={12} /> Edge · Platform
        </Link>
        <div className="mt-2 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Target size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Edge — Betting</h1>
            <p className="text-xs text-g-muted mt-0.5">
              Cloudbet accounts, open bets, active strategies, and EV signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Open bets"        value="—" icon={Target}     sub="needs edge-api /v1/admin/*" />
        <KpiCard label="Strategies live"  value="—" icon={Activity}   sub="—" />
        <KpiCard label="EV signals (24h)" value="—" icon={Zap}        sub="—" />
        <KpiCard label="Total bankroll"   value="—" icon={DollarSign} sub="—" />
      </div>

      <Section title="Open bets">
        <Card>
          <EmptyState
            icon={Target}
            title="No bet feed wired yet"
            description="Open and recently-settled bets, alongside per-strategy P&L, will list here once edge-api exposes an /v1/admin/* operator API. The customer-facing reads at /v1/bets already exist but are scoped to per-user JWTs."
          />
        </Card>
      </Section>

      <Section title="Strategies">
        <Card>
          <EmptyState
            icon={Activity}
            title="Strategy roll-up pending operator API"
            description="Active and paper-mode strategies across all Edge customers will list here. Strategy definitions live on edge-api at /v1/strategies (per-user)."
          />
        </Card>
      </Section>

      <Section title="EV signals">
        <Card>
          <EmptyState
            icon={Zap}
            title="No EV signals yet"
            description="Recently-generated EV signals from the worker tick. Edge-api exposes /v1/markets/ev-signals; wiring it from here waits for the operator API layer."
          />
        </Card>
      </Section>
    </div>
  )
}
