# Changelog — `glitch-admin-dashboard`

Auto-regenerated from `git log` by `/home/support/bin/changelog-regen`,
called before every push by `/home/support/bin/git-sync-all` (cron `*/15 * * * *`).

**Purpose:** traceability. If a push broke something, scan dates + short SHAs
here; then `git show <sha>` to see the diff, `git revert <sha>` to undo.

**Format:** UTC dates, newest first. Each entry: `time — subject (sha) — N files`.
Body text (if present) shown as indented sub-bullets.

---

## 2026-05-13

- **03:15 UTC** — admin/customers: Grow buyer management surface (`e41d6e7`) — 13 files
    New /admin/customers replaces the stale /clients page as the unified
    customer-management surface. v1 ships Grow buyers; Edge and Trade
    verticals render as disabled "soon" tabs that will light up as their
    data sources come online.
    Backend
    - admin_api routers/customers.py — JWT-protected proxy that injects
      X-Fulfill-Secret server-side and forwards to the payment service at
      http://payment:5002. Covers buyers / buyer detail / leads / refund /
      resend-welcome / reinvite-codeberg / note.
    - payment server gains 5 new /api/grow/* endpoints (buyer detail, leads,

## 2026-05-12

- **08:37 UTC** — docs: briefing prompt for customer-management session (`e5e13f1`) — 1 file
    Self-contained brief for a fresh Claude/Codex session that picks up
    the Grow customer + lead management pages. Covers all 10 data
    sources (Postgres glitch_grow_buyers, Google Sheet leads, Resend
    audience + sends, Stripe + Razorpay APIs, Codeberg collaborator
    flow, Discord membership, Meta + TikTok CAPI ledger, payment-server
    endpoints, sales-agent DB), payment-server endpoint contracts to
    add, dashboard architecture, acceptance criteria for v1, memory
    files to read, and coding constraints.
- **07:24 UTC** — sales: tabify Glitch Budz under one AgentShell layout (`39fab8e`) — 6 files
    BudzLayout wraps /grow/sales/budz with the AgentShell header (icon +
    name + status badge) and a tab row for Overview / Leads / Drafts /
    Sends. The Drafts tab shows a live pending-count badge in its label
    when there are approvals waiting.
    Each child page drops its redundant H2 header — the shell provides one
    consistent header for the whole deployment, so as more Sales Agent
    businesses come online (each gets the same AgentShell shape) the
    sidebar stays slim.
    Routes now nest:
      /grow/sales/budz            → Overview tab
- **07:18 UTC** — grow: wire command center + Sales Agent overview to live data (`2f8b019`) — 3 files
    GET /api/grow/agents/summary returns one row per Grow agent (id, name,
    status, deployments, pending_approvals, outputs_7d). Sales pulls real
    counts from email_drafts (pending) and email_sends (last 7d); other
    agents return zeros + status='coming_soon' until each lands its
    own data source.
    Frontend:
    - /grow command center swaps illustrative numbers for live ones,
      highlights pending-approval count in yellow when > 0
    - /grow/sales overview shows live status + pending + outputs/7d
      KPI cards alongside the Budz deployment card
- **06:29 UTC** — restructure dashboard around business verticals (Trade / Grow / Edge / Admin) (`b7d1fca`) — 20 files
    Grow becomes a marketing control plane housing 6 specialised agents, not
    a single-business container. Glitch Budz moves under Sales Agent as one
    deployment of many to come.
    Routes
    - /grow → command center listing 6 agents with status + deployment counts
    - /grow/sales → Sales Agent overview; /grow/sales/budz/* keeps existing
      Budz pages (Overview/Leads/Drafts/Sends), with /grow/budz/* → 301
      redirects for any bookmarked URLs
    - /grow/{ads,social,ugc,seo,voice} → placeholder agent overviews using
      the shared AgentOverviewBody primitive (empty states until each agent
- **06:04 UTC** — trade Overview: clickable bot cards with hover state + exec rate bar (`4e79c10`) — 2 files
    Bot cards now navigate to /trade/signals?bot=<name> on click; Signals
    page reads ?bot= from the URL to preselect the filter (and keeps the
    URL in sync as the user changes it). Each card adds an execution-rate
    percent + bar derived from signals_7d / executed_7d, plus a hover
    "view signals →" hint.
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- **05:46 UTC** — trade Overview: live Open Positions + floating PnL hint (`b341873`) — 2 files
    LiveAccountSnapshot now carries total_open_positions, total_open_lots,
    and total_floating_pnl from the cTrader poller. Open Positions card
    swaps to live count (15s refresh); PnL card adds a "floating" hint in
    the sub-line so unrealized exposure is visible alongside the
    DB-aggregated closed PnL.
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- **05:31 UTC** — trade Overview: show live cTrader balance on Account Equity card (`387bc7a`) — 2 files
    Reads from new /api/trade/account/live endpoint (backed by ml_collector's
    30s broker poll → ml_collector_state.live_balance). Falls back to the
    ml_trades snapshot when the live row is missing. Sub-line indicates
    'live Xs ago' vs 'snapshot' so freshness is visible.
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- **05:04 UTC** — add UI primitives, command palette, and sparkline KPIs (`99372ae`) — 12 files
    - New primitives: Card, Section, Sparkline, Skeleton, EmptyState, ErrorState
    - KpiCard: additive `spark` + `delta` props for inline trend visuals
    - Topbar: ⌘K command palette for fast nav across all routes
    - DashboardHome + trade/Overview: switch to Section/Card primitives,
      wire equity/pnl/signals sparklines on trade KPIs (uses new
      /api/trade/series endpoint)
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

## 2026-04-30

- **23:52 UTC** — feat(grow): scaffold Grow vertical with Glitch Budz pages (`d068299`) — 9 files
    src/api/grow.ts — typed client for /api/grow/budz/* (BudzStats, Lead,
    EmailDraft, EmailSend, FunnelRow + paginated callers).
    Pages under src/pages/grow/:
    - Overview.tsx — business picker landing page (Glitch Budz active,
      placeholder for future businesses) with a one-paragraph note about
      HITL flow.
    - budz/Overview.tsx — KPI cards (leads, pending approvals, sends 24h,
      open/reply rate), email-pipeline counts, funnel snapshot table,
      quick-link cards to leads/drafts/sends.
    - budz/Leads.tsx — paginated leads table with status filter, search
- **23:44 UTC** — feat: TableToolbar wired into Settings/Audit, Billing/EmailSignups, Admin/UserManagement (`32dc9b2`) — 4 files
    - pages/Settings.tsx: Audit tab gets the shared toolbar (date range,
      20/50/100 page-size, total count) + shared Pagination component.
    - pages/Billing.tsx: Email Signups section gets the same controls.
      Now actually displays the 3 real signups instead of empty state
      (pre-existing backend column-name bug fixed in companion commit).
    - pages/admin/UserManagement.tsx: both Customers and Audit tabs use
      the shared toolbar + Pagination. Removed the inline prev/next +
      page-counter divs.
    api/endpoints.ts:
    - getAuditLog now takes (page, limit, date_from, date_to).
- **18:57 UTC** — feat: shared TableToolbar + Pagination, wired into every heavy table (`9d52324`) — 8 files
    New components/ui/TableToolbar.tsx:
    - TableToolbar — date-range picker (From / To with auto-clamping +
      X-clear), 20/50/100 page-size selector, optional total count, slot
      for additional filter chips.
    - Pagination — smart page button list (first, last, ±2 around current,
      with ellipses), prev/next.
    - PAGE_SIZE_OPTIONS = [20, 50, 100] exported for callers.
    Pages updated to use the toolbar:
    - pages/trade/Signals.tsx — date range, bot, vote, executed, page-size.
    - pages/trade/Trades.tsx — date range, status, bot, page-size.
- **05:51 UTC** — chore: title, in-app logout, infra log dropdown cleanup (`4cdbed7`) — 3 files
    - index.html: title "OpenClaw — Prop Firm Challenge Monitor" →
      "GlitchExecutor — Admin" (no more legacy product name in browser tab).
    - Topbar logout: was hard-redirecting to https://glitchexecutor.com
      on signout. Now navigates to /login in-app — the AuthGuard already
      pushes you to /login when token clears, but the explicit nav is
      faster than the marketing-site round trip.
    - Infrastructure log viewer: dropdown was offering 'ensemble',
      'telegram-bot', 'executor' (all retired). Replaced with live
      containers: payment, admin-api, dashboard, postgres, redis,
      docker-proxy.
- **05:38 UTC** — feat: admin home shows live Ouroboros KPIs (`b446262`) — 1 file
    DashboardHome.tsx rewrite to consume the new dashboard/kpis fields:
    - Top row: Trade Engine status (with last-signal age), Account Equity
      (with open positions count), Customers, MRR.
    - Second row: Trades Today, Signals Today, Email Signups, Query Cost.
    - Removed dead "Ensemble" KPI card (the engine is gone).
    - Removed dead "Auto-Execute Users" + "Strong Signal Notify" cards
      (telegram bot is retired).
    - Quick actions: replaced "AI Signals & Trades" → "Trade Overview"
      (the deleted /signals route was 404'ing).
    - Recent Activity columns now render trade_open/trade_close events with
- **05:07 UTC** — feat: rebuild around vertical-first layout (TRADE / GROW / ADMIN) (`82d892b`) — 16 files
    Dashboard rebuild focused on the live Ouroboros (cTrader) stack and
    restructured around the three product verticals.
    Sidebar:
    - TRADE (default open): Overview, Bots, Signals, Trades, Oracle, News
    - GROW (placeholder): Overview only — HITL/per-business pages to come
    - ADMIN (default open): Home, Customers, Billing, Infrastructure,
      Control Centre, User Management, Settings
    New pages under src/pages/trade/ — all backed by /api/trade/* against
    the host glitch_ml DB:
    - Overview.tsx — KPI cards, snake-bot grid, active-symbol breakdown

## 2026-04-19

- **20:28 UTC** — chore: add .gitignore (`8ed3742`) — 1 file

## 2026-04-10

- **22:17 UTC** — Initial commit — Glitch Executor platform, dashboard, and website (`6083e0d`) — 37 files
    Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
