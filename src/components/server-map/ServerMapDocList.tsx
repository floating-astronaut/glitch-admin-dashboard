/**
 * ServerMapDocList — left-rail navigation for /system/server-map.
 *
 * Per docs/INFRA_VIEW_PLAN.md §4. Filtered by the parent's search
 * query; selecting a row updates the URL slug. Highlights the
 * active doc and shows a match count when the query matches
 * occurrences inside content_md.
 */
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { FileText } from 'lucide-react'
import type { InfraDoc } from '../../api/infraDocs'

interface Props {
  docs: InfraDoc[]
  query: string
  activeSlug: string | undefined
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${Math.round(bytes / 1024)} KB`
}

function countMatches(haystack: string, needle: string): number {
  if (!needle) return 0
  const n = needle.toLowerCase()
  let count = 0
  let from = 0
  const lower = haystack.toLowerCase()
  while ((from = lower.indexOf(n, from)) !== -1) {
    count += 1
    from += n.length
  }
  return count
}

export default function ServerMapDocList({ docs, query, activeSlug }: Props) {
  return (
    <div className="space-y-1">
      {docs.map(d => {
        const matchCount = query ? countMatches(d.content_md, query) : 0
        const isActive = activeSlug === d.slug
        return (
          <NavLink
            key={d.slug}
            to={`/system/server-map/${d.slug}${query ? `?q=${encodeURIComponent(query)}` : ''}`}
            className={clsx(
              'block rounded-lg border px-3 py-2 transition-colors',
              isActive
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-g-border bg-g-card hover:border-accent/20 hover:bg-accent/5 text-g-text'
            )}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-g-dim">
              <FileText size={11} />
              {d.section_num != null ? `Section ${d.section_num}` : 'Reference'}
            </div>
            <div className={clsx('mt-0.5 text-xs font-medium', isActive ? 'text-accent' : 'text-white')}>
              {d.title}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-g-dim font-mono">
              <span>{fmtSize(d.bytes)}</span>
              {matchCount > 0 && (
                <span className="text-accent">
                  {matchCount} match{matchCount === 1 ? '' : 'es'}
                </span>
              )}
            </div>
          </NavLink>
        )
      })}
      {docs.length === 0 && (
        <p className="text-xs text-g-dim px-2 py-3">No docs match this search.</p>
      )}
    </div>
  )
}
