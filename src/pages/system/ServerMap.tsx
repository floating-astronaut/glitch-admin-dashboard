/**
 * System › Server Map — operator browser for the SERVER_*.md system map.
 *
 * Per docs/INFRA_VIEW_PLAN.md. Reads infra_docs from admin_api (single
 * /api/infra-docs call returns all 14 docs ~283 KB). Search + nav are
 * fully client-side; URL state carries the slug and query.
 *
 * Routes:
 *   /system/server-map              → first doc (section 1)
 *   /system/server-map/:slug        → specific doc
 *   ?q=…                            → search (shareable bookmark)
 */
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom'
import {
  Search, RefreshCw, ExternalLink, AlertTriangle, Server as ServerIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  listInfraDocs, syncInfraDocs, type InfraDoc,
} from '../../api/infraDocs'
import Card from '../../components/ui/Surface'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ServerMapDocList from '../../components/server-map/ServerMapDocList'
import MarkdownView from '../../components/server-map/MarkdownView'

export default function ServerMap() {
  const { slug } = useParams<{ slug?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['infra-docs'],
    queryFn: listInfraDocs,
    refetchInterval: 5 * 60_000,
  })

  const syncMut = useMutation({
    mutationFn: syncInfraDocs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['infra-docs'] }),
  })

  const docs: InfraDoc[] = data?.docs ?? []
  const matchedDocs = useMemo(() => {
    if (!query) return docs
    const q = query.toLowerCase()
    return docs.filter(d =>
      d.content_md.toLowerCase().includes(q)
      || d.title.toLowerCase().includes(q)
      || d.slug.toLowerCase().includes(q)
    )
  }, [docs, query])

  // Resolve current doc: explicit slug, else first by section_num.
  const activeDoc = slug
    ? docs.find(d => d.slug === slug)
    : (matchedDocs[0] ?? docs[0])

  // Freshness label sourced from the most-recently synced doc.
  const lastSync = useMemo(() => {
    const stamps = docs
      .map(d => new Date(d.last_synced_at).valueOf())
      .filter(t => !Number.isNaN(t))
    if (stamps.length === 0) return null
    return new Date(Math.max(...stamps))
  }, [docs])

  // If routed to an unknown slug, redirect to the index — keeping the
  // search query so the operator's bookmark isn't broken.
  if (slug && data && !activeDoc) {
    return <Navigate to={`/system/server-map${query ? `?q=${encodeURIComponent(query)}` : ''}`} replace />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
          <ServerIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white">Server Map</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Read-only ingest of <code className="font-mono">glitch-trade-app/docs/SERVER_*.md</code>.
            12 sectional artifacts + the consolidation log + checklist.
            Search runs across all 14 docs.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-g-dim shrink-0">
          {lastSync && (
            <span title={lastSync.toISOString()}>
              synced {formatDistanceToNow(lastSync, { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-g-border text-g-muted hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={syncMut.isPending ? 'animate-spin' : ''} />
            {syncMut.isPending ? 'Syncing…' : 'Resync now'}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-g-dim" />
        <input
          value={query}
          onChange={e => {
            const next = new URLSearchParams(searchParams)
            const v = e.target.value
            if (v) next.set('q', v); else next.delete('q')
            setSearchParams(next, { replace: true })
          }}
          placeholder="Search across all 14 docs (commands, hostnames, file paths…)"
          className="w-full bg-g-deep border border-g-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-g-dim outline-none focus:border-accent/40"
        />
      </div>

      {isError ? (
        <ErrorState
          title="Couldn't load the system map"
          description="admin_api /api/infra-docs returned an error. The background sync may still be populating on first start — try Resync now."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <Card>
          <p className="text-xs text-g-muted">Loading system map…</p>
        </Card>
      ) : docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="System map cache is empty"
            description="No docs ingested yet. Either the source dir on the host is unmounted in admin_api or the first sync hasn't run. Use Resync now."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto pr-1">
            <ServerMapDocList
              docs={matchedDocs}
              query={query}
              activeSlug={activeDoc?.slug}
            />
          </div>

          <Card className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
            {activeDoc ? (
              <>
                <div className="flex items-center justify-between text-[10px] text-g-dim mb-3">
                  <span className="font-mono">{activeDoc.source_path}</span>
                  <span>
                    modified {formatDistanceToNow(new Date(activeDoc.last_modified), { addSuffix: true })}
                    {' · '}
                    {(activeDoc.bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <MarkdownView markdown={activeDoc.content_md} />
                <div className="mt-6 pt-3 border-t border-g-border flex items-center justify-between text-[10px] text-g-dim">
                  <span className="font-mono">slug: {activeDoc.slug}</span>
                  <Link
                    to="/system/audit-logs"
                    className="inline-flex items-center gap-1 hover:text-accent"
                  >
                    <ExternalLink size={10} /> audit log
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-xs text-g-muted">Pick a doc on the left.</p>
            )}
          </Card>
        </div>
      )}

      {syncMut.isSuccess && syncMut.data && (
        <div className="rounded-xl border border-g-border bg-g-card/40 p-3 text-[11px] text-g-muted">
          Last manual sync: {syncMut.data.inserted} inserted,
          {' '}{syncMut.data.updated} updated,
          {' '}{syncMut.data.unchanged} unchanged,
          {' '}{syncMut.data.deleted} deleted
          {' · '}{syncMut.data.elapsed_ms} ms
          {syncMut.data.errors.length > 0 && (
            <span className="text-red-400">
              {' · '}errors: {syncMut.data.errors.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
