# ADMIN_IA — Glitch Admin Dashboard Information Architecture

Status: **LOCKED v1.4** (2026-05-17 — TRIM-1: scope locked to business-operator surfaces; single-user model)
Owner: Tejas
Scope: ADMIN-1a — define the control-panel shape, audit current pages, and
sequence the rewrite. No source edits in this ticket.

History:
- v1 (2026-05-17) — original lock under ADMIN-1a.
- v1.1 (2026-05-17) — reconciled with the **2026-05-17 supervisor
  ownership clarification**: business-operational data belongs under
  its owning vertical, not under System. Customers + Billing were
  marked **transitional**.
- v1.2 (2026-05-17) — `ADMIN-RELOC-1` shipped the relocation.
  `/system/customers/*` moved to `/grow/customers/*`; `/system/billing`
  moved to `/trade/billing`. Transitional tags removed. Legacy paths
  redirect for bookmark survival.
- v1.3 (2026-05-17) — `ADMIN-SHELLS-1` shipped the four deferred
  preview shells: `/grow/users`, `/grow/billing`, `/edge/users`,
  `/edge/billing`. Per the operator's clarification that Grow and
  Edge each have their own app + database for users, these surfaces
  now hold space in the IA, modeled on the Ads BSK-002 preview
  pattern. Each shell is an EmptyState that names the upstream
  blocker (operator API on the respective app).
- v1.4 (2026-05-17) — `ADMIN-TRIM-1` locked the admin dashboard's
  scope to **business-operator surfaces only** and the **single-user
  model**. Operator final sidebar spec:
  Trade · Business / Grow / Edge / System (4 peer groups). Trade ·
  Engine internals (Bots / Signals / Trades / Oracle / News / engine
  cockpit) and the Grow per-agent shells (Sales / Ads / Social / UGC
  / SEO / Voice) were **removed entirely** — they live elsewhere,
  not in the admin console. The dashboard binds to
  `admin@glitchexecutor.com` as the sole user (SSO-side enforcement);
  the previous `OPERATOR_EMAIL` / `gateEmail` / `<TejasOnly>`
  machinery was dropped as dead ceremony.

This file is the contract the rest of the admin-dashboard rewrite is built
against. Subsequent ADMIN tickets (1b, 1c, …) must either conform to this
IA or update it explicitly.

---

## 1. Top-level control-panel shape

The dashboard is the operator console for **four business surfaces**.
They are peers — not nested, not collapsible into one "agents" group.

| # | Surface | Purpose                                              | Audience            |
|---|---------|------------------------------------------------------|---------------------|
| 1 | Trade · Business | Glitch Trade SaaS operator console — revenue / customer-users / subscriptions / billing | sole admin |
| 2 | Grow             | Glitch Grow operator console — paid buyers, Grow customer-users, Grow billing | sole admin |
| 3 | Edge             | Glitch Edge operator console — platform health, betting accounts, Edge customer-users, Edge billing | sole admin |
| 4 | System           | Shared platform/ops — Today, infrastructure, control centre, admin/operator users, audit logs, settings | sole admin |

**Single-user model (v1.4).** The dashboard binds to
`admin@glitchexecutor.com` as the sole user. Multi-user audience
distinctions in earlier versions of this table (gated engine
surfaces, per-brand operator scoping) are no longer relevant; the
"Audience" column reads *sole admin* across the board. SSO-side
enforcement that only that one account can authenticate is upstream
in `glitchexecutor-sso.service`.

**Scope rule (v1.4).** The admin dashboard carries
**business-operator surfaces only**. Trade engine internals (Bots /
Signals / Trades / Oracle / News) and the per-agent Grow shells
(Sales / Ads / Social / UGC / SEO / Voice) are NOT part of the admin
dashboard — they live in the Trade and Grow apps themselves.

**Ownership rule** (codified 2026-05-17, v1.1 reconciliation):
business-operational data — customer accounts, customer billing,
customer subscriptions, lead pipelines, per-vertical revenue —
**belongs under its owning vertical**, not under System. System
carries cross-product platform/ops only: health, logs, alerts,
queues, runtime visibility, infrastructure status, admin (operator)
users, audit log, global control toggles, settings.

`ADMIN-RELOC-1` (2026-05-17) shipped the relocation:
`/system/customers/*` → `/grow/customers/*` (Grow is the primary
buyer source today); `/system/billing` → `/trade/billing` (the data
is Trade-SaaS subscriber billing — MRR / ARR / plans / signups).
The old `/system/*` paths redirect to the new locations so bookmarks
keep working. See §6 for the full move log and the deferred
`/grow/users`, `/grow/billing`, `/edge/users`, `/edge/billing`
shells that future lanes can add when their backends ship.

