import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const PAGE_SIZE_OPTIONS = [20, 50, 100]

interface ToolbarProps {
  /** YYYY-MM-DD or '' */
  dateFrom: string
  dateTo: string
  onDateFromChange: (s: string) => void
  onDateToChange: (s: string) => void
  pageSize: number
  onPageSizeChange: (n: number) => void
  total?: number
  /** Leftmost slot — usually a row of additional filter chips. */
  children?: React.ReactNode
}

export function TableToolbar({
  dateFrom, dateTo, onDateFromChange, onDateToChange,
  pageSize, onPageSizeChange, total, children,
}: ToolbarProps) {
  const hasDate = !!(dateFrom || dateTo)
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {children}

      <div className="flex items-center gap-2 text-xs text-g-muted">
        <span>From</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={e => onDateFromChange(e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="bg-g-deep border border-g-border rounded px-2 py-1 text-g-text text-xs focus:outline-none focus:border-accent cursor-pointer"
        />
        <span>To</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={e => onDateToChange(e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="bg-g-deep border border-g-border rounded px-2 py-1 text-g-text text-xs focus:outline-none focus:border-accent cursor-pointer"
        />
        {hasDate && (
          <button
            onClick={() => { onDateFromChange(''); onDateToChange('') }}
            className="text-g-muted hover:text-white transition-colors"
            title="Clear dates"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-g-muted ml-auto">
        {total !== undefined && (
          <span>{total.toLocaleString()} matching</span>
        )}
        <span>· Rows</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="bg-g-deep border border-g-border rounded px-2 py-1 text-g-text text-xs focus:outline-none focus:border-accent"
        >
          {PAGE_SIZE_OPTIONS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (n: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Build smart page button list (first, last, ±2 around current)
  const pages: (number | '…')[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) add(i)
  } else {
    add(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) add(i)
    if (page < totalPages - 2) pages.push('…')
    add(totalPages)
  }

  return (
    <div className="flex items-center justify-between text-xs text-g-muted">
      <span>Page {page} of {totalPages}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2 py-1 rounded border border-g-border disabled:opacity-30 hover:enabled:bg-g-deep transition-colors"
        >
          <ChevronLeft size={12} />
        </button>
        {pages.map((b, i) =>
          b === '…' ? (
            <span key={`e-${i}`} className="px-1">…</span>
          ) : (
            <button
              key={b}
              onClick={() => onPageChange(b as number)}
              className={clsx(
                'px-2 py-1 rounded border transition-colors',
                b === page
                  ? 'border-accent text-accent'
                  : 'border-g-border hover:bg-g-deep'
              )}
            >
              {b}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2 py-1 rounded border border-g-border disabled:opacity-30 hover:enabled:bg-g-deep transition-colors"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
