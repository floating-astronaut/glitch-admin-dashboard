# ADMIN_IA — Glitch Admin Dashboard Information Architecture

Status: **LOCKED v1.1** (2026-05-17 reconciled)
Owner: Tejas
Scope: ADMIN-1a — define the control-panel shape, audit current pages, and
sequence the rewrite. No source edits in this ticket.

History:
- v1 (2026-05-17) — original lock under ADMIN-1a.
- v1.1 (2026-05-17) — reconciled with the **2026-05-17 supervisor
  ownership clarification**: business-operational data (customers,
  billing, customer users) belongs under its owning vertical, not
  under System. System carries shared platform/ops only. Customers
  and Billing are marked **transitional** in §2/§3; the ownership
  rule is codified as an Appendix invariant; the full reconciliation
  is logged in §6 at the bottom of this file.

This file is the contract the rest of the admin-dashboard rewrite is built
against. Subsequent ADMIN tickets (1b, 1c, …) must either conform to this
IA or update it explicitly.

---

## 1. Top-level control-panel shape

The dashboard is the operator console for **four business surfaces**.
They are peers — not nested, not collapsible into one "agents" group.

| # | Surface | Purpose                                              | Audience            |
|---|---------|------------------------------------------------------|---------------------|
| 1 | Trade   | Glitch Trade SaaS — revenue / customers / engine     | All admins + operator (engine) |
| 2 | Grow    | Glitch Grow agent suite — Sales / Ads / Social / UGC / SEO / Voice | All admins per brand |
| 3 | Edge    | Glitch Edge betting platform — accounts / signals    | All admins          |
| 4 | System  | Shared platform/ops — health, logs, infra, audit, admin users, control toggles, settings | All admins          |

**Ownership rule** (codified 2026-05-17, v1.1 reconciliation):
business-operational data — customer accounts, customer billing,
customer subscriptions, lead pipelines, per-vertical revenue —
**belongs under its owning vertical**, not under System. System
carries cross-product platform/ops only: health, logs, alerts,
queues, runtime visibility, infrastructure status, admin (operator)
users, audit log, global control toggles, settings.

The existing `/system/customers` and `/system/billing` surfaces are
**transitional**: they were placed under System when this IA first
locked, before the ownership clarification. Their eventual placement
is per-vertical (Trade buyers under `/trade/*`, Grow buyers under
`/grow/*`, Edge accounts under `/edge/*`). Relocation is its own
future lane, not part of the ADMIN-1\* sequence.

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
   Customers       ← TRANSITIONAL · cross-vertical buyer list;
                     relocates per the ownership rule
   Billing         ← TRANSITIONAL · per-vertical revenue belongs under
                     each vertical, not System
   Infrastructure  ← service heartbeat board
   Control Centre  ← global toggles, kill switches
   Users           ← admin (operator) accounts + roles
                     · NOT customer users — those belong to the
                     owning vertical's Users tab (e.g. /trade/users)
   Audit Logs
   Settings
```

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
| `/billing` | `Billing.tsx` | 124 | **Rename → `system/Billing`** *(transitional, v1.1)* | Move file to `pages/system/Billing.tsx`. Re-scope to *platform* billing; per-vertical revenue stays under each surface's "Revenue" tab. Per the ownership rule, the surviving customer-billing summary fields belong under each vertical (Trade billing under `/trade/*`, Grow billing under `/grow/*`). Relocation lane TBD. |
| `/infrastructure` | `Infrastructure.tsx` | 159 | **Rename → `system/Infrastructure`** | Move; otherwise keep. Source of truth is `/home/support/glitch-infra/README.md` — make sure cards match. |
| `/settings` | `Settings.tsx` | 224 | **Rename → `system/Settings`** | Move; review for stale fields tied to the legacy `admin_api`. |
| `/admin/control-centre` | `admin/ControlCentre.tsx` | 323 | **Rename → `system/ControlCentre`** | Largest System page; keep behaviour, just move the file. |
| `/admin/users` | `admin/UserManagement.tsx` | 477 | **Rename → `system/UserManagement`** | Same. |
| `/admin/audit-logs` | `admin/AuditLogs.tsx` | 32 | **Build out (rename)** | Stub today. Move to `system/AuditLogs` and wire to real audit feed (admin_api → SSO action log). |
| `/admin/customers` (index) | `admin/customers/Buyers.tsx` | 136 | **Keep, rename group → `system/customers`** *(transitional, v1.1)* | Canonical buyer surface today. Per the ownership rule, this belongs under its owning vertical(s) — Trade buyers under `/trade/customers` or split, Grow buyers under `/grow/customers`, Edge accounts under `/edge/*`. The current `system/customers/Layout.tsx` already has Grow/Edge/Trade tabs prepared for that split. Relocation lane TBD. |
| `/admin/customers/leads` | `admin/customers/Leads.tsx` | 13 | **Build out** *(transitional, v1.1)* | 13-line stub. Wire to lead pipeline (Grow › Sales originates these). Relocates with the parent Customers surface. |
| `/admin/customers/buyers/:paymentId` | `admin/customers/BuyerDetail.tsx` | 252 | **Keep** *(transitional, v1.1)* | Substantive; biggest System detail view. Relocates with the parent Customers surface. |
| `/admin/customers/*` layout | `admin/customers/Layout.tsx` | 88 | **Keep** *(transitional, v1.1)* | Move with the group. Already has Grow/Edge/Trade tabs, prepared for the per-vertical split. |
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