Rename note: today's sidebar labels the 4th group **"Admin"**. Lock the
new name **"System"** to free the word "Admin" for the *role* (versus
"Operator"), and to make the surface boundary read as a peer of Trade /
Grow / Edge rather than a meta-layer above them.

The dashboard root (`/`) is the **System overview** — a cross-surface
"today" view (alerts, top-line MRR per vertical, infra heartbeat, recent
activity across all four). It is *not* a Trade-only page; today's
`DashboardHome.tsx` violates this.

### Within each surface

Every surface follows the same shape:

```
/<surface>
   ├── Overview           ← landing tab; live data, no scaffolds
   ├── <Feature 1>        ← one route per first-class noun
   ├── <Feature 2>
   └── ... (sub-tabs only where a feature has its own state machine,
            e.g. Grow › Sales › Budz › {Leads, Drafts, Sends})
```

Within-surface depth cap: **3 levels max** (`/grow/sales/budz/leads`
exists; deeper is a smell). Anything deeper goes in-page (tabs, drawers).

---

## 2. Target sidebar IA

The sidebar lists the four surfaces top-down, each with a small flat
group of routes. Engine-internals stay grouped under Trade and gated to
`OPERATOR_EMAIL`.

```
Trade · Business           (all admins)
   Revenue
   Users
   Subscriptions

Trade · Engine (personal)  (gated to OPERATOR_EMAIL)
   Overview
   Bots / Signals / Trades / Oracle / News

Grow                       (all admins; per-brand scoping later)
   Overview
   Sales Agent
   Ads Agent
   Social Agent
   UGC Agent
   SEO Agent
   Voice Agent

Edge                       (all admins)
   Overview / Betting

System                     (renamed from "Admin")
   Today           ← /
   Infrastructure  ← service heartbeat board
   Control Centre  ← global toggles, kill switches
   User Management ← admin (operator) accounts + roles
                     · NOT customer users — those belong to the
                     owning vertical (e.g. /trade/users)
   Audit Logs
   Settings
```

Trade · Business now also carries **Billing** (moved from System in
RELOC-1). Grow now also carries **Customers** (moved from System in
RELOC-1) as the second item under Overview.

The "Trade · Engine (personal)" gate is the only `gateEmail` group.
Everything else is visible to every admin; per-brand scoping inside
Grow is a *filter*, not an IA change.

---

## 3. Current routes — audit table

Page → keep / rename / merge / retire. File paths are relative to
`src/pages/`. Sizes are line counts at the time of this audit.

