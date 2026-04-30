import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox, ChevronDown, ChevronRight } from 'lucide-react'
import { budzDrafts, type EmailDraft } from '../../../api/grow'
import { TableToolbar, Pagination } from '../../../components/ui/TableToolbar'
import { format, formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const STATES = [
  { label: 'All',         value: '' },
  { label: 'Pending',     value: 'pending' },
  { label: 'Approved',    value: 'approved' },
  { label: 'Rejected',    value: 'rejected' },
  { label: 'Edited',      value: 'edited' },
  { label: 'Superseded',  value: 'superseded' },
] as const

function StatePill({ s }: { s: string }) {
  const cls =
    s === 'pending'    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
  : s === 'approved'   ? 'bg-accent/15 text-accent border-accent/30'
  : s === 'rejected'   ? 'bg-red-500/15 text-red-300 border-red-500/30'
  : s === 'edited'     ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  : s === 'superseded' ? 'bg-white/5 text-g-muted border-g-border'
                       : 'bg-white/5 text-g-muted border-g-border'
  return <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', cls)}>{s}</span>
}

function DraftRow({ d }: { d: EmailDraft }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className="border-b border-g-border/50 hover:bg-white/2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <td className="px-3 py-2 text-xs text-g-muted whitespace-nowrap" title={format(new Date(d.created_at), 'PPpp')}>
          {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
        </td>
        <td className="px-3 py-2 text-xs text-white font-medium">
          <div className="flex items-center gap-1">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {d.business_name || '—'}
          </div>
        </td>
        <td className="px-3 py-2 text-xs text-g-text font-mono max-w-xs truncate">{d.contact_email || '—'}</td>
        <td className="px-3 py-2 text-xs text-g-text max-w-md truncate" title={d.subject}>{d.subject}</td>
        <td className="px-3 py-2 text-xs text-g-muted font-mono">{d.recipe_key}</td>
        <td className="px-3 py-2"><StatePill s={d.approval_state} /></td>
        <td className="px-3 py-2 text-xs text-g-muted">{d.model}</td>
        <td className="px-3 py-2 text-xs text-g-muted">
          {d.model_cost_usd != null ? `$${d.model_cost_usd.toFixed(4)}` : '—'}
        </td>
      </tr>
      {open && (
        <tr className="bg-g-deep">
          <td colSpan={8} className="px-6 py-4">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-g-dim">Subject ({d.subject_variant})</div>
              <div className="text-sm text-white">{d.subject}</div>
              <div className="text-[10px] uppercase tracking-wider text-g-dim mt-3">Body</div>
              <pre className="text-xs text-g-text whitespace-pre-wrap font-sans leading-relaxed bg-g-card border border-g-border rounded-lg p-3 max-h-96 overflow-y-auto">
                {d.body}
              </pre>
              {d.approved_by_text && (
                <div className="text-[10px] text-g-dim">
                  Approved by <span className="text-g-text">{d.approved_by_text}</span>
                  {d.approved_at && ` · ${formatDistanceToNow(new Date(d.approved_at), { addSuffix: true })}`}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function BudzDrafts() {
  const [state, setState] = useState<string>('pending')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['grow:budz:drafts', { state, dateFrom, dateTo, page, pageSize }],
    queryFn: () => budzDrafts({
      approval_state: (state || undefined) as any,
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
        <Inbox size={14} className="text-accent" /> Glitch Budz · Drafts (HITL queue)
      </h2>

      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={data?.total}
      >
        <div className="flex gap-1 bg-g-card border border-g-border rounded-lg p-0.5">
          {STATES.map(s => (
            <button
              key={s.value}
              onClick={() => { setState(s.value); setPage(1) }}
              className={clsx(
                'px-3 py-1 text-xs rounded transition-colors',
                state === s.value ? 'bg-accent/15 text-accent' : 'text-g-muted hover:text-white'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </TableToolbar>

      <div className="overflow-x-auto rounded-xl border border-g-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border bg-g-deep">
              {['Time','Business','Email','Subject','Recipe','State','Model','Cost'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-g-muted">No drafts in this state</td></tr>
            ) : data.rows.map(d => <DraftRow key={d.id} d={d} />)}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
