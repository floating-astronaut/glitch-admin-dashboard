/**
 * Trade-admin API — Revenue/Users/Subscriptions surface for the Trade
 * Business section of dashboard.glitchexecutor.com.
 *
 * Reads via admin_api's /api/trade-admin/* proxy, which injects the
 * X-Admin-Secret header server-side and forwards to glitch-trade-api
 * /v1/admin/* (port 3112 on the host, fronted by trade-api.glitchexecutor.com).
 * The SPA bundle never sees the secret — same posture as the Grow
 * customers proxy (/api/customers/* → payment server).
 */
import api from './client'

// ── Types ───────────────────────────────────────────────────────────────────

export interface TradeMetrics {
  mrr_usd: number
  active_subscriptions: number
  paid_users: number
  free_users: number
  total_users: number
  churn_30d_pct: number
  trial_conversion_30d_pct: number
  by_tier: Record<string, number>
  generated_at: string
}

export interface TradeUserRow {
  id: string
  email: string
  role: string
  created_at: string
  last_seen_at: string | null
  tier: string | null
  sub_status: string | null
  current_period_end: string | null
  connected_accounts: number
  saved_replays: number
}

export interface TradeUsersList {
  users: TradeUserRow[]
  total: number
}

export interface TradeSubscriptionRow {
  id: string
  user_id: string
  user_email: string
  sku: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string
  stripe_subscription_id: string
  created_at: string
  updated_at: string
}

export interface TradeSubscriptionsList {
  subscriptions: TradeSubscriptionRow[]
  total: number
}

// ── Fetchers ────────────────────────────────────────────────────────────────

export async function getTradeMetrics(): Promise<TradeMetrics> {
  const { data } = await api.get<TradeMetrics>('/api/trade-admin/metrics')
  return data
}

export async function getTradeUsers(opts: {
  limit?: number
  offset?: number
  q?: string
} = {}): Promise<TradeUsersList> {
  const { data } = await api.get<TradeUsersList>('/api/trade-admin/users', {
    params: {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
      ...(opts.q ? { q: opts.q } : {}),
    },
  })
  return data
}

export async function getTradeSubscriptions(opts: {
  status?: string
  limit?: number
} = {}): Promise<TradeSubscriptionsList> {
  const { data } = await api.get<TradeSubscriptionsList>('/api/trade-admin/subscriptions', {
    params: {
      limit: opts.limit ?? 200,
      ...(opts.status ? { status: opts.status } : {}),
    },
  })
  return data
}