| Current path | File | Lines | Decision | Notes |
|--------------|------|------:|----------|-------|
| `/` | `DashboardHome.tsx` | 191 | **Rebuild (rename)** | Today's home queries a pre-app-era unified `/api/kpis` and mixes Trade engine + customers + MRR. Rebuild as **System › Today**, sourcing each KPI from the relevant vertical API. Stop linking to `/trade` and `/clients` (legacy paths). |
| `/login` | `Login.tsx` | 87 | **Keep** | Auth gate; SSO-backed. No structural change. |
| `/billing` | `Billing.tsx` | 124 | **Moved → `trade/Billing`** *(RELOC-1, v1.2)* | Lives at `pages/trade/Billing.tsx`; route `/trade/billing`. Data is Trade-SaaS subscriber billing (MRR / ARR / plans / email signups). `/system/billing` and `/billing` redirect here. |
| `/infrastructure` | `Infrastructure.tsx` | 159 | **Rename → `system/Infrastructure`** | Move; otherwise keep. Source of truth is `/home/support/glitch-infra/README.md` — make sure cards match. |
| `/settings` | `Settings.tsx` | 224 | **Rename → `system/Settings`** | Move; review for stale fields tied to the legacy `admin_api`. |
| `/admin/control-centre` | `admin/ControlCentre.tsx` | 323 | **Rename → `system/ControlCentre`** | Largest System page; keep behaviour, just move the file. |
| `/admin/users` | `admin/UserManagement.tsx` | 477 | **Rename → `system/UserManagement`** | Same. |
| `/admin/audit-logs` | `admin/AuditLogs.tsx` | 32 | **Build out (rename)** | Stub today. Move to `system/AuditLogs` and wire to real audit feed (admin_api → SSO action log). |
| `/admin/customers` (index) | `grow/customers/Buyers.tsx` | 136 | **Moved → `grow/customers`** *(RELOC-1, v1.2)* | Lives at `pages/grow/customers/Buyers.tsx`; route `/grow/customers`. Canonical buyer surface for Grow. `/system/customers`, `/admin/customers`, `/clients` all redirect here. |
| `/admin/customers/leads` | `grow/customers/Leads.tsx` | 145 | **Moved + built out** *(RELOC-1, v1.2)* | Lives at `pages/grow/customers/Leads.tsx`; route `/grow/customers/leads`. Defensive table over `/api/customers/leads` per ADMIN-1f. |
| `/admin/customers/buyers/:paymentId` | `grow/customers/BuyerDetail.tsx` | 252 | **Moved** *(RELOC-1, v1.2)* | Lives at `pages/grow/customers/BuyerDetail.tsx`; route `/grow/customers/buyers/:paymentId`. |
| `/admin/customers/*` layout | `grow/customers/Layout.tsx` | 53 | **Moved + simplified** *(RELOC-1, v1.2)* | Vertical-tab row (Grow/Edge/Trade, last two disabled) removed in the move — Edge + Trade buyer surfaces live under their own verticals per the ownership rule, not as tabs under Grow Customers. Just Buyers/Leads sub-tabs remain. |
| `/clients`, `/clients/:id` | (redirect only) | — | **Keep redirect, retire backing files** | Backing pages `Clients.tsx` (128) and `ClientDetail.tsx` (251) are no longer imported. Redirects in `App.tsx` already point to `/admin/customers`. Delete the dead files. |
| `/trade` (redirect) | — | — | **Keep** | Redirects to `/trade/revenue`. Correct. |
| `/trade/revenue` | `trade/Revenue.tsx` | 109 | **Keep** | Placeholder UI; awaiting trade-api `/v1/admin/revenue`. |
| `/trade/users` | `trade/Users.tsx` | 132 | **Keep** | Same — awaiting `/v1/admin/users`. |
| `/trade/subscriptions` | `trade/Subscriptions.tsx` | 157 | **Keep** | Same — awaiting `/v1/admin/subscriptions`. |
| `/trade/legacy` | `trade/Overview.tsx` | 247 | **Keep (gated)** | Operator-only engine cockpit. The path name "legacy" is misleading — these are the *current* engine internals. Consider renaming the route to `/trade/engine` later; not in scope for ADMIN-1a. |
| `/trade/bots` | `trade/Bots.tsx` | 70 | **Keep (gated)** | Engine internals. |
| `/trade/signals` | `trade/Signals.tsx` | 151 | **Keep (gated)** | Engine internals. |
| `/trade/trades` | `trade/Trades.tsx` | 134 | **Keep (gated)** | Engine internals. |
| `/trade/oracle` | `trade/Oracle.tsx` | 265 | **Keep (gated)** | Engine internals. |
| `/trade/news` | `trade/News.tsx` | 102 | **Keep (gated)** | Engine internals. |
| `/grow` | `grow/Overview.tsx` | 104 | **Keep** | Command-centre overview; already wired to live data. |
| `/grow/sales` | `grow/sales/Overview.tsx` | 47 | **Keep** | Tabified Budz launcher. |
| `/grow/sales/budz` (+ tabs) | `grow/sales/budz/{Layout,Overview,Leads,Drafts,Sends}.tsx` | 484 total | **Keep — use as the pattern** | This is the only fully-built agent sub-surface. Treat its `Layout` + tab pattern as the template for every other Grow agent. |
| `/grow/ads` | `grow/ads/Overview.tsx` | 17 | **Build out** | 17-line scaffold. Replicate Budz layout. Backed by Ads Agent (Phase 1 wedge per `glitch_grow_commercial_direction`). |
| `/grow/social` | `grow/social/Overview.tsx` | 17 | **Build out** | Scaffold. |
| `/grow/ugc` | `grow/ugc/Overview.tsx` | 17 | **Build out** | Scaffold. |
| `/grow/seo` | `grow/seo/Overview.tsx` | 17 | **Build out** | Scaffold. |
| `/grow/voice` | `grow/voice/Overview.tsx` | 17 | **Build out** | Scaffold. |
| `/grow/budz/*` (redirect) | — | — | **Keep** | Redirects to `/grow/sales/budz/*`. Correct. |
| `/edge`, `/edge/betting` | `edge/Overview.tsx` | 42 | **Build out** | Both routes render the same 42-line stub. Split: `/edge` = Overview, `/edge/betting` = the betting-account surface backed by `glitch-edge-api`. |

