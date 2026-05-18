/**
 * /dashboard/system/server-map — operator browser for the SERVER_*.md
 * system map ingested by ADMIN-INFRA-1a.
 *
 * Data flow:
 *   GET /api/infra-docs       returns all 14 docs (~280 kB total).
 *   POST /api/infra-docs/sync triggers an upstream refresh.
 * URL state:
 *   ?slug=…  selected doc (defaults to first by section_num)
 *   ?q=…     full-text search (filters left-rail list + counts matches)
 *
 * Static export friendly: useSearchParams + useRouter live inside a
 * Suspense boundary (the default page export is just the wrapper).
 */
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle, ExternalLink, FileText, Network, RefreshCw, Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import MarkdownView from '@/components/server-map/markdown-view'
import {
  listInfraDocs, syncInfraDocs, type InfraDoc,
} from '@/lib/api/infraDocs'

export default function ServerMapPage() {
  return (
    <Suspense fallback={<ServerMapSkeleton />}>
      <ServerMapBrowser />
    </Suspense>
  )
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${Math.round(bytes / 1024)} KB`
}

function countMatches(haystack: string, needle: string): number {
  if (!needle) return 0
  const n = needle.toLowerCase()
  const h = haystack.toLowerCase()
  let count = 0
  let from = 0
  while ((from = h.indexOf(n, from)) !== -1) {
    count += 1
    from += n.length
  }
  return count
}

function ServerMapBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? undefined
  const query = (searchParams.get('q') ?? '').trim()

  const qc = useQueryClient()
  const docsQ = useQuery({
    queryKey: ['infra-docs'],
    queryFn: listInfraDocs,
    refetchInterval: 5 * 60_000,
  })
  const syncMut = useMutation({
    mutationFn: syncInfraDocs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['infra-docs'] }),
  })

  const docs: InfraDoc[] = docsQ.data?.docs ?? []
  const matchedDocs = useMemo(() => {
    if (!query) return docs
    const q = query.toLowerCase()
    return docs.filter(
      (d) =>
        d.content_md.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q),
    )
  }, [docs, query])

  const activeDoc =
    (slug && docs.find((d) => d.slug === slug)) ||
    matchedDocs[0] ||
    docs[0]

  const lastSync = useMemo(() => {
    const stamps = docs
      .map((d) => new Date(d.last_synced_at).valueOf())
      .filter((t) => !Number.isNaN(t))
    if (stamps.length === 0) return null
    return new Date(Math.max(...stamps))
  }, [docs])

  // Local input mirrors the URL but doesn't push on every keystroke.
  // The list filters live; the URL updates on blur or Enter.
  const [searchDraft, setSearchDraft] = useState(query)

  function setUrl(next: { slug?: string | null; q?: string | null }) {
    const params = new URLSearchParams(searchParams.toString())
    if ('slug' in next) {
      if (next.slug) params.set('slug', next.slug)
      else params.delete('slug')
    }
    if ('q' in next) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Network className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">Server Map</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Read-only ingest of <code className="font-mono">glitch-trade-app/docs/SERVER_*.md</code>.
            12 sectional artifacts + the consolidation log + checklist. Search runs across all docs.
          </p>
        </div>
        <div className="text-muted-foreground/80 flex shrink-0 items-center gap-2 text-[11px]">
          {lastSync && (
            <span title={lastSync.toISOString()}>
              synced {formatDistanceToNow(lastSync, { addSuffix: true })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}>
            <RefreshCw className={cn('size-3', syncMut.isPending && 'animate-spin')} />
            {syncMut.isPending ? 'Syncing…' : 'Resync now'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={searchDraft}
          onChange={(e) => {
            setSearchDraft(e.target.value)
            // Push immediately — list updates feel laggy otherwise. URL
            // gets replaced on each keystroke but scroll position stays.
            setUrl({ q: e.target.value })
          }}
          placeholder="Search across all docs (commands, hostnames, file paths…)"
          className="pl-9"
        />
      </div>

      {docsQ.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4" /> Couldn&apos;t load the system map
            </CardTitle>
            <CardDescription>
              <code className="font-mono">/api/infra-docs</code> returned an error. If admin_api just
              restarted the first 5-minute sync may not have populated the cache yet — try Resync now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : docsQ.isLoading ? (
        <ServerMapSkeleton />
      ) : docs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System map cache empty</CardTitle>
            <CardDescription>
              No docs ingested yet. Either the source dir on the host is unmounted in
              admin_api or the first sync hasn&apos;t run. Click Resync now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <ScrollArea className="h-[calc(100vh-260px)] pr-2">
            <ul className="space-y-1">
              {matchedDocs.map((d) => {
                const matchCount = query ? countMatches(d.content_md, query) : 0
                const isActive = activeDoc?.slug === d.slug
                return (
                  <li key={d.slug}>
                    <button
                      type="button"
                      onClick={() => setUrl({ slug: d.slug })}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                        isActive
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border bg-card hover:bg-accent text-foreground',
                      )}>
                      <div className="text-muted-foreground/80 flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
                        <FileText className="size-3" />
                        {d.section_num != null ? `Section ${d.section_num}` : 'Reference'}
                      </div>
                      <div className={cn('mt-0.5 text-xs font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                        {d.title}
                      </div>
                      <div className="text-muted-foreground/70 mt-1 flex items-center justify-between font-mono text-[10px]">
                        <span>{fmtSize(d.bytes)}</span>
                        {matchCount > 0 && (
                          <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                            {matchCount} match{matchCount === 1 ? '' : 'es'}
                          </Badge>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
              {matchedDocs.length === 0 && (
                <li className="text-muted-foreground px-2 py-3 text-xs">No docs match this search.</li>
              )}
            </ul>
          </ScrollArea>

          <Card className="h-[calc(100vh-260px)] overflow-hidden">
            <ScrollArea className="h-full">
              <CardContent className="space-y-3 py-4">
                {activeDoc ? (
                  <>
                    <div className="text-muted-foreground/80 flex items-center justify-between text-[10px]">
                      <span className="font-mono">{activeDoc.source_path}</span>
                      <span>
                        modified {formatDistanceToNow(new Date(activeDoc.last_modified), { addSuffix: true })}
                        {' · '}
                        {(activeDoc.bytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <MarkdownView markdown={activeDoc.content_md} />
                    <div className="border-border text-muted-foreground/80 flex items-center justify-between border-t pt-3 text-[10px]">
                      <span className="font-mono">slug: {activeDoc.slug}</span>
                      <a
                        href="/dashboard/system/audit-logs"
                        className="hover:text-primary inline-flex items-center gap-1">
                        <ExternalLink className="size-3" /> audit log
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-xs">Pick a doc on the left.</p>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}

      {syncMut.isSuccess && syncMut.data && (
        <Card>
          <CardContent className="text-muted-foreground py-3 text-[11px]">
            Last manual sync: {syncMut.data.inserted} inserted,
            {' '}{syncMut.data.updated} updated,
            {' '}{syncMut.data.unchanged} unchanged,
            {' '}{syncMut.data.deleted} deleted
            {' · '}{syncMut.data.elapsed_ms} ms
            {syncMut.data.errors.length > 0 && (
              <span className="text-destructive">
                {' · '}errors: {syncMut.data.errors.join(', ')}
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ServerMapSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-(--content-padding) lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <Skeleton className="h-[calc(100vh-260px)] w-full" />
    </div>
  )
}
