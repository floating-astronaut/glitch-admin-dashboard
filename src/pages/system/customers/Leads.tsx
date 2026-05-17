/**
 * System › Customers › Leads — Vibe Kit lead aggregate.
 *
 * Wires to admin_api `GET /api/customers/leads` which proxies to
 * `/api/grow/leads` on the payment-server. Source per
 * docs/customer-mgmt-design.md: Google Sheet "kit-leads" tab merged
 * with the Resend "kit-leads" audience. Field shape is loose (no
 * fixed contract yet), so the renderer is defensive — common fields
 * (email / name / created_at / source / status) are picked when
 * present, anything else falls back to a JSON cell.
 *
 * Note: the GROW-WEDGE-1 leads (core.leads on glitch_brain via
 * grow-dashboard) are a separate, newer lead pipeline and are not
 * yet merged in here. That merge is its own follow-up lane.
 */
import { useQuery } from '@tanstack/react-query'
import { MailQuestion, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { customersLeads } from '../../../api/grow'
import Card from '../../../components/ui/Surface'
import ErrorState from '../../../components/ui/ErrorState'
import EmptyState from '../../../components/ui/EmptyState'
import DataTable, { Column } from '../../../components/ui/DataTable'

interface LeadRow {
  email?: string
  name?: string
  source?: string
  status?: string
  created_at?: string
  [k: string]: any
}

function tryDate(v: any): string | undefined {
  if (!v) return undefined
  const d = new Date(v)
  return isNaN(d.valueOf()) ? undefined : d.toISOString()
}

function pickCreatedAt(r: LeadRow): string | undefined {
  return tryDate(r.created_at) ?? tryDate(r.captured_at) ?? tryDate(r.signed_up_at) ?? tryDate(r.timestamp)
}

export default function CustomersLeads() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', 'leads'],
    queryFn: customersLeads,
    refetchInterval: 60_000,
  })

  const leads: LeadRow[] = data?.leads ?? []
  const count = data?.count ?? leads.length

  const columns: Column<LeadRow>[] = [
    {
      key: 'created_at',
      label: 'Captured',
      render: r => {
        const t = pickCreatedAt(r)
        return t
          ? <span title={t} className="text-xs text-g-muted whitespace-nowrap">
              {formatDistanceToNow(new Date(t), { addSuffix: true })}
            </span>
          : <span className="text-g-dim text-xs">—</span>
      },
    },
    {
      key: 'email',
      label: 'Email',
      render: r => r.email
        ? <span className="font-mono text-xs text-g-text">{r.email}</span>
        : <span className="text-g-dim text-xs">—</span>,
    },
    {
      key: 'name',
      label: 'Name',
      render: r => r.name ?? r.full_name ?? r.first_name ?? <span className="text-g-dim text-xs">—</span>,
    },
    {
      key: 'source',
      label: 'Source',
      render: r => r.source
        ? <span className="text-[11px] uppercase text-g-muted">{r.source}</span>
        : <span className="text-g-dim text-xs">—</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: r => r.status
        ? <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-g-text border border-g-border">
            {r.status}
          </span>
        : <span className="text-g-dim text-xs">—</span>,
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3">
        <p className="text-xs text-g-muted flex-1">
          Vibe Kit leads — Google Sheet <code className="font-mono">kit-leads</code> merged
          with the Resend <code className="font-mono">kit-leads</code> audience. Click into
          a row for the lead profile (deferred — see <code className="font-mono">customer-mgmt-design.md</code>).
        </p>
        <span className="text-[10px] text-g-dim font-mono">
          {data ? `${count} lead${count === 1 ? '' : 's'}` : '—'}
        </span>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-g-border text-g-muted hover:text-accent hover:border-accent/30 transition-colors"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </Card>

      {isError ? (
        <ErrorState
          title="Couldn't load leads"
          description="admin_api proxy to /api/grow/leads returned an error. Confirm the upstream is wired on the payment-server."
          onRetry={() => refetch()}
        />
      ) : leads.length === 0 && !isLoading ? (
        <Card>
          <EmptyState
            icon={MailQuestion}
            title="No leads yet"
            description="No Vibe Kit signups have landed in the aggregate. Once the Google Sheet + Resend audience start populating, rows will surface here."
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={leads}
          loading={isLoading}
          emptyText="No leads"
        />
      )}
    </div>
  )
}