Counts: **keep 14, keep-with-rename 7, build-out 7, retire 2 (with redirects already in place).**

---

## 4. Stale pre-app-era pages — explicit list

These are pages written before the dashboard was restructured around the
Trade / Grow / Edge / System verticals (commit `b7d1fca`, 2026-05-13).
They either no longer match the IA or query collapsed backends.

| File | Why stale | Action |
|------|-----------|--------|
| `src/pages/Clients.tsx` | Replaced by `admin/customers/Buyers.tsx`. Not imported anywhere in `App.tsx`. The `/clients` route already redirects. | **Delete file** in ADMIN-1b. |
| `src/pages/ClientDetail.tsx` | Replaced by `admin/customers/BuyerDetail.tsx`. Not imported. `/clients/:id` already redirects. | **Delete file** in ADMIN-1b. |
| `src/pages/DashboardHome.tsx` | Pulls a single `/api/kpis` (pre-vertical-split backend), hard-codes Trade engine cards on what should be a System surface, and CTA-links to `/trade` and `/clients` (legacy paths). | **Rebuild** in ADMIN-1c as `system/Today.tsx`, sourcing each card from the surface that owns it. |
| `src/pages/Billing.tsx` | Single billing page conceived when there was one revenue stream. Pre-split. | **Rename + re-scope** to *platform* billing under `system/Billing`; per-vertical revenue lives under each surface. |
| `src/pages/Infrastructure.tsx` | Cross-cutting, but lives at the dashboard root rather than under System. File location is the bug, not the content (mostly). | **Move** to `system/Infrastructure`. Verify it still matches `glitch-infra/README.md`. |
| `src/pages/Settings.tsx` | Same: lives at root, should be under System. May still reference deprecated `admin_api` config fields. | **Move + audit** field-by-field. |
| `src/pages/admin/AuditLogs.tsx` | 32-line stub from the pre-app era; never wired to a real audit feed. | **Replace** with a real implementation. |
| `src/pages/admin/customers/Leads.tsx` | 13-line stub. The leads pipeline now lives upstream in Grow › Sales (Budz). | **Replace** — render the cross-Grow lead aggregate. |
| `src/pages/grow/{ads,seo,social,ugc,voice}/Overview.tsx` | All 17-line scaffolds carried over from the initial Grow scaffold commit (`d068299`). Look "post-app-era" only because the directory layout is new; the *content* is pre-agent-build. | **Build out** using the Budz Layout pattern. |
| `src/pages/edge/Overview.tsx` | Single 42-line stub serving both `/edge` and `/edge/betting`. Predates `glitch-edge-api`. | **Split + wire to API.** |

---

## 5. Implementation sequence — status

Sequenced for minimum churn — folder moves first, then dead-code delete,
then build-outs. **All six tickets shipped 2026-05-17.**

| Ticket | Title | Status | Commit |
|--------|-------|--------|--------|
| **ADMIN-1b** | Rename `pages/admin/*` → `pages/system/*`, drop dead files | ✅ done | `817300f` |
| **ADMIN-1c** | Rebuild `/` as **System › Today** | ✅ done | `3f5f00e` + `6ac6671` |
| **ADMIN-1d** | Build out Grow agent shells (Ads first; Social/UGC/SEO/Voice parity) | ✅ done | `f911703` |
| **ADMIN-1e** | Split `/edge` vs `/edge/betting` and wire to `glitch-edge-api` | ✅ done | `b263a93` |
| **ADMIN-1f** | Audit Logs + Customers Leads build-out | ✅ done | `136d346` |
| **ADMIN-1g** | Rename `/trade/legacy` → `/trade/engine` | ✅ done | `f01ca0f` |

Do **not** start the broad UI rewrite (theme polish, density pass,
component-library sweep) until the operator explicitly opens that
lane. The Customers + Billing relocation under the v1.1 ownership
rule (see §6) is a separate lane and is **not** part of this
sequence.

---

## Appendix — invariants

These hold across every ticket above:

- **Surfaces are peers.** No "Apps" parent group above Trade / Grow / Edge.
- **The dashboard root is System › Today**, not a Trade page.
- **Operator-gated routes live behind `<TejasOnly>` *and* the sidebar
  `gateEmail` filter.** Both layers must be set; route guard alone is
  not enough because the link would still render.
