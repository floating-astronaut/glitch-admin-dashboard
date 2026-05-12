/**
 * Trade vertical API — Ouroboros (cTrader demo) data via /api/trade/*.
 *
 * All reads from the host postgres `glitch_ml` DB through the admin_api
 * read-only proxy. See admin_api/routers/trade.py for endpoint specs.
 */
import api from './client'

// ── Types ────────────────────────────────────────────────────────────────────
export interface TradeBot {
  bot: string
  status: 'online' | 'warning' | 'offline'
  signal_count_7d: number
  executed_count_7d: number
  symbols: number
  last_signal_at: string | null
}

export interface TradeStats {
  days: number
  signals: number
  executed: number
  avg_confidence: number
  symbols: number
  bots: number
  trades_total: number
  trades_open: number
  trades_closed: number
  wins: number
  losses: number
  win_rate_pct: number | null
  total_pnl: number
  avg_duration_min: number
  account_balance: number
  account_equity: number
}

export interface TradeSignal {
  id: number
  signal_id: string
  created_at: string
  bot_name: string
  model_name: string
  symbol: string
  timeframe: string
  vote: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning?: string
  executed: boolean
  trade_id?: number | null
  bar_close?: number
}

export interface TradeRow {
  id: number
  trade_id: string
  signal_id: string
  bot_name: string
  model_name: string
  symbol: string
  timeframe: string
  side: 'BUY' | 'SELL'
  entry_price: number | null
  sl_price: number | null
  tp_price: number | null
  volume_lots: number
  ticket: string | null
  opened_at: string
  exit_price: number | null
  exit_reason: string | null
  closed_at: string | null
  pnl: number | null
  outcome: 'WIN' | 'LOSS' | null
  duration_minutes: number | null
  signal_confidence: number | null
}

export interface SymbolBreakdown {
  symbol: string
  open_positions: number
  open_lots: number
  trades_24h: number
  pnl_24h: number
}

export interface OracleDecision {
  id: number
  decision_id: string
  created_at: string
  symbol: string
  decision: 'BUY' | 'SELL' | 'HOLD' | 'ABSTAIN'
  decision_confidence: number
  buy_score: number
  sell_score: number
  hold_score: number
  contributors: Record<string, { vote: string; conf: number; weight: number; age_sec: number }>
  abstain_reason?: string
  mode: string
  trade_id?: string | null
}

export interface OracleWeight {
  bot_name: string
  weight: number
  can_veto: boolean
  freshness_sec: number
  updated_at: string
  notes: string | null
}

export interface OracleBlock {
  id: number
  created_at: string
  bot_name: string
  symbol: string
  side: string
  proposed_lots: number
  block_reason: string
  block_detail: Record<string, unknown>
  signal_id: string | null
}

export interface OracleRiskLimit {
  scope_type: string
  scope_key: string
  max_lots: number
  max_trades: number | null
  enabled: boolean
  notes: string | null
  updated_at: string
}

export interface NewsEvent {
  id: number
  created_at: string
  article_id: string
  title: string
  description: string | null
  link: string | null
  source: string | null
  published_at: string | null
  category: string[] | null
  country: string[] | null
  event_type: string | null
  matched_rule_id: number | null
}

interface Page<T> { total: number; page: number; limit: number; rows: T[] }

// ── Endpoints ────────────────────────────────────────────────────────────────
export const tradeBots = () =>
  api.get<TradeBot[]>('/api/trade/bots').then(r => r.data)

export const tradeStats = (days: number = 7) =>
  api.get<TradeStats>('/api/trade/stats', { params: { days } }).then(r => r.data)

interface DateRange { date_from?: string; date_to?: string }

export const tradeSignals = (params: {
  bot?: string; symbol?: string; vote?: 'BUY' | 'SELL' | 'HOLD';
  executed?: boolean; limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<TradeSignal>>('/api/trade/signals', { params }).then(r => r.data)

export const tradeTrades = (params: {
  status?: 'open' | 'closed'; bot?: string; symbol?: string;
  limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<TradeRow>>('/api/trade/trades', { params }).then(r => r.data)

export const tradeSymbols = () =>
  api.get<SymbolBreakdown[]>('/api/trade/symbols').then(r => r.data)

export const tradeOracleDecisions = (params: {
  symbol?: string; decision?: string; mode?: string; limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<OracleDecision>>('/api/trade/oracle/decisions', { params }).then(r => r.data)

export const tradeOracleWeights = () =>
  api.get<OracleWeight[]>('/api/trade/oracle/weights').then(r => r.data)

export const tradeOracleBlocks = (params: {
  bot?: string; symbol?: string; limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<OracleBlock>>('/api/trade/oracle/blocks', { params }).then(r => r.data)

export const tradeOracleRisk = () =>
  api.get<OracleRiskLimit[]>('/api/trade/oracle/risk').then(r => r.data)

export const tradeNews = (params: {
  limit?: number; page?: number
} & DateRange = {}) =>
  api.get<Page<NewsEvent>>('/api/trade/news', { params }).then(r => r.data)

export const tradeBars = (symbol: string, timeframe: string, limit = 500) =>
  api.get(`/api/trade/bars/${symbol}/${timeframe}`, { params: { limit } }).then(r => r.data)

export type TradeMetric = 'pnl' | 'equity' | 'signals' | 'trades'
export interface TradeSeriesPoint { t: string; v: number }
export interface TradeSeries {
  metric: TradeMetric
  days: number
  points: TradeSeriesPoint[]
}
export const tradeSeries = (metric: TradeMetric, days: number = 7) =>
  api.get<TradeSeries>('/api/trade/series', { params: { metric, days } }).then(r => r.data)

export interface LiveAccountSnapshot {
  available: boolean
  fetched_at: string | null
  total_balance: number | null
  total_equity: number | null
  total_floating_pnl: number | null
  total_open_positions: number | null
  total_open_lots: number | null
  currency: string | null
  accounts: Record<string, {
    balance?: number; equity?: number; floating_pnl?: number;
    open_positions?: number; open_lots?: number;
    currency?: string; error?: string
  }>
  stale_seconds: number | null
}
export const tradeLiveAccount = () =>
  api.get<LiveAccountSnapshot>('/api/trade/account/live').then(r => r.data)
