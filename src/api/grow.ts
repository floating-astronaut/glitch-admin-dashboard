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

// ─── Customer management (Grow buyers + leads — proxied via admin_api) ──────

export type BuyerProvider = 'stripe' | 'razorpay'
export interface Buyer {
  id: number
  payment_id: string
  provider: BuyerProvider
  sku: string
  email: string
  github_username: string | null
  buyer_name: string | null
  amount_minor: number
  currency: 'USD' | 'INR'
  promo_code: string | null
  notes: Record<string, any> | null
  created_at: string | null
  fulfilled_at: string | null
  refunded_at: string | null
}

export type SinkStatus = 'ok' | 'pending' | 'failed' | 'stub'
export interface SinkState { status: SinkStatus; [k: string]: any }
export interface BuyerDetailResponse {
  ok: boolean
  stub?: boolean
  buyer: Buyer
  sinks: {
    payment_captured: SinkState
    ledger_write: SinkState
    welcome_email: SinkState
    codeberg_invite: SinkState
    discord_role: SinkState
    capi_meta: SinkState
    capi_tiktok: SinkState
  }
  activity: { at: string; kind: string; detail?: string }[]
}

export const customersBuyers = (params?: {
  email?: string; sku?: string; payment_id?: string;
  provider?: BuyerProvider; limit?: number;
}) => api.get<{ count: number; buyers: Buyer[] }>('/api/customers/buyers', { params })
        .then(r => r.data)

export const customersBuyer = (paymentId: string) =>
  api.get<BuyerDetailResponse>(`/api/customers/buyer/${encodeURIComponent(paymentId)}`).then(r => r.data)

export const customersLeads = () =>
  api.get<{ leads: any[]; count: number }>('/api/customers/leads').then(r => r.data)

export const customersRefund = (body: { payment_id: string; amount?: number; reason?: string }) =>
  api.post('/api/customers/refund', body).then(r => r.data)

export const customersResendWelcome = (payment_id: string) =>
  api.post('/api/customers/resend-welcome', { payment_id }).then(r => r.data)

export const customersReinviteCodeberg = (payment_id: string, github_username?: string) =>
  api.post('/api/customers/reinvite-codeberg', { payment_id, github_username }).then(r => r.data)

export const customersAddNote = (payment_id: string, note: string) =>
  api.post('/api/customers/note', { payment_id, note }).then(r => r.data)