- **Within-surface depth ≤ 3.** Push further nesting into in-page tabs.
- **Ownership rule (v1.1, 2026-05-17):** business-operational data
  — customer accounts, customer billing, customer subscriptions,
  lead pipelines, per-vertical revenue — lives under its owning
  vertical. System carries shared platform/ops only (health, logs,
  infra, audit, admin/operator users, control toggles, settings).
  *Customer* users and *admin* users are distinct: customer users
  belong to the vertical that sold them (e.g. `/trade/users`); admin
  users stay under `/system/users`.
- **Per-vertical Revenue lives under that vertical**, not under System
  › Billing. System › Billing is platform-level only (subsumed under
  the ownership rule above).
- **Stub pages are tracked in this doc**, not silently shipped. If a
  new scaffold lands, it must appear in §4 with an action.

---

## 6. Reconciliation log

This section records every change to this IA after its initial lock.
Entries are in reverse-chronological order.

### 2026-05-17 — v1.4 TRIM-1 (scope locked to business-operator surfaces; single-user model)

**Trigger.** Operator locked the final sidebar:

```
Trade · Business   Revenue / Users / Subscriptions / Billing
Grow               Overview / Customers / Users / Billing
Edge               Overview / Betting / Users / Billing
System             Today / Infrastructure / Control Centre /
                   User Management / Audit Logs / Settings
```

And confirmed the single-user binding: *"for dashboard there will
never be any user, bind it to admin@glitchexecutor.com"*. The
combination collapses two things at once:

1. **Trade · Engine internals** (Bots / Signals / Trades / Oracle /
   News / engine cockpit) and the **6 Grow agent shells** (Sales /
   Ads / Social / UGC / SEO / Voice) are **not part of the admin
   dashboard**. They live elsewhere (the Trade and Grow apps
   themselves).
2. The dashboard binds to **admin@glitchexecutor.com** as the sole
   user. Every email-based gate (`OPERATOR_EMAIL`, `gateEmail`,
   `<TejasOnly>`) becomes dead ceremony.

**What was deleted.**

*Files (24 deletions)*

| Group | Files |
|-------|-------|
| Trade · Engine | `src/pages/trade/{Overview,Bots,Signals,Trades,Oracle,News}.tsx` |
| Grow · Sales agent | `src/pages/grow/sales/Overview.tsx` + `src/pages/grow/sales/budz/{Layout,Overview,Leads,Drafts,Sends}.tsx` |
| Grow · Ads agent | `src/pages/grow/ads/Overview.tsx` + `src/pages/grow/ads/bsk002/{Layout,Overview,Campaigns,Creatives,Reports}.tsx` |
| Grow · Other agents | `src/pages/grow/{social,ugc,seo,voice}/Overview.tsx` |
| Grow agent shell components | `src/components/grow/{AgentShell,AgentOverviewBody}.tsx` |
| Dead gating | `src/components/TejasOnly.tsx` |

Plus the corresponding subdirectories (`pages/trade/*` keeps only its
Business pages; `pages/grow/sales`, `pages/grow/ads`, `pages/grow/social`,
`pages/grow/seo`, `pages/grow/ugc`, `pages/grow/voice` directories all gone).

*Routes (App.tsx)*

Removed: `/trade/engine`, `/trade/legacy`, `/trade/bots`,
`/trade/signals`, `/trade/trades`, `/trade/oracle`, `/trade/news`,
`/grow/sales`, `/grow/sales/budz/*` (5 routes), `/grow/ads`,
`/grow/ads/bsk002/*` (5 routes), `/grow/social`, `/grow/ugc`,
`/grow/seo`, `/grow/voice`, plus the `/grow/budz/*` legacy
redirects (target was deleted).

*Sidebar (AppSidebar.tsx)*

- Removed the entire `Trade · Engine (personal)` group.
- Trimmed Grow group from 10 items to 4: Overview / Customers /
  Users / Billing.
- Removed `OPERATOR_EMAIL` constant, `gateEmail` field, and
  `FilteredNavGroups` filter function — single-user model means no
  gating is needed.

*Chrome*

- `Layout.tsx` PAGE_TITLES: removed all `/trade/engine`,
  `/trade/bots`, `/trade/signals`, `/trade/trades`, `/trade/oracle`,
  `/trade/news` and all `/grow/sales*`, `/grow/ads*`, `/grow/social`,
  `/grow/ugc`, `/grow/seo`, `/grow/voice` entries. Added the four
  missing `/trade/*` Business entries (Revenue / Users / Subscriptions)
  alongside the existing Billing.
- `CommandPalette.tsx`: rebuilt from 33 commands → 20. Every
  surface in the new sidebar has a palette entry; no commands point
  at deleted routes.
