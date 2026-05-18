# Changelog — `glitch-admin-dashboard`

Auto-regenerated from `git log` by `/home/support/bin/changelog-regen`,
called before every push by `/home/support/bin/git-sync-all` (cron `*/15 * * * *`).

**Purpose:** traceability. If a push broke something, scan dates + short SHAs
here; then `git show <sha>` to see the diff, `git revert <sha>` to undo.

**Format:** UTC dates, newest first. Each entry: `time — subject (sha) — N files`.
Body text (if present) shown as indented sub-bullets.

---

## 2026-05-18

- **13:15 UTC** — auto-sync: 2026-05-18 13:15 UTC (`b8cbf07`) — 10 files
        M	app/dashboard/(auth)/layout.tsx
        M	app/dashboard/(auth)/sales/page.tsx
        M	app/dashboard/(auth)/website-analytics/page.tsx
        M	app/dashboard/(guest)/layout.tsx
        M	app/dashboard/(guest)/login/page.tsx
        ... (+5 more)
- **13:00 UTC** — auto-sync: 2026-05-18 13:00 UTC (`a8e2472`) — 8 files
        D	app/dashboard/(guest)/login/v2/page.tsx
        M	components/layout/header/search.tsx
        M	components/layout/sidebar/nav-data.ts
        M	lib/api/client.ts
        M	package.json
        ... (+2 more)
- **12:45 UTC** — auto-sync: 2026-05-18 12:45 UTC (`aa051d1`) — 9 files
        M	app/dashboard/(auth)/layout.tsx
        A	app/dashboard/(guest)/login/page.tsx
        D	app/dashboard/(guest)/login/v1/page.tsx
        A	app/dashboard/page.tsx
        A	components/auth/AuthGuard.tsx
        ... (+3 more)
- **12:25 UTC** — chore(ADMIN-V2-INIT): replace Vite SPA with bundui shadcn-ui-kit (Next.js) (`5c6ef24`) — 320 files
    Operator-authorised stack swap. The bundui shadcn-ui-kit-dashboard
    (Next.js 16 App Router, React 19, Tailwind v4, shadcn New York) is
    the new foundation; the prior Vite + react-router-dom SPA is gone.
    Commercial licence held by the operator (purchased via bundui;
    github.com/bundui/shadcn-ui-kit-dashboard private invite).
    Rollback anchor: previous head 191b8f0 (Vite SPA, ADMIN-SETTINGS-REWORK).
    Bulk file movement done via rsync/cp/rm — no source-by-source rewrite
    on the executor side. Kit contents copied from /tmp/bundui-shadcn/
    (cloned fresh, .git scrubbed, lives outside the repo).
    Survived the discard (intentionally preserved)
- **06:26 UTC** — feat(ADMIN-SETTINGS-REWORK): Upstream APIs + grouped env + build info (`191b8f0`) — 3 files
    Operator screenshot called the page "stale" — fair. Old Settings was
    a single panel of 6 env-var checkmarks (some pre-TRIM-1 relics) with
    no other content. Rework: three operator-useful sections, all read-
    only.
    src/pages/system/Settings.tsx
      1. Upstream APIs — live reachability probes (refetch every 30 s)
         of admin_api /health, trade-admin /api/trade-admin/metrics,
         edge-api /api/edge/healthz. 3-AM gold: one glance tells the
         operator which upstream is the problem.
      2. admin_api environment — grouped env-var presence flags from
- **06:08 UTC** — refactor(ADMIN-USERS-TRIM): drop Customers tab from System › User Management (`bb0cf88`) — 1 file
    Operator screenshot showed /system/users with three tabs: Customers /
    Admin Users / Audit Log. The Customers tab listed customer-user
    accounts (handles, tiers, queries, Stripe IDs) — pre-v1.4 IA relic.
    Customer users belong to their owning vertical per the v1.4 ownership
    rule (Trade · Users is the live surface; Grow + Edge get their own
    when the upstream operator APIs ship). System › Users carries
    admin/operator accounts only.
    src/pages/system/UserManagement.tsx
      Cut from 477 → 268 LOC.
      Removed: CustomersTab function, BulkBar helper, exportCsv helper,
