# Customer Management — Design Doc

> Companion to `customer-mgmt-briefing.md`. This doc records the **chosen architecture** for v1 and the contracts the frontend will hold the backend to.

## Context — why this shape

The original brief was Grow-only (`/grow/buyers`, `/grow/leads`). Since the brief was written, the dashboard has been restructured around four verticals — **Trade / Grow / Edge / Admin** — and customer data was explicitly called out as a place where Grow, Edge, and (eventually) Trade buyers all need to converge.

Therefore: customer management lives under **Admin → Customers**, NOT under Grow. Grow is the marketing control plane (agents, campaigns, deployments); the people who *bought* something belong in Admin where they sit alongside billing, infrastructure, and audit logs.

The existing `/clients` page (stale, trading-bot era) is **replaced** by `/admin/customers`. Legacy URL redirects keep any bookmarks alive.

## Phasing

| Phase | Customers visible | Source |
|---|---|---|
| **v1 — this session** | Grow buyers (BSK-002 … BSK-007, BSK-ALL) + Vibe Kit leads | `glitch_grow_buyers` + Google Sheet + Resend audience |
| v2 (future) | Edge betting buyers | TBD |
| v3 (future) | Trade subscribers | `glitchexecutor` Postgres `users` table |

The page filters by **source vertical** via tabs. Grow is the only tab live in v1; Edge and Trade tabs render `EmptyState` with "no data wired yet".

## Routes

```
/admin/customers                          List (Grow tab default; Edge / Trade tabs placeholder)
/admin/customers/buyers/:payment_id       Buyer detail (Grow buyer — top card, timeline, action panel, activity log)
/admin/customers/leads/:email             Lead detail (Vibe Kit lead — Resend send history + manual onboard)
/admin/customers/refunds                  Refund queue (pending + completed)

/clients                                  → 301 → /admin/customers (legacy)
/clients/:id                              → 301 → /admin/customers          (id form is not portable; land on list)
```

The list page is a single screen with **two segmented sub-tabs inside the Grow vertical**:
- **Buyers** — `glitch_grow_buyers` rows
- **Leads** — Vibe Kit signups

## Sidebar

`ADMIN` group, item label `Customers` (replaces the existing `Customers` row that pointed to `/clients`).

## Components

Reuse what exists; create only what's new.

| Component | Purpose | Status |
|---|---|---|
| `pages/admin/customers/Layout.tsx` | Tab row (Grow / Edge / Trade) + sub-tab row (Buyers / Leads) for the Grow tab | NEW |
| `pages/admin/customers/Buyers.tsx` | DataTable of buyers, filters (SKU / provider / fulfillment / date) | NEW |
| `pages/admin/customers/Leads.tsx` | DataTable of Vibe Kit leads | NEW (v1 stub) |
| `pages/admin/customers/BuyerDetail.tsx` | Top card + fulfillment timeline + action panel + activity log | NEW (v1 skeleton) |
| `pages/admin/customers/LeadDetail.tsx` | Lead profile + Resend history + manual-onboard panel | NEW (v1 deferred) |
| `pages/admin/customers/Refunds.tsx` | Refund queue | NEW (v1 deferred) |
| `components/customers/FulfillmentTimeline.tsx` | Reusable 7-row timeline | NEW |
| `components/customers/SkuBadge.tsx` | `BSK-002` / `BSK-ALL` etc. pill | NEW |
| `components/ui/{Card,Section,DataTable,StatusBadge,KpiCard,EmptyState,ErrorState,Modal,Skeleton}` | All reused | EXISTING |

## Backend — proxy layer in `admin_api`

The payment server already exposes `/api/grow/*` on port 8085 protected by `X-Fulfill-Secret`. The dashboard's browser **must not** see that secret. So `admin_api` (the JWT-authenticated read service the dashboard already talks to) grows a new router that proxies to the payment server, injecting the secret server-side.

```
Browser  → /api/customers/*  → admin_api router (JWT auth)
                                ↓ adds X-Fulfill-Secret
                               payment server :5002/api/grow/*
                                ↓
                               Postgres / Resend / Stripe / Razorpay / Codeberg / Discord
```