- `Today.tsx`: Grow surface-card body updated from *"Per-brand AI
  agents — Sales, Ads, Social, UGC, SEO, Voice"* → *"Paid buyers,
  customer-user database, and Grow-side billing"*.
- `src/pages/grow/Overview.tsx`: rebuilt. Was the agent grid driven
  by `growAgentsSummary`; now a slim landing showing the three deep
  Grow surfaces (Customers / Users / Billing) as cards. No more
  agent content.

*API client (`src/api/grow.ts`)*

- Removed: `BudzStats`, `Lead`, `EmailDraft`, `EmailSend`,
  `FunnelRow`, `GrowAgentId`, `GrowAgentStatus`, `GrowAgentSummary`
  types; `budzStats`, `budzLeads`, `budzDrafts`, `budzSends`,
  `budzFunnel`, `growAgentsSummary` functions.
- Kept: the Customer-management types and functions (Buyer,
  BuyerDetail, customers*) — those back the surviving Grow surfaces.

**Single-user model — what the dashboard side carries.**

- No hard-coded operator email anywhere in the codebase.
- `AuthGuard` still gates every route on `token` presence — the
  token must come from SSO at `glitchexecutor-sso.service`.
- The `user.email` displayed in the sidebar footer is whatever SSO
  returns. Effective enforcement that *only* `admin@glitchexecutor.com`
  can authenticate is **SSO-side** (cross-repo; out of this lane's
  scope). When that enforcement lands, no dashboard change is needed.

**Verification** (skill `superpowers:verification-before-completion`)
- `vite build` clean (`✓ built in 11.16s`).
- Bundle dropped from 300.25 → 287.67 kB gzip (**−12.58 kB**) thanks
  to the deletions. Modules transformed: 2954 → 2932.
- Grep audit confirms no remaining references to the deleted
  surfaces (no imports, no Route definitions, no PAGE_TITLES
  entries, no palette commands).
- Per the verification-policy memory, this is a deletion + sidebar
  lane with no public writes, no auth edge cases, no OAuth, no
  state-change risk; closes on clean build + audit.

**Out of scope (held).**
- SSO-side enforcement of `admin@glitchexecutor.com` as the sole
  account (cross-repo — lives in `glitchexecutor-sso.service`).
- Trade · Business surface implementations (`/trade/revenue`,
  `/trade/users`, `/trade/subscriptions`) are still placeholders
  awaiting `/v1/admin/*` on trade-api; `/trade/billing` is live
  today against admin_api. None of those changed in this lane.

### 2026-05-17 — v1.3 SHELLS-1 shipped (per-vertical user + billing preview shells)

**Trigger.** Operator follow-on after RELOC-1: "okay go ahead" on
the standing offer to build the four deferred placeholder shells
documented in v1.2's §6. Direct realization of the operator's
earlier clarification that *"grow and edge have their own app, own
database for users"*.

**What shipped.** Four single-file preview shells modeled on the Ads
BSK-002 template — header card + EmptyState that names the upstream
blocker:

- `src/pages/grow/Users.tsx`    → `/grow/users`
- `src/pages/grow/Billing.tsx`  → `/grow/billing`
- `src/pages/edge/Users.tsx`    → `/edge/users`
- `src/pages/edge/Billing.tsx`  → `/edge/billing`

Each makes the operator/admin distinction explicit:
*Grow · Users* and *Edge · Users* are operator views of the
**customer-user databases owned by those apps**, not admin operators
(those still live at `/system/users`).

*Routes (`App.tsx`).* Four new live routes wired under the Grow and
Edge groups. No new redirects needed (these paths didn't exist
before).

*Sidebar (`AppSidebar.tsx`).*
- **Grow** group: new Users + Billing items, placed right after
  Customers so the business-operator items (Customers / Users /
  Billing) sit together above the agent shells.
- **Edge** group: new Users + Billing items, after Betting.

*Chrome.* `Layout.tsx` PAGE_TITLES gained four entries
(`Grow · Users`, `Grow · Billing`, `Edge · Users`, `Edge · Billing`).
`CommandPalette.tsx` gained four matching commands.

*IA doc.* Header bumped `v1.2 → v1.3`. History block updated.
v1.2's "Deferred follow-ups" list is now realized; the deferred
candidates section in §6 v1.2 entry is informational history.

**Verification** (skill `superpowers:verification-before-completion`)
- `vite build` clean (`✓ built in 12.52s`); bundle +0.74 kB gzip
  (300.25 vs 299.51) — four small shells.
- Per the verification-policy memory, additive preview shells with
  no data fetches, no public writes, and no auth changes close on
  clean build.

