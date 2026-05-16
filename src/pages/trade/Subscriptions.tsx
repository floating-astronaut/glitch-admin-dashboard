/**
 * /trade/subscriptions — operator-side subscription state browser.
 *
 * Keyed by subscription, not by user. Lets the operator answer
 * "who's past_due", "who's about to renew", "who cancelled".
 *
 * Data: GET /api/trade-admin/subscriptions (admin_api proxy →
 * trade-api /v1/admin/subscriptions). Status filter is a query
 * param so we can drop into a specific state from a deep link.
 */
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, AlertTriangle, Calendar, XCircle, ExternalLink } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import DataTable, { Column } from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDistanceToNow, format } from 'date-fns'
import { getTradeSubscriptions, type TradeSubscriptionRow } from '../../api/tradeAdmin'

const TIER_LABEL: Record<string, string> = {
  pro: 'Pro',
  'pro-plus': 'Pro+',
  'pro-quant': 'Pro Quant',
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past due' },
  { value: 'canceled', label: 'Cancelled' },
]

export default function TradeSubscriptions() {
  const [status, setStatus] = useState('')

  // For KPIs we pull the unfiltered set once (capped at 1000) and bucket
  // client-side — cheaper than 4 queries and avoids touching trade-api
  // for every filter tab click.
  const allQ = useQuery({
    queryKey: ['tradeAdmin', 'subs', 'all'],
    queryFn: () => getTradeSubscriptions({ limit: 1000 }),
    refetchInterval: 60_000,
  })
  const filteredQ = useQuery({
    queryKey: ['tradeAdmin', 'subs', { status }],
    queryFn: () => getTradeSubscriptions({ status: status || undefined, limit: 1000 }),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
    enabled: !!status, // unfiltered case reuses allQ below
  })

  const list = status ? filteredQ.data?.subscriptions ?? [] : allQ.data?.subscriptions ?? []
  const total = status ? filteredQ.data?.total ?? 0 : allQ.data?.total ?? 0

  const kpis = useMemo(() => {
    const subs = allQ.data?.subscriptions ?? []
    const thirtyDaysAgo = Date.now() - 30 * 86_400_000
    return {
      active: subs.filter(s => s.status === 'active' || s.status === 'trialing').length,
      past_due: subs.filter(s => s.status === 'past_due').length,
      cancel_pending: subs.filter(s => s.cancel_at_period_end && s.status !== 'canceled').length,
      cancelled_30d: subs.filter(s => s.status === 'canceled' && new Date(s.updated_at).getTime() >= thirtyDaysAgo).length,
    }
  }, [allQ.data])

  const cols: Column<TradeSubscriptionRow>[] = [
    { key: 'user_email', label: 'User' },
    {
      key: 'sku',
      label: 'Plan',
      render: r => <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{TIER_LABEL[r.sku] || r.sku}</span>,
    },
    { key: 'status', label: 'Status', render: r => <StatusBadge value={r.status} dot /> },
    {
      key: 'current_period_end',
      label: 'Renews',
      render: r => r.current_period_end
        ? <span title={format(new Date(r.current_period_end), 'PPpp')}>
            {formatDistanceToNow(new Date(r.current_period_end), { addSuffix: true })}
          </span>
        : '—',
    },
    {
      key: 'cancel_at_period_end',
      label: 'Cancel?',
      render: r => r.cancel_at_period_end
        ? <span className="text-xs text-yellow-300">at period end</span>
        : <span className="text-xs text-g-muted">—</span>,
    },
    {
      key: 'stripe_subscription_id',
      label: 'Stripe',
      render: r => (
        <a
          href={`https://dashboard.stripe.com/subscriptions/${r.stripe_subscription_id}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          open <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Every subscription row in the trade-api <code className="font-mono text-xs">subscriptions</code> table —
          one entry per Stripe subscription, including cancelled ones.
          Reads from <code className="font-mono text-xs">/v1/admin/subscriptions</code>.
        </p>
      </header>

      <Section title="State">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active" value={kpis.active} sub="status = active | trialing" icon={CreditCard} loading={allQ.isLoading} />
          <KpiCard label="Past due" value={kpis.past_due} sub="payment failed, in dunning" icon={AlertTriangle} loading={allQ.isLoading} />
          <KpiCard label="Cancel pending" value={kpis.cancel_pending} sub="cancel_at_period_end = true" icon={Calendar} loading={allQ.isLoading} />
          <KpiCard label="Cancelled (30d)" value={kpis.cancelled_30d} sub="hard-cancelled last 30 days" icon={XCircle} loading={allQ.isLoading} />
        </div>
      </Section>

      <Section
        title="Subscription list"
        action={
          <div className="flex items-center gap-1 rounded-md border border-g-border bg-card p-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value || 'all'}
                onClick={() => setStatus(f.value)}
                className={`px-2 py-1 text-xs rounded ${
                  status === f.value ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <DataTable
          columns={cols}
          data={list}
          loading={status ? filteredQ.isLoading : allQ.isLoading}
          emptyText={status ? `No ${status} subscriptions` : 'No subscriptions yet'}
        />
        <div className="mt-2 text-xs text-g-muted">
          Showing {list.length} of {total}
        </div>
      </Section>
    </div>
  )
}