- **05:55 UTC** — feat(ADMIN-INFRA-1b): /system/server-map page + sidebar entry (SPA surface) (`937a837`) — 10 files
    SPA surface for the SERVER_*.md system map ingest landed in INFRA-1a.
    Per docs/INFRA_VIEW_PLAN.md §4 + §5.
    New files
      src/api/infraDocs.ts
        Typed client for the three admin_api endpoints landed in 1a:
        listInfraDocs() / getInfraDoc(slug) / syncInfraDocs(). Same
        bearer-JWT auth via the shared api/client.
      src/pages/system/ServerMap.tsx
        Route component for /system/server-map and /system/server-map/:slug.
        Reads all 14 docs in one call, filters client-side, renders the
- **05:39 UTC** — docs(ADMIN-INFRA-1): plan for ingesting SERVER_*.md system map into admin panel (`2f758f4`) — 1 file
    Deliverable for ADMIN_PANEL_INGEST_PROMPT.md. Covers:
      - Storage model: single infra_docs table on Admin Docker PG16,
        raw GFM markdown body, content-hashed for change detection.
      - Sync: admin_api background asyncio task on a 5-minute cadence
        reading directly from the local /home/support/glitch-trade-app/docs/
        SERVER_*.md checkout; manual "Resync now" button hits
        POST /api/infra-docs/sync.
      - Parser: react-markdown + remark-gfm on the SPA; GFM tables get
        a sortable + filterable wrapper.
      - Search: client-side full-text on the already-fetched docs (total
- **03:48 UTC** — auto-sync: 2026-05-18 03:48 UTC (`bec0ed6`) — 2 files
        M	src/pages/system/Today.tsx
- **03:39 UTC** — feat(ADMIN-DETAILS-1): audit + lead detail drawers (deferred → done) (`bee11db`) — 3 files
    Closes the last actionable ADMIN-family lane: the audit-entry +
    lead-row detail surfaces that were marked v1-deferred in
    docs/customer-mgmt-design.md. Pure UI — no backend work.
    Modal primitive
      src/components/ui/Modal.tsx
        Added a `size` prop ('sm' | 'md' | 'lg' | 'xl') to widen the
        primitive for detail views. Existing default stays at md so
        behaviour is unchanged for any future consumer. Layout switched
        to flex column with max-h-[85vh] so detail bodies scroll inside
        the modal instead of overflowing the viewport.
- **03:34 UTC** — refactor(ADMIN-SETTINGS-1): single-purpose Settings (drop duplicate Users/Audit tabs) (`1c23a4a`) — 1 file
    Continuation of the KPI-1 dedup theme: /system/settings still carried
    three tabs — Users / Audit / Environment — where Users duplicated
    /system/users (UserManagement) and Audit duplicated /system/audit-logs
    (AuditLogs). Both surfaces have had dedicated pages since ADMIN-1b.
    src/pages/system/Settings.tsx
      Was 224 LOC with tab navigation + admin-user list + Add User modal
      + audit log table + env status. Cut to ~95 LOC, single-purpose:
      environment-variable presence flags only.
      Added a small KPI strip (Tracked vars / Present / Missing) so the
      page has the same shape as the rest of the dashboard.
- **03:30 UTC** — auto-sync: 2026-05-18 03:30 UTC (`6f32e43`) — 9 files
        M	src/pages/edge/Betting.tsx
        M	src/pages/edge/Billing.tsx
        M	src/pages/edge/Users.tsx
        M	src/pages/grow/Billing.tsx
        M	src/pages/grow/Overview.tsx
        ... (+3 more)

## 2026-05-17

- **23:29 UTC** — feat(ADMIN-AUTH-1): single-user login polish + deep-link preservation (`c2b1e4e`) — 3 files
    Small follow-on to TRIM-1: complete the dashboard-side of the
    admin@glitchexecutor.com single-user binding. Pure UX, no contract
    changes, no backend work.
    src/pages/Login.tsx
      Email field defaults to admin@glitchexecutor.com.
      Password input auto-focuses on mount (email is pre-filled, so
      the operator can just type their password and hit enter).
      Subtitle clarifies that this is a single-user console.
      New yellow "Session expired" banner when the user lands here
      from AuthGuard's redirect — surfaces the deep link they were
- **23:17 UTC** — refactor(ADMIN-TRIM-1): lock dashboard to business-operator surfaces (single-user model) (`9340f14`) — 3 files
    Operator locked the final sidebar:
      Trade · Business   Revenue / Users / Subscriptions / Billing
      Grow               Overview / Customers / Users / Billing
      Edge               Overview / Betting / Users / Billing
      System             Today / Infrastructure / Control Centre /
                         User Management / Audit Logs / Settings
    And confirmed the single-user binding: "for dashboard there will
    never be any user, bind it to admin@glitchexecutor.com". This trims
    the dashboard to business-operator surfaces only and removes the dead
    email-gating ceremony.
- **23:15 UTC** — auto-sync: 2026-05-17 23:15 UTC (`311b504`) — 34 files
        M	docs/ADMIN_IA.md
        M	src/App.tsx
        M	src/api/grow.ts
        D	src/components/TejasOnly.tsx
        D	src/components/grow/AgentOverviewBody.tsx
        ... (+28 more)
- **22:35 UTC** — feat(ADMIN-SHELLS-1): preview shells for /grow/users /grow/billing /edge/users /edge/billing (`8f263d8`) — 9 files
    Realizes the four deferred placeholder surfaces from RELOC-1 v1.2,
    per the operator clarification that Grow and Edge each have their own
    app + database for users. Each shell is the Ads-BSK-002 preview
    pattern: header card + EmptyState that names the upstream blocker.
    Files
      src/pages/grow/Users.tsx       /grow/users
      src/pages/grow/Billing.tsx     /grow/billing
      src/pages/edge/Users.tsx       /edge/users
      src/pages/edge/Billing.tsx     /edge/billing
    Each shell makes the operator/admin distinction explicit: Grow · Users
- **22:26 UTC** — refactor(ADMIN-RELOC-1): move Customers under Grow, Billing under Trade (`7c69927`) — 11 files
    Per the operator confirmation of the v1.1 ownership rule
    ("admin dashboard should be divided between trade grow edge where
    under them they will be having there own database like user, billing
    and all and then there will be a system section where all info
    related to our server like health logs and all"), physically move
    the two transitional surfaces from System to their owning verticals.
    Investigation of `Billing.tsx` confirmed the data is pure Trade-SaaS
    subscriber billing (admin_api `/api/billing/*` reads from
    `customers` table with starter/pro/elite tiers at $49/$149/$349 —
    MRR / ARR / plan counts / email signups). Trade is the right home.
- **22:15 UTC** — auto-sync: 2026-05-17 22:15 UTC (`f25a27a`) — 2 files
        M	docs/ADMIN_IA.md
- **22:05 UTC** — refactor(ADMIN-1g): rename /trade/legacy → /trade/engine (`f01ca0f`) — 5 files
    Final step of the locked ADMIN_IA six-ticket sequence. Per the IA
    audit table: the path name "legacy" was misleading — the
    TejasOnly-gated Overview at /trade/legacy renders the *current* Trade
    engine internals, not a deprecated one. Rename to /trade/engine so
    the URL matches what the surface actually is, and keep the old path
    working as a redirect for any in-flight bookmarks.
    Route + nav
      src/App.tsx
        New: /trade/engine → TejasOnly(TradeOverview).
        /trade/legacy now <Navigate to="/trade/engine" replace />.
- **21:58 UTC** — feat(ADMIN-1f): wire Audit Logs + Customers Leads to live admin_api (`136d346`) — 3 files
    Per docs/ADMIN_IA.md §5 ADMIN-1f: replace the two pre-app-era stubs
    (32-LOC AuditLogs, 13-LOC customers/Leads) with real implementations
    backed by endpoints that already exist on admin_api. Read-only,
    intra-repo.
    System › Audit Logs
      src/pages/system/AuditLogs.tsx
        Was a 30-line EmptyState. Now: paginated table sourced from
        GET /api/settings/audit (existing endpoint over the audit_log
        table joined to admin_users for actor email). Columns: time,
        actor, action, target type/id, details (truncated JSON with
- **21:34 UTC** — feat(ADMIN-1e): split /edge vs /edge/betting + wire edge-api health (`b263a93`) — 9 files
    Per docs/ADMIN_IA.md §5 ADMIN-1e: cleanly separate the platform-health
    Overview from the betting accounts/positions surface and wire the
    admin dashboard to glitch-edge-api for the read-only health endpoints
    that exist today.
    Routes
      /edge          → EdgeOverview (platform health, env, deeper-surface link)
      /edge/betting  → EdgeBetting  (accounts/strategies/EV signals — placeholder
                                     until an admin /v1/admin/* layer lands on
                                     edge-api)
    Pages
- **21:22 UTC** — feat(ADMIN-1d): Grow agent shells (Ads first; Social/UGC/SEO/Voice parity) (`f911703`) — 13 files
    Per docs/ADMIN_IA.md §3/§5 and the 2026-05-17 ADMIN-1d ruling: bring
    the Grow control-plane shape out of stub territory by giving each
    agent the same Overview pattern Sales already had, and build the first
    deployment sub-shell for the Ads agent (BSK-002 wedge — Shopify D2C
    India) as the canonical per-agent entry structure. Read-only; no
    backend work; no Grow product app changes.
    Ads (full shell — active commercial wedge)
      src/pages/grow/ads/Overview.tsx
        Rewritten: wires growAgentsSummary, real metrics
        (status / pending / outputs / deployments), description names the
- **21:12 UTC** — fix(ADMIN-1c): drop System › Customers card from Today (`6ac6671`) — 1 file
    The 2026-05-17 supervisor clarification on the admin-dashboard
    ownership model places customer / billing / user state under the
    owning vertical (Trade / Grow / Edge), not under System. The
    "Customers" surface-entry card on Today therefore contradicted the
    clarified taxonomy — promoting business-operational data as a System
    surface in the operator's "where do I go next?" grid.
    Replace it with a System self-card pointing at /system/control-centre
    (global toggles, kill switches, infra board, audit log). Keeps the
    4-card layout balanced and aligns the System self-reference with
    shared platform/ops, which is what System is actually for.
- **21:09 UTC** — feat(ADMIN-1c): rebuild / as System > Today (`3f5f00e`) — 6 files
    Per docs/ADMIN_IA.md §1: the dashboard root is the System overview,
    not a Trade page. The pre-app-era DashboardHome mixed Trade engine
    KPIs (engine status, account equity, trades/signals today), customer
    state (totals, tiers, MRR/ARR, email signups), and infra cost into
    one landing card grid, which violated the IA's ownership-boundary
    appendix.
    Replaced with `src/pages/system/Today.tsx`:
    - Alerts strip (cross-product, from existing /api/dashboard/alerts).
    - Infra heartbeat — services up/down count (lists the failing ones
      inline) + CPU/Memory/Disk progress bars (from existing
- **20:55 UTC** — refactor(ADMIN-1b): rename admin/* -> system/* + retire dead pages (`817300f`) — 18 files
    Structural cleanup per docs/ADMIN_IA.md §ADMIN-1b. No behaviour
    change, no broad rewrite.
    - Move pages/admin/* and root-level Billing/Infrastructure/Settings
      into pages/system/ (10 file renames).
    - Delete pages/Clients.tsx + pages/ClientDetail.tsx; the /clients
      redirect already points at /system/customers.
    - App.tsx: imports + routes renamed to /system/*; legacy redirects
      added for /billing, /infrastructure, /settings, /admin/customers*,
      /admin/control-centre, /admin/users, /admin/audit-logs so
      bookmarks and external links keep working.
- **20:47 UTC** — docs(ADMIN-1a): lock admin-dashboard IA + stale-page audit (`13ea4e0`) — 1 file
    First locked artifact for the admin-dashboard rewrite. Defines the
    top-level control-panel shape as four peer surfaces (Trade / Grow /
    Edge / System), audits every current route as keep/rename/build-out/
    retire, calls out the pre-app-era pages (Clients/ClientDetail/
    DashboardHome/Billing/Infrastructure/Settings + the agent and edge
    stubs), and sequences the next six tickets (ADMIN-1b…1g). No source
    edits in this ticket — folder moves and rebuilds start in 1b.

## 2026-05-16

- **22:39 UTC** — feat(api): make API base configurable for CF Pages deployment (`cead3b3`) — 3 files
    When the SPA moves to Cloudflare Pages, dashboard.glitchexecutor.com
    serves the static bundle from CF's edge — admin_api still runs on the
    host, so the SPA needs a separate hostname to reach it.
    Adds VITE_API_BASE env override (defaults to
    https://admin-api.glitchexecutor.com) used by both axios and the
    WebSocket hook. JWT bearer auth is in a header not a cookie, so the
    cross-origin XHR just works once admin_api's CORS allows the SPA
    origin (already does — dashboard.glitchexecutor.com is whitelisted).
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- **22:25 UTC** — feat(trade-admin): wire Revenue/Users/Subscriptions to /api/trade-admin proxy (`d7e4762`) — 4 files
    Adds src/api/tradeAdmin.ts with typed clients for the three admin_api proxy
    endpoints (metrics / users / subscriptions). The proxy injects the
    TRADE_ADMIN_API_SECRET header server-side so the SPA bundle stays secret-free.
    Revenue: MRR, paid/free split, churn, trial conv + per-tier breakdown.
    Users: paginated table with email search, tier + status badges, activity
    counts (accounts, replays, last seen).
    Subscriptions: status-filtered table with KPIs (active/past_due/cancel
    pending/cancelled-30d) + Stripe-dashboard deep links per row.
    All three use React Query with 60s polling and shared cache keys.
    Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- **22:04 UTC** — feat(admin): Trade · Business surface + gate legacy engine views to operator email (`745cbbc`) — 4 files
    Per request, the admin dashboard now focuses on business operations
    for trade.glitchexecutor.com. Two-part structure:
    1. **Trade · Business** (open to all admins)
       New section, three placeholder routes wired to sidebar:
       - /trade/revenue        → MRR, active subs, churn, trial conversion
       - /trade/users          → all signed-up users + sub state + activity
       - /trade/subscriptions  → per-subscription row browser (status filters)
       Each page renders the layout + headline KPI tiles ("—" placeholders)
       + an EmptyState explaining what /v1/admin/* endpoint feeds it. The
       trade-api side is the next ship; this commit lays the SPA route
- **22:00 UTC** — auto-sync: 2026-05-16 22:00 UTC (`eb11140`) — 4 files
        M	src/App.tsx
        A	src/components/TejasOnly.tsx
        M	src/components/layout/AppSidebar.tsx
- **03:00 UTC** — dashboard: shadcn/ui foundation + OKLCH theme system + light/dark toggle (`3e87abf`) — 48 files
    Brings the admin dashboard in line with the Glitch Edge app's design
    language without rebuilding any business logic.
    Tokens & theming
    - New src/styles/tokens.css with OKLCH-based :root (light) + .dark
      blocks for the full shadcn semantic palette (background / foreground
      / card / popover / primary / secondary / muted / accent / destructive
      / border / input / ring / chart-1..5 / sidebar*). Brand green stays
      the primary accent in both themes — brighter in dark, gently muted
      in light so it stays readable on white surfaces.
    - tailwind.config.ts exposes each token as a utility colour and keeps

## 2026-05-13

- **03:30 UTC** — admin/customers: Grow buyer management surface (`81f4a36`) — 13 files
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
