/**
 * System › Audit Logs — append-only record of administrative actions.
 *
 * Wires to admin_api `GET /api/settings/audit` which returns
 * `{ total, page, limit, entries[] }` from the `audit_log` table joined
 * to `admin_users` for the actor email.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileClock, RefreshCw } from 'lucide-react'
import { formatDistanceToNow, format as fmtDate } from 'date-fns'
import { getAuditLog } from '../../api/endpoints'
import Card from '../../components/ui/Surface'
import Section from '../../components/ui/Section'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import DataTable, { Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { TableToolbar, Pagination } from '../../components/ui/TableToolbar'

interface AuditEntry {
  id: number
  admin_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: any
  ip_address: string | null
  created_at: string
}

interface AuditPage {
  total: number
  page: number
  limit: number
  entries: AuditEntry[]
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <span className="w-28 shrink-0 text-g-muted uppercase tracking-wide text-[10px] pt-0.5">{label}</span>
      <span className="flex-1 text-g-text break-words">{children}</span>
    </div>
  )
}

export default function AuditLogs() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const { data, isLoading, isError, refetch } = useQuery<AuditPage>({
    queryKey: ['audit-log', page, limit, dateFrom, dateTo],
    queryFn: () => getAuditLog(page, limit, dateFrom || undefined, dateTo || undefined),
    refetchInterval: 60_000,
  })

  const columns: Column<AuditEntry>[] = [
    {
      key: 'created_at',
      label: 'Time',
      render: e => (
        <span title={e.created_at} className="text-xs text-g-muted whitespace-nowrap">
          {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'admin_email',
      label: 'Actor',
      render: e => e.admin_email
        ? <span className="font-mono text-xs text-g-text">{e.admin_email}</span>
        : <span className="text-g-dim text-xs">system</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: e => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
          {e.action}
        </span>
      ),
    },
    {
      key: 'target',
      label: 'Target',
      render: e => {
        if (!e.target_type) return <span className="text-g-dim text-xs">—</span>
        return (
          <span className="text-xs font-mono text-g-text">
            {e.target_type}
            {e.target_id ? ` · ${e.target_id}` : ''}
          </span>
        )
      },
    },
    {
      key: 'details',
      label: 'Details',
      render: e => {
        if (!e.details || (typeof e.details === 'object' && Object.keys(e.details).length === 0)) {
          return <span className="text-g-dim text-xs">—</span>
        }
        const text = typeof e.details === 'string' ? e.details : JSON.stringify(e.details)
        return (
          <span
            title={text}
            className="text-[11px] font-mono text-g-muted truncate max-w-[260px] inline-block align-middle"
          >
            {text}
          </span>
        )
      },
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: e => e.ip_address
        ? <span className="text-[11px] font-mono text-g-muted">{e.ip_address}</span>
        : <span className="text-g-dim text-xs">—</span>,
    },
  ]

  const total = data?.total ?? 0
  const entries = data?.entries ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <FileClock size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white">Audit Logs</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Append-only record from <code className="font-mono">audit_log</code>: who took
            what action against which target, and when. Backed by admin_api.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-g-border text-g-muted hover:text-accent hover:border-accent/30 transition-colors"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      <Section title={total > 0 ? `Recent events (${total.toLocaleString()})` : 'Recent events'}>
        {isError ? (
          <ErrorState
            title="Couldn't load audit log"
            description="admin_api returned an error reading from the audit_log table. Confirm GET /api/settings/audit is reachable."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <TableToolbar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={v => { setDateFrom(v); setPage(1) }}
              onDateToChange={v => { setDateTo(v); setPage(1) }}
              pageSize={limit}
              onPageSizeChange={v => { setLimit(v); setPage(1) }}
              total={total}
            />
            {entries.length === 0 && !isLoading ? (
              <Card>
                <EmptyState
                  icon={FileClock}
                  title="No audit events in range"
                  description="Nothing matched the current filters. Widen the date range or clear it to see the latest events."
                />
              </Card>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={entries}
                  loading={isLoading}
                  emptyText="No audit events"
                  onRowClick={setSelected}
                />
                <Pagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(total / limit))}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </Section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Audit · ${selected.action}` : ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="space-y-2">
              <DetailRow label="Event ID">
                <span className="font-mono">{selected.id}</span>
              </DetailRow>
              <DetailRow label="When">
                <span title={selected.created_at}>
                  {fmtDate(new Date(selected.created_at), "yyyy-MM-dd HH:mm:ss 'UTC'")}
                  <span className="ml-2 text-g-muted">
                    ({formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })})
                  </span>
                </span>
              </DetailRow>
              <DetailRow label="Actor">
                {selected.admin_email
                  ? <span className="font-mono">{selected.admin_email}</span>
                  : <span className="text-g-dim">system</span>}
              </DetailRow>
              <DetailRow label="Action">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
                  {selected.action}
                </span>
              </DetailRow>
              <DetailRow label="Target">
                {selected.target_type
                  ? (
                    <span className="font-mono">
                      {selected.target_type}
                      {selected.target_id ? ` · ${selected.target_id}` : ''}
                    </span>
                  )
                  : <span className="text-g-dim">—</span>}
              </DetailRow>
              <DetailRow label="IP">
                {selected.ip_address
                  ? <span className="font-mono">{selected.ip_address}</span>
                  : <span className="text-g-dim">—</span>}
              </DetailRow>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wide text-g-muted mb-1.5">Details</div>
              {selected.details && (typeof selected.details === 'object'
                ? Object.keys(selected.details).length > 0
                : String(selected.details).length > 0)
                ? (
                  <pre className="text-[11px] font-mono text-g-text bg-g-deep border border-g-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    {typeof selected.details === 'string'
                      ? selected.details
                      : JSON.stringify(selected.details, null, 2)}
                  </pre>
                )
                : <span className="text-xs text-g-dim">—</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
