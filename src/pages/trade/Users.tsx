/**
 * /trade/users — operator-side user list for Glitch Trade.
 *
 * Data: GET /api/trade-admin/users (admin_api proxy → trade-api
 * /v1/admin/users). Server-side pagination + email substring search.
 * Row click → user detail (next ship — for now, no-op).
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Search } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import Section from '../../components/ui/Section'
import DataTable, { Column } from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { getTradeUsers, getTradeMetrics, type TradeUserRow } from '../../api/tradeAdmin'

const TIER_LABEL: Record<string, string> = {
  pro: 'Pro',
  'pro-plus': 'Pro+',
  'pro-quant': 'Pro Quant',
}

export default function TradeUsers() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 50

  const metricsQ = useQuery({ queryKey: ['tradeAdmin', 'metrics'], queryFn: getTradeMetrics, refetchInterval: 60_000 })
  const usersQ = useQuery({
    queryKey: ['tradeAdmin', 'users', { q, page, pageSize }],
    queryFn: () => getTradeUsers({ q, limit: pageSize, offset: page * pageSize }),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  })

  const m = metricsQ.data
  const totalPages = usersQ.data ? Math.max(1, Math.ceil(usersQ.data.total / pageSize)) : 1

  const cols: Column<TradeUserRow>[] = [
    { key: 'email', label: 'Email' },
    {
      key: 'tier',
      label: 'Plan',
      render: r => r.tier
        ? <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{TIER_LABEL[r.tier] || r.tier}</span>
        : <span className="text-xs text-g-muted">Free</span>,
    },
    {
      key: 'sub_status',
      label: 'Status',
      render: r => r.sub_status
        ? <StatusBadge value={r.sub_status} dot />
        : <span className="text-xs text-g-muted">—</span>,
    },
    { key: 'connected_accounts', label: 'Accounts', render: r => r.connected_accounts },
    { key: 'saved_replays', label: 'Replays', render: r => r.saved_replays },
    {
      key: 'last_seen_at',
      label: 'Last seen',
      render: r => r.last_seen_at
        ? formatDistanceToNow(new Date(r.last_seen_at), { addSuffix: true })
        : '—',
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: r => formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Trade · Users</h1>
        <p className="text-sm text-muted-foreground">
          Every signed-up user on trade.glitchexecutor.com — subscription state, connected
          accounts, saved replays, last seen. Reads from <code className="font-mono text-xs">/v1/admin/users</code> on trade-api.
        </p>
      </header>

      <Section title="At a glance">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total users" value={m?.total_users ?? '—'} sub="all-time signups" icon={Users} loading={metricsQ.isLoading} />
          <KpiCard label="Paid" value={m?.paid_users ?? '—'} sub="active or trialing" icon={Users} loading={metricsQ.isLoading} />
          <KpiCard label="Free" value={m?.free_users ?? '—'} sub="signed up, never subscribed" icon={Users} loading={metricsQ.isLoading} />
          <KpiCard label="Active subs" value={m?.active_subscriptions ?? '—'} sub="all paying statuses" icon={Users} loading={metricsQ.isLoading} />
        </div>
      </Section>

      <Section
        title="Users"
        action={
          <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm">
            <Search className="h-3.5 w-3.5 text-g-muted" />
            <input
              type="text"
              placeholder="Search by email"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(0) }}
              className="bg-transparent outline-none w-48 text-xs"
            />
          </div>
        }
      >
        <DataTable
          columns={cols}
          data={usersQ.data?.users ?? []}
          loading={usersQ.isLoading}
          emptyText={q ? `No users match "${q}"` : 'No users yet'}
        />
        {usersQ.data && usersQ.data.total > pageSize && (
          <div className="mt-3 flex items-center justify-between text-xs text-g-muted">
            <span>{usersQ.data.total} total · page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border border-g-border disabled:opacity-30"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >Prev</button>
              <button
                className="px-3 py-1 rounded border border-g-border disabled:opacity-30"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next</button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}
