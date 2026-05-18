/**
 * Grow vertical API — admin-dashboard business-operator reads.
 *
 * v1.4 IA: the admin dashboard's Grow surfaces are Customers, Users,
 * Billing only. Per-agent operations (Budz / Ads / Social / UGC /
 * SEO / Voice) are NOT part of the admin dashboard; the corresponding
 * client functions (budzStats / budzLeads / growAgentsSummary etc.)
 * were removed in the v1.4 sidebar-restructure lane.
 *
 * All endpoints below proxy through admin_api which talks to the
 * payment-server / glitch_grow_buyers Postgres.
 */
import api from './client'

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
