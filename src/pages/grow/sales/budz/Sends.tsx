import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, Eye, MessageSquare, AlertTriangle, Ban } from 'lucide-react'
import { budzSends } from '../../../../api/grow'
import { TableToolbar, Pagination } from '../../../../components/ui/TableToolbar'
import { format, formatDistanceToNow } from 'date-fns'

export default function BudzSends() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['grow:budz:sends', { dateFrom, dateTo, page, pageSize }],
    queryFn: () => budzSends({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page, limit: pageSize,
    }),
    refetchInterval: 30_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Send size={14} className="text-accent" /> Glitch Budz · Sends
      </h2>

      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      />

      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Sent','Business','To','Subject','Followup','Opens','Replies','Flags'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">No sends</td></tr>
            ) : data.rows.map(s => (
              <tr key={s.id} className="border-b border-g-border/50 hover:bg-white/2">
                <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap" title={format(new Date(s.sent_at), 'PPpp')}>
                  {formatDistanceToNow(new Date(s.sent_at), { addSuffix: true })}
                </td>
                <td className="px-3 py-2 text-xs text-white">{s.business_name || '—'}</td>
                <td className="px-3 py-2 text-xs text-g-text font-mono max-w-xs truncate">{s.to_email}</td>
                <td className="px-3 py-2 text-xs text-g-muted max-w-md truncate" title={s.subject}>{s.subject}</td>
                <td className="px-3 py-2 text-xs text-g-text">{s.follow_up_seq > 0 ? `#${s.follow_up_seq}` : '—'}</td>
                <td className="px-3 py-2 text-xs">
                  {s.opened_count > 0
                    ? <span className="text-accent flex items-center gap-1"><Eye size={11} />{s.opened_count}</span>
                    : <span className="text-g-dim">·</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  {s.reply_thread_count > 0
                    ? <span className="text-purple-300 flex items-center gap-1"><MessageSquare size={11} />{s.reply_thread_count}</span>
                    : <span className="text-g-dim">·</span>}
                </td>
                <td className="px-3 py-2 text-xs flex items-center gap-2">
                  {s.bounced && <span className="text-red-400 flex items-center gap-1" title="Bounced"><AlertTriangle size={11} />b</span>}
                  {s.unsubscribed && <span className="text-yellow-300 flex items-center gap-1" title="Unsubscribed"><Ban size={11} />u</span>}
                  {!s.bounced && !s.unsubscribed && <span className="text-g-dim">·</span>}
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
