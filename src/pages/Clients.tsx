import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getClients } from '../api/endpoints'
import StatusBadge from '../components/ui/StatusBadge'
import { Search, Eye, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TableToolbar, Pagination } from '../components/ui/TableToolbar'

export default function Clients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { page, pageSize, search, tier, status, dateFrom, dateTo }],
    queryFn: () => getClients({
      page,
      limit: pageSize,
      search,
      tier,
      status,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-4">
      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      >
        <div className="relative min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-g-muted" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search username, telegram id…"
            className="bg-g-deep border border-g-border rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-g-dim focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={tier}
          onChange={e => { setTier(e.target.value); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option value="">All Tiers</option>
          <option value="trial">Trial</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </TableToolbar>

      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Username','Telegram ID','Tier','Status','Queries','Favs','Auto-Exec','Joined',''].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.customers.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-g-muted">No customers match the filters</td></tr>
            ) : data.customers.map((c: any) => (
              <tr key={c.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-sm font-medium text-white">{c.username || '—'}</td>
                <td className="px-3 py-2 text-xs text-g-muted font-mono">{c.telegram_id}</td>
                <td className="px-3 py-2"><StatusBadge value={c.tier || 'trial'} /></td>
                <td className="px-3 py-2"><StatusBadge value={c.status || 'active'} dot /></td>
                <td className="px-3 py-2 text-xs text-g-text">{c.queries_today ?? 0}</td>
                <td className="px-3 py-2 text-xs text-g-muted">{c.favorites_count ?? 0}</td>
                <td className="px-3 py-2 text-xs">
                  {c.auto_execute_enabled
                    ? <span className="inline-flex items-center gap-1 text-green-400 font-medium"><Zap size={11} /> On</span>
                    : <span className="text-g-dim">Off</span>}
                </td>
                <td className="px-3 py-2 text-xs text-g-muted">
                  {c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : '—'}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => navigate(`/clients/${c.id}`)}
                    className="text-g-muted hover:text-accent transition-colors"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