New admin_api env vars (compose):
- `GROW_FULFILL_SECRET` — same value as the payment server already has
- `PAYMENT_SERVICE_URL` — `http://payment:5002` (internal docker network)

### admin_api endpoint contracts

All require JWT (existing `get_current_user`). All proxy to payment server with the fulfill secret added.

| Method | Path | Proxies to | Notes |
|---|---|---|---|
| GET | `/api/customers/buyers` | `GET /api/grow/buyers` | Pass `email`, `sku`, `payment_id`, `limit`, `provider` (provider added) |
| GET | `/api/customers/buyer/{payment_id}` | `GET /api/grow/buyer/{payment_id}/detail` | Joined detail view (new payment-server endpoint to stub) |
| GET | `/api/customers/leads` | `GET /api/grow/leads` | Reads Google Sheet + Resend audience, merged (new endpoint) |
| POST | `/api/customers/refund` | `POST /api/grow/refund-buyer` | Body `{payment_id, amount?, reason?}` |
| POST | `/api/customers/resend-welcome` | `POST /api/grow/resend-welcome` | Body `{payment_id}` |
| POST | `/api/customers/reinvite-codeberg` | `POST /api/grow/reinvite-codeberg` | Body `{payment_id, github_username?}` |
| POST | `/api/customers/note` | `POST /api/grow/buyer-note` | Body `{payment_id, note}` — merges into `notes` JSONB |

### Payment-server endpoints to add (stubs this session, bodies next)

Existing: `/api/grow/buyers`, `/api/grow/record-buyer`, `/api/grow/refund-buyer`.

To add (signatures + auth check + placeholder JSON, bodies later):
- `GET /api/grow/buyer/<payment_id>/detail` — joined view (buyer row + Codeberg invite state + Discord membership + Resend welcome state + CAPI status flags)
- `GET /api/grow/leads` — Google Sheet `leads` tab + Resend `kit-leads` audience merged by email
- `POST /api/grow/resend-welcome` — re-render via existing template renderer
- `POST /api/grow/reinvite-codeberg` — call Codeberg PUT collaborator
- `POST /api/grow/buyer-note` — `UPDATE glitch_grow_buyers SET notes = notes || %s::jsonb WHERE payment_id = %s`

## Frontend — TanStack Query keys + shape

```ts
// src/api/customers.ts
export interface Buyer {
  id: number
  payment_id: string
  provider: 'stripe' | 'razorpay'
  sku: string
  email: string
  github_username: string | null
  buyer_name: string | null
  amount_minor: number
  currency: 'USD' | 'INR'
  promo_code: string | null
  notes: Record<string, any>
  created_at: string
  fulfilled_at: string | null
  refunded_at: string | null
}

export const customersBuyers = (params?: {
  email?: string; sku?: string; payment_id?: string;
  provider?: 'stripe' | 'razorpay'; limit?: number;
}) => api.get<{ count: number; buyers: Buyer[] }>('/api/customers/buyers', { params })
        .then(r => r.data)

export const customersBuyer = (paymentId: string) =>
  api.get<BuyerDetail>(`/api/customers/buyer/${paymentId}`).then(r => r.data)

export const customersLeads = () =>
  api.get<{ leads: Lead[] }>('/api/customers/leads').then(r => r.data)

export const customersRefund = (body: { payment_id: string; amount?: number; reason?: string }) =>
  api.post('/api/customers/refund', body).then(r => r.data)

export const customersResendWelcome = (payment_id: string) =>
  api.post('/api/customers/resend-welcome', { payment_id }).then(r => r.data)

export const customersReinviteCodeberg = (payment_id: string, github_username?: string) =>
  api.post('/api/customers/reinvite-codeberg', { payment_id, github_username }).then(r => r.data)

export const customersAddNote = (payment_id: string, note: string) =>
  api.post('/api/customers/note', { payment_id, note }).then(r => r.data)
```

Query keys:
- `['customers', 'buyers', filters]` — refetch every 60s
- `['customers', 'buyer', paymentId]` — refetch every 30s on detail page
- `['customers', 'leads']` — refetch every 5 min (Google Sheets is slow + rate-limited)

