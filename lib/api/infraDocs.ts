/**
 * infraDocs — read-only admin_api client for the SERVER_*.md system map.
 *
 * Cache lives in admin_api PG16 (table infra_docs), populated by a
 * 5-min background task in admin_api/tasks/infra_docs_sync.py.
 * Source of truth: /home/support/glitch-trade-app/docs/SERVER_*.md.
 *
 * Per docs/INFRA_VIEW_PLAN.md: list endpoint returns full content
 * (~283 KB across 14 docs) so search + nav are fully client-side.
 */
import api from './client'

export interface InfraDoc {
  slug: string
  title: string
  source_path: string
  section_num: number | null
  content_md: string
  content_hash: string
  bytes: number
  last_modified: string
  last_synced_at: string
}

export interface InfraDocSyncSummary {
  inserted: number
  updated: number
  unchanged: number
  deleted: number
  errors: string[]
  elapsed_ms: number
}

export const listInfraDocs = () =>
  api.get<{ docs: InfraDoc[]; count: number }>('/api/infra-docs').then(r => r.data)

export const getInfraDoc = (slug: string) =>
  api.get<InfraDoc>(`/api/infra-docs/${encodeURIComponent(slug)}`).then(r => r.data)

export const syncInfraDocs = () =>
  api.post<InfraDocSyncSummary>('/api/infra-docs/sync').then(r => r.data)
