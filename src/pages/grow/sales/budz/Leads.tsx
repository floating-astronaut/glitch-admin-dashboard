import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Search, ExternalLink } from 'lucide-react'
import { budzLeads } from '../../../../api/grow'
import { TableToolbar, Pagination } from '../../../../components/ui/TableToolbar'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const STATUSES = ['', 'new', 'scored', 'paused', 'sent', 'replied', 'unsubscribed']

function StatusPill({ s }: { s: string }) {
  const cls =
    s === 'sent'         ? 'bg-accent/15 text-accent border-accent/30'
  : s === 'scored'       ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  : s === 'paused'       ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
  : s === 'unsubscribed' ? 'bg-red-500/15 text-red-300 border-red-500/30'
  : s === 'replied'      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                         : 'bg-white/5 text-g-muted border-g-border'
  return <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', cls)}>{s}</span>
}

export default function BudzLeads() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['grow:budz:leads', { status, q, dateFrom, dateTo, page, pageSize }],
    queryFn: () => budzLeads({
      status: status || undefined,
      search: q || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page, limit: pageSize,
    }),
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
        <div className="flex items-center gap-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setQ(search); setPage(1) } }}
            placeholder="Business / email / city…"
            className="text-xs bg-g-deep border border-g-border rounded pl-3 pr-2 py-1.5 text-g-text placeholder:text-g-dim focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => { setQ(search); setPage(1) }}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-g-muted hover:text-white"
          >
            <Search size={13} />
          </button>
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-g-deep border border-g-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </TableToolbar>

      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Business','City','Email','Status','Score','Site','Phone','Created'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">No leads match the filters</td></tr>
            ) : data.rows.map(l => (
              <tr key={l.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-sm text-white font-medium">
                  {l.business_name}
                  {l.website_url && (
                    <a href={l.website_url} target="_blank" rel="noopener noreferrer"
                       className="ml-1.5 text-g-muted hover:text-accent">
                      <ExternalLink size={11} className="inline" />
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-g-text">{l.city || '—'}</td>
                <td className="px-3 py-2 text-xs text-g-text font-mono">
                  {l.contact_email || <span className="text-g-dim">—</span>}
                  {l.contact_email && l.contact_email_verified && (
                    <span className="ml-1 text-accent">✓</span>
                  )}
                </td>
                <td className="px-3 py-2"><StatusPill s={l.status} /></td>
                <td className="px-3 py-2 text-xs text-accent font-bold">{l.score}</td>
                <td className="px-3 py-2 text-xs text-g-muted">{l.current_site_status || '—'}</td>
                <td className="px-3 py-2 text-xs text-g-muted font-mono">{l.phone || '—'}</td>
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
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