**What did NOT change.**
- No backend / schema work. No operator APIs added; the shells stay
  on EmptyState until those upstream surfaces ship.
- No relocation or rewrite of existing pages. Pure additive.

**Remaining ADMIN-family candidates (NOT auto-promoted):**

- SSO login/logout polish for the admin shell (mirror GROW-SHELL-1).
- Audit + Lead detail pages (deferred at `customer-mgmt-design.md`).
- Cross-repo work for live ads-agent + edge-api operator data is
  outside the ADMIN family and needs explicit reassignment.

### 2026-05-17 — v1.2 RELOC-1 shipped (Customers + Billing physically moved)

**Trigger.** The operator confirmed the v1.1 ownership rule:
*"admin dashboard should be divided between trade grow edge where
under them they will be having there own database like user, billing
and all and then there will be a system section where all info
related to our server like health logs and all should be there"*.
This made `ADMIN-RELOC-1` (which had been a parked follow-on lane)
the next ADMIN lane, with explicit operator answers to the two
flag-don't-rule decisions from the lane proposal:

  1. Billing scope → **move** `/system/billing` to under Trade
     (operator answered "yes" to my "retire-or-move /trade/billing"
     question; investigation of `Billing.tsx` confirmed the data is
     pure Trade-SaaS subscriber billing — MRR / ARR / plan counts /
     email signups — so move-to-Trade was the right call).
  2. `/grow/users` + `/edge/users` shells → operator clarified Grow
     and Edge each have their own app + database for users, so the
     IA structure should hold space for those surfaces; building the
     placeholder shells themselves was deferred to a future small
     lane (see "deferred follow-ups" below).

**What shipped** (`glitch-admin-dashboard@<RELOC-1 commit>`; pushed
to Codeberg + GitLab; GitHub remains suspended).

*File moves (depth-preserving — no import path changes)*
- `src/pages/system/customers/*`  → `src/pages/grow/customers/*`
  (4 files: `Layout`, `Buyers`, `Leads`, `BuyerDetail`).
- `src/pages/system/Billing.tsx`  → `src/pages/trade/Billing.tsx`.

*Internal link updates*
- `grow/customers/Buyers.tsx`: row-click navigates to
  `/grow/customers/buyers/:paymentId` (was `/system/customers/...`).
- `grow/customers/BuyerDetail.tsx`: "Back to buyers" navigates to
  `/grow/customers` (was `/system/customers`).
- `grow/customers/Layout.tsx`: rewritten — dropped the disabled
  Grow/Edge/Trade vertical tab row (Edge/Trade buyer surfaces live
  under their own verticals per the ownership rule, not as tabs
  under Grow Customers). Header re-titled "Grow · Customers" with a
  pointer to where Trade subscribers / Edge accounts live.

*Routes (`src/App.tsx`)*
- New live: `/trade/billing`, `/grow/customers` (index + `leads` +
  `buyers/:paymentId`).
- Redirects added: `/system/customers/*` → `/grow/customers/*`;
  `/system/billing` → `/trade/billing`.
- Legacy redirect targets updated: `/clients`, `/clients/:id`,
  `/admin/customers`, `/admin/customers/leads`, `/billing` all now
  target the new RELOC-1 locations instead of the old `/system/*`
  paths.

*Sidebar (`AppSidebar.tsx`)*
- Trade · Business: new "Billing" item after Subscriptions.
- Grow: new "Customers" item directly under Overview (above Sales
  Agent).
- System: Customers + Billing items dropped. Group comment refreshed
  to spell out the customer-vs-admin user distinction.

*Chrome*
- `Layout.tsx` PAGE_TITLES: removed `/system/customers*` and
  `/system/billing` keys; added `/trade/billing`, `/grow/customers`,
  `/grow/customers/leads`.
- `CommandPalette.tsx`: removed the 3 System commands (Customers /
  Customers · Leads / Billing); added 3 commands under their new
  groups (`Grow · Customers`, `Grow · Customers · Leads`,
  `Trade · Billing`).

**What this IA changed** (this doc)
- Header: `LOCKED v1.1` → `LOCKED v1.2` with the new history entry.
- §1: Ownership-rule block updated — "transitional surfaces" prose
  replaced with the RELOC-1 destinations and a reference to the
  deferred follow-up shells.
- §2: System listing trimmed to platform/ops only. Notes added
  about Trade · Business carrying Billing now, and Grow carrying
  Customers now.
- §3: Five audit-table rows updated — `*(transitional, v1.1)*` tags
  replaced with `*(RELOC-1, v1.2)*` move records.

