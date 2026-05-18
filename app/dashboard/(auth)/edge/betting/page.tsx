/**
 * /dashboard/edge/betting — preview shell.
 *
 * Cloudbet accounts, open bets, strategies, EV signals. Data exists
 * on edge-api but lives behind per-user JWT auth:
 *   GET /v1/bets / /v1/bets/summary/me / /v1/strategies /
 *   /v1/markets/ev-signals / /v1/me/cloudbet/balance
 *
 * The admin dashboard auths against admin-api (its own JWT), not
 * edge-api. Surfacing these reads here needs an admin /v1/admin/*
 * layer on edge-api (cross-repo).
 */
import Link from 'next/link'
import { Activity, ArrowLeft, DollarSign, Target, Zap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function EdgeBettingPage() {
  return (
    <div className="space-y-4 p-(--content-padding)">
      <div>
        <Link
          href="/dashboard/edge"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs transition-colors">
          <ArrowLeft className="size-3" /> Edge · Platform
        </Link>
        <div className="mt-2 flex items-start gap-3">
          <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
            <Target className="size-4" />
          </div>
          <div>
            <h1 className="text-foreground text-base font-semibold">Edge — Betting</h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Cloudbet accounts, open bets, active strategies, and EV signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Open bets', icon: Target, sub: 'needs edge-api /v1/admin/*' },
          { label: 'Strategies live', icon: Activity, sub: '—' },
          { label: 'EV signals (24h)', icon: Zap, sub: '—' },
          { label: 'Total bankroll', icon: DollarSign, sub: '—' },
        ].map((k) => (
          <Card key={k.label} className="border-dashed">
            <CardContent className="space-y-1.5 py-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
                <k.icon className="size-3" />
                {k.label}
              </div>
              <div className="text-muted-foreground/70 text-[11px]">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-xs">
          <Target className="mx-auto mb-2 size-5" />
          <p className="font-medium">No bet feed wired yet</p>
          <p className="mx-auto mt-1 max-w-md">
            Open and recently-settled bets, alongside per-strategy P&amp;L, will list here once
            edge-api exposes an <code className="font-mono">/v1/admin/*</code> operator API. The
            customer-facing reads at <code className="font-mono">/v1/bets</code> already exist but
            are scoped to per-user JWTs.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
