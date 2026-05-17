import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { customersBuyers, type Buyer, type BuyerProvider } from '../../../api/grow'
import DataTable, { Column } from '../../../components/ui/DataTable'
import StatusBadge from '../../../components/ui/StatusBadge'
import Card from '../../../components/ui/Surface'
import ErrorState from '../../../components/ui/ErrorState'
import clsx from 'clsx'

const SKUS = ['', 'BSK-002', 'BSK-003', 'BSK-004', 'BSK-005', 'BSK-006', 'BSK-007', 'BSK-ALL']
const PROVIDERS: ('' | BuyerProvider)[] = ['', 'stripe', 'razorpay']

function fmtMoney(minor: number, currency: 'USD' | 'INR') {
  const major = minor / 100
  const symbol = currency === 'INR' ? '₹' : '$'
  return `${symbol}${major.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function fulfillmentLabel(b: Buyer): { value: string; tone: 'ok' | 'pending' | 'failed' } {
  if (b.refunded_at) return { value: 'refunded', tone: 'failed' }
  if (b.fulfilled_at) return { value: 'fulfilled', tone: 'ok' }
  return { value: 'pending', tone: 'pending' }
}

export default function CustomersBuyers() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [sku, setSku] = useState(searchParams.get('sku') ?? '')
  const [provider, setProvider] = useState<'' | BuyerProvider>(
    (searchParams.get('provider') as BuyerProvider) ?? ''
  )
  const [email, setEmail] = useState(searchParams.get('email') ?? '')

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', 'buyers', { sku, provider, email }],
    queryFn: () => customersBuyers({
      sku: sku || undefined,
      provider: (provider || undefined) as BuyerProvider | undefined,
      email: email || undefined,
      limit: 200,
    }),
    refetchInterval: 60_000,
  })

  const columns: Column<Buyer>[] = [
    {
      key: 'created_at', label: 'Captured', render: b => b.created_at
        ? <span title={b.created_at}>{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}</span>
        : '—',
    },
    {
      key: 'sku', label: 'SKU', render: b => (
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
          {b.sku}
        </span>
      ),
    },
    { key: 'provider', label: 'Provider', render: b => <span className="text-xs uppercase text-g-muted">{b.provider}</span> },
    {
      key: 'amount_minor', label: 'Amount', render: b => (
        <span className="text-sm font-mono text-white">{fmtMoney(b.amount_minor, b.currency)}</span>
      ),
    },
    { key: 'buyer_name', label: 'Name', render: b => b.buyer_name || <span className="text-g-dim">—</span> },
    { key: 'email', label: 'Email', render: b => <span className="font-mono text-xs text-g-text">{b.email}</span> },
    {
      key: 'github_username', label: 'Codeberg', render: b => b.github_username
        ? <span className="font-mono text-xs text-g-muted">@{b.github_username}</span>
        : <span className="text-g-dim text-xs">not linked</span>,
    },
    {
      key: 'fulfillment', label: 'Status', render: b => {
        const f = fulfillmentLabel(b)
        return <StatusBadge value={f.value === 'fulfilled' ? 'healthy' : f.value === 'refunded' ? 'offline' : 'pending'} dot />
      },
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3">
        <input
          placeholder="email contains…"
          value={email}
          onChange={e => { setEmail(e.target.value); updateParam('email', e.target.value) }}
          className="bg-g-deep border border-g-border rounded-md px-2 py-1 text-xs text-white placeholder:text-g-dim outline-none focus:border-accent/40 min-w-[200px]"
        />
        <select
          value={sku}
          onChange={e => { setSku(e.target.value); updateParam('sku', e.target.value) }}
          className="bg-g-deep border border-g-border rounded-md px-2 py-1 text-xs text-white outline-none"
        >
          {SKUS.map(s => <option key={s} value={s}>{s || 'All SKUs'}</option>)}
        </select>
        <select
          value={provider}
          onChange={e => { setProvider(e.target.value as any); updateParam('provider', e.target.value) }}
          className="bg-g-deep border border-g-border rounded-md px-2 py-1 text-xs text-white outline-none"
        >
          {PROVIDERS.map(p => <option key={p} value={p}>{p || 'All providers'}</option>)}
        </select>
        <span className="text-[10px] text-g-dim font-mono ml-auto">
          {data ? `${data.count} buyer${data.count === 1 ? '' : 's'}` : '—'}
        </span>
      </Card>

      {isError ? (
        <ErrorState
          title="Couldn't load buyers"
          description="The customers proxy returned an error. If you just set up the dashboard, confirm GROW_FULFILL_SECRET is wired on admin_api."
          onRetry={() => refetch()}
        />
      ) : (
        <div className={clsx('transition-opacity', isLoading && 'opacity-50')}>
          <DataTable
            columns={columns}
            data={data?.buyers ?? []}
            loading={isLoading}
            emptyText="No buyers match these filters"
            dateField="created_at"
            onRowClick={(b: Buyer) => navigate(`/system/customers/buyers/${encodeURIComponent(b.payment_id)}`)}
          />
        </div>
      )}
    </div>
  )
}