**Verification** (skill `superpowers:verification-before-completion`)
- `vite build` clean (`✓ built in 11.49s`); bundle unchanged in size.
- Grep audit: the only surviving `/system/customers` and
  `/system/billing` mentions in `src/` are the redirect routes and
  intentional doc comments. All active navigation, sidebar entries,
  page titles, and palette commands point at the new paths.
- Per the verification-policy memory, intra-repo route relocation
  with redirects (no public writes, no auth changes, no state-change
  risk) closes on clean build + audit.

**Deferred follow-ups (NOT auto-promoted).**
Per the operator clarification on customer databases, the IA holds
space for these surfaces but the placeholder shells were NOT built in
this lane. Each is its own small future lane if/when the operator
opens it:

  - `/grow/users`       — view into the Grow app's user database.
  - `/grow/billing`     — Grow-specific billing surface (separate
                          from Trade · Billing).
  - `/edge/users`       — view into the Edge app's user database.
  - `/edge/billing`     — Edge-specific billing surface.
  - `/trade/users`      — already a placeholder under Trade ·
                          Business, awaiting trade-api `/v1/admin/users`.

The Ads BSK-002 sub-shell from ADMIN-1d is the working template for
these (preview shell + EmptyState + clear note about which upstream
endpoint will populate it).

### 2026-05-17 — v1.1 reconciliation against the supervisor ownership clarification

**Trigger.** The supervisor inserted an admin-dashboard ownership
clarification before promoting ADMIN-1c: *"User, billing, and similar
business-operational data should live under the relevant vertical,
not under System. System is reserved for shared platform/ops concerns
only — server health, logs, infrastructure status, queues, runtime
visibility, and similar cross-product operational surfaces."* That
clarification contradicted the v1 placement of Customers + Billing
inside System. ADMIN-1c was completed under the clarification (Today
already disclaims business state in its header and footer), but the
locked IA was left unreconciled. ADMIN-1c's executor follow-up
explicitly flagged this gap; this section closes it.

**What changed in this doc.**

| Section | Change |
|---------|--------|
| Header  | Status `LOCKED v1` → `LOCKED v1.1`; reconciliation history block added. |
| §1      | Row 4 of the surface table re-scoped from *"Cross-cutting admin — customers, billing, infra, users, audit"* → *"Shared platform/ops — health, logs, infra, audit, admin users, control toggles, settings"*. New "Ownership rule" block inserted directly after the table. |
| §2      | Sidebar IA listing: Customers + Billing marked TRANSITIONAL with relocation context; Users line clarified as admin/operator users only, not customer users. |
| §3      | Audit-table rows for `/billing` and the four `customers/*` entries marked *(transitional, v1.1)* with relocation context. |
| §5      | Re-titled "Implementation sequence — status"; all six tickets marked `done` with commit refs. |
| Appendix | New ownership-rule invariant codifies the clarification; old "Per-vertical Revenue" line preserved as a corollary. |
| §6      | This section, new. |

**What did NOT change.**

- §4 (stale pre-app-era pages list). The relocation question is
  orthogonal; stale-page tracking still works the same way.
- No source changes in this lane — pure doc reconciliation. The
  transitional surfaces (`/system/customers`, `/system/billing`)
  remain live exactly as they shipped; they just carry a "transitional"
  flag in this contract until a future lane relocates them.
- The locked sidebar group label "System" stays. The reconciliation
  is about *what System owns*, not what it's called.

**Follow-on lane needed (NOT auto-promoted).**

A future ADMIN lane (call it `ADMIN-RELOC-1`) should relocate the
transitional surfaces under their owning verticals:

- `/system/customers/*` → split between `/grow/customers/*` (Grow
  buyers) and the equivalent paths under Trade / Edge as those become
  the dominant buyer sources. The existing `system/customers/Layout.tsx`
  already has Grow/Edge/Trade tabs, so the data plane is ready.
- `/system/billing` → split into per-vertical billing/revenue tabs
  (most of the file's reads already match Trade · Revenue's data
  contract). The "platform billing" reading of System › Billing (infra
  costs etc.) can either be retired or rebuilt against a real platform-
  cost backend.
- Keep `/system/users` as is (admin users, not customer users — the
  invariant covers this).
- Keep `/system/audit-logs`, `/system/infrastructure`, `/system/control-centre`,
  `/system/settings` as is — these are genuinely platform/ops.

That lane is not promoted by this reconciliation. Operator selects
when (or whether) to run it.