Mutations invalidate `['customers', 'buyers']` and `['customers', 'buyer', paymentId]`.

## State shape

Zero new global state. Filter inputs live in URL search params (`?sku=BSK-003&provider=stripe`) for shareable links — same pattern as the trade Signals page bot filter.

## Fulfillment timeline rows

In order:

1. **Payment captured** — `created_at` timestamp; green if present
2. **Postgres ledger write** — same row exists → green (always true if we're rendering)
3. **Welcome email sent** — `notes.welcome_email_id` present → green; click to open Resend dashboard
4. **Codeberg collaborator invite issued** — per-SKU repo names from the source-of-truth catalog, each with its own row (accepted / pending / not-yet-issued)
5. **Discord role granted** — `notes.discord_role_granted` flag; "not linked" amber if `notes.discord_id` absent
6. **Meta CAPI Purchase event** — `notes.capi_meta_status == 'ok'` → green + EMQ link with `event_id = payment_id`
7. **TikTok CAPI Purchase event** — `notes.capi_tiktok_status == 'ok'` → green + TT events link

`refunded_at != null` → all rows render with a red strikethrough overlay + a "Refunded" banner at the top.

## Action panel

Right rail on `/admin/customers/buyers/:payment_id`:

- **Resend welcome email** — confirm modal → POST `/api/customers/resend-welcome`
- **Re-fire Codeberg invite** — modal with editable `github_username` (defaults to existing) → POST `/api/customers/reinvite-codeberg`
- **Issue refund** — provider-aware modal (Stripe → uses payment_intent fetched from session; Razorpay → uses `pay_...` directly). Amount field with full-amount default, reason dropdown
- **Mark manual fulfillment complete** — for BSK-004 GitHub-suspension legacy
- **Add note** — textarea → POST `/api/customers/note`

## Activity log

Chronological merge of:
- Webhook receipt (from `created_at`)
- Fulfillment fan-out completion (`fulfilled_at`)
- Refund (`refunded_at`)
- Every `notes.*` event with a timestamp inside it (free-form merge target)

v1: render the four hard ones; the activity-log richness depends on what `grant-access` and the webhook handler actually stuff into `notes` — TBD by inspecting a real buyer row once the secret is provided.

## What ships in this session

1. ✅ This design doc
2. admin_api `routers/customers.py` — JWT-guarded proxy adding `X-Fulfill-Secret`, with the 7 endpoints above
3. payment-server stubs for the 5 new endpoints (signature + auth check + `{"ok": true, "stub": true}` response — bodies follow in the next session)
4. Frontend `src/api/customers.ts` with the types + client functions
5. `pages/admin/customers/Layout.tsx` — vertical tabs (Grow active / Edge / Trade placeholders) + Buyers/Leads sub-tabs
6. `pages/admin/customers/Buyers.tsx` — DataTable wired to `GET /api/customers/buyers`, filters, click-through to detail
7. `pages/admin/customers/BuyerDetail.tsx` — top card with real buyer data, **stub** fulfillment timeline + action panel (the actions are mounted but the mutation handlers are wired so they're callable once payment-server bodies land)
8. Sidebar/Layout/CommandPalette updated; legacy `/clients[/:id]` redirects added

What's deferred to the next session:
- Leads tab (Google Sheets + Resend integration on payment server)
- LeadDetail page
- Refunds queue page
- Fully wired fulfillment timeline (requires real `notes` shape inspection)

## Required env / secrets

Before this can be deployed and exercised:
- `GROW_FULFILL_SECRET` on the admin_api container (compose env, sourced from `/opt/glitchexecutor/.env`)
- Admin login credentials for `dashboard.glitchexecutor.com` (already seeded — confirm the working pair)

Both must be provided by Tejas before any container restart or end-to-end test.

## Non-goals

- No browser → Postgres path. Ever.
- No external API key in the SPA bundle.
- No new abstractions for Edge/Trade customer sources beyond the empty tabs. We'll learn the right shape when those wire up.
- No duplicating the SKU catalog — payment server reads it from one place when it builds the timeline; admin_api just passes the JSON through.
