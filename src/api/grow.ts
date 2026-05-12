/**
 * Grow vertical API — currently surfaces Glitch Budz (sales agent).
 * Reads from host postgres glitch_sales_agent via the read-only proxy.
 */
import api from './client'

export interface BudzStats {
  leads_total: number
  leads_by_status: Record<string, number>
  drafts_by_state: Record<string, number>
  drafts_24h: number
  drafts_pending: number
  sends_total: number
  sends_24h: number
  opens: number
  replies: number
  bounces: number
  unsubs: number
  open_rate_pct: number | null
  reply_rate_pct: number | null
}

export interface Lead {
  id: string
  created_at: string
  source: string
  business_name: string
  city: string | null
  province: string
  contact_email: string | null
  contact_email_verified: boolean
  current_site_status: string | null
  score: number
  status: string
  paused_reason: string | null
  website_url: string | null
  phone: string | null
}

export interface EmailDraft {
  id: string
  created_at: string
  recipe_key: string
  subject_variant: string
  subject: string
  body: string
  model: string
  model_cost_usd: number | null
  approval_state: 'pending' | 'approved' | 'rejected' | 'edited' | 'superseded'
  approved_at: string | null
  approved_by_text: string | null
  discord_message_id: number | null
  business_name: string | null
  contact_email: string | null
  city: string | null
}

export interface EmailSend {
  id: string
  sent_at: string
  from_email: string
  to_email: string
  subject: string
  opened_first_at: string | null
  opened_count: number
  replied_at: string | null
  reply_thread_count: number
  bounced: boolean
  unsubscribed: boolean
  follow_up_seq: number
  business_name: string | null
}

export interface FunnelRow {
  status: string
  lead_count: number
  lead_count_7d: number
  lead_count_24h: number
}

interface Page<T> { total: number; page: number; limit: number; rows: T[] }
interface DateRange { date_from?: string; date_to?: string }

export const budzStats = () =>
  api.get<BudzStats>('/api/grow/budz/stats').then(r => r.data)

export const budzLeads = (params: {
  status?: string; search?: string; limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<Lead>>('/api/grow/budz/leads', { params }).then(r => r.data)

export const budzDrafts = (params: {
  approval_state?: 'pending' | 'approved' | 'rejected' | 'edited' | 'superseded'
  limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<EmailDraft>>('/api/grow/budz/drafts', { params }).then(r => r.data)

export const budzSends = (params: {
  limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<EmailSend>>('/api/grow/budz/sends', { params }).then(r => r.data)

export const budzFunnel = () =>
  api.get<FunnelRow[]>('/api/grow/budz/funnel').then(r => r.data)

export type GrowAgentId = 'sales' | 'ads' | 'social' | 'ugc' | 'seo' | 'voice'
export type GrowAgentStatus = 'healthy' | 'degraded' | 'stale' | 'offline' | 'coming_soon'
export interface GrowAgentSummary {
  id: GrowAgentId
  name: string
  status: GrowAgentStatus
  deployments: number
  pending_approvals: number
  outputs_7d: number
}
export const growAgentsSummary = () =>
  api.get<{ agents: GrowAgentSummary[] }>('/api/grow/agents/summary').then(r => r.data)
