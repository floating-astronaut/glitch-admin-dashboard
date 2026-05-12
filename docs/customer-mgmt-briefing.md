# Briefing prompt — Customer / Lead Management for the Glitch Admin Dashboard

> Paste this entire file into a fresh Claude/Codex session that will be working in `/home/support/glitch-admin-dashboard/`. It briefs the session on every data source, endpoint, schema, and env var needed to build the Grow customer-management pages. Self-contained — the spawned session will have **zero prior context**.

---

## What you're building

You are continuing work on **`/home/support/glitch-admin-dashboard/`** — a React + Vite + Tailwind + TanStack Query + Zustand internal ops dashboard. The dashboard already has scaffolding (`Layout`, `Sidebar`, `Topbar`, `Login`, `DashboardHome`, `Clients`, `ClientDetail`, `Billing`, `Infrastructure`, `Settings`) and an existing `src/api/grow.ts` that surfaces the sales-agent (lead pipeline) data.

Your job: extend the **Grow** vertical to manage **paid customers + free-kit leads** end-to-end. The user (Tejas, solo founder) needs to:

1. See every paid customer (Stripe + Razorpay rails, BSK-002 through BSK-007 + BSK-ALL)
2. See every free Vibe Kit lead (signup events from `capture-lead`)
3. Verify fulfillment state per customer (Codeberg invite accepted? Welcome email sent? Discord joined? Buyer-portal accessed?)
4. Issue refunds (Stripe + Razorpay)
5. Resend the welcome email, re-fire the Codeberg invite, manually onboard a lead
6. Read the buyer's note trail across all sinks (CAPI events, Discord pings, support emails)

---

## Data sources — exhaustive list

Every place customer/lead data lives, with exact paths, schemas, and access pattern:

### 1. Primary buyer ledger — Postgres `glitch_grow_buyers`

- **Host:** `glitch-postgres` Docker container on this box (`docker exec glitch-postgres psql -U glitch -d glitchexecutor`)
- **DB:** `glitchexecutor` · **Table:** `public.glitch_grow_buyers`
- **Schema:**
  ```
  id bigint PK
  payment_id text UNIQUE       ← master dedup key across all systems
  provider text                ← 'stripe' | 'razorpay'
  sku text                     ← 'BSK-002'..'BSK-007' | 'BSK-ALL'
  email text NOT NULL
  github_username text         ← Codeberg/GitHub handle (Codeberg accepts GitHub OAuth)
  buyer_name text
  amount_minor int             ← cents/paise (USD/INR)
  currency text                ← 'USD' | 'INR'
  promo_code text
  notes jsonb                  ← free-form merge target
  created_at timestamptz       ← when webhook landed
  fulfilled_at timestamptz     ← when grant-access fan-out completed
  refunded_at timestamptz
  ```
- **Access via existing HTTP API** (don't go straight to Postgres from the dashboard):
  - `GET /api/grow/buyers?email=&sku=&payment_id=&limit=` → list buyers
  - `POST /api/grow/record-buyer` → upsert (used by webhooks; dashboard shouldn't need)
  - `POST /api/grow/refund-buyer` → mark `refunded_at = now()`
- **Host:** `http://localhost:8085` (the payment service — see "Payment server" below). Outside the box, route via the same nginx/CF reverse-proxy the rest of the dashboard uses.
- **Auth:** `X-Fulfill-Secret: <GROW_FULFILL_SECRET>` header on all `/api/grow/*` calls. The secret lives in `/opt/glitchexecutor/payment/.env` as `GROW_FULFILL_SECRET=<hex>`. The dashboard's backend proxy adds it; never expose to the browser.

### 2. Free Vibe Kit leads — Google Sheets + Resend audience

The lead capture flow writes to two persistent stores; **there is no Postgres ledger for leads** (intentional — they're lighter, asymmetric to buyers).

- **Google Sheet** (primary): id in CF Pages env as `SHEETS_LEADS_ID`. Sheet schema:
  ```
  timestamp | request_id | name | email | phone | profession | company_url |
  country | ip | user_agent | referer
  ```
  Read via Google Sheets API v4 using the service account `glitch-vertex-ai@<your-gcp-project-id>.iam.gserviceaccount.com` (the same SA the agents use; lives in `SHEETS_SA_JSON` env on the CF Pages binding). The dashboard backend should call `GET https://sheets.googleapis.com/v4/spreadsheets/{SHEETS_LEADS_ID}/values/leads` with a minted access token.
- **Resend audience** (secondary, for email lifecycle): audience name `kit-leads`. Resend API key in env as `RESEND_API_KEY`. Endpoints:
  - `GET https://api.resend.com/audiences/{audience_id}/contacts` → list contacts
  - `GET https://api.resend.com/emails/{email_id}` → fetch a sent email's metadata
  Use Resend's audience id (not name) — fetch once at `GET /audiences`.

The lead is uniquely keyed by **email** across these two stores. There's no surrogate `lead_id` — keep the contract simple: `email` is the key.

### 3. Stripe — paid SKU purchases

- **API key** at `/opt/glitchexecutor/payment/.env` as `STRIPE_API_KEY=sk_live_…`
- **Webhook secret** as `STRIPE_WEBHOOK_SECRET=whsec_…`
- **Per-SKU Payment Links** created via `scripts/setup-stripe-products.mjs` in `/home/support/glitch-grow-site/`. Each Product has `metadata.sku = BSK-00N`.
- **Lookup endpoints** (use sparingly; cache):
  - `GET https://api.stripe.com/v1/checkout/sessions?customer=cus_…&limit=10`
  - `GET https://api.stripe.com/v1/charges/{charge_id}`
  - `POST https://api.stripe.com/v1/refunds` (charge or payment_intent)
- **Joins:** `glitch_grow_buyers.payment_id` for Stripe rows is the `cs_…` Checkout Session id. Stripe's API uses `pi_…` (payment intent) for refunds — fetch the session, read `payment_intent` field, then issue the refund.

### 4. Razorpay — INR purchases

- **API key:** `/opt/glitchexecutor/payment/.env` as `RAZORPAY_KEY_ID=rzp_live_…` and `RAZORPAY_KEY_SECRET=…`
- **Order creation:** dashboard doesn't create orders; just reads. `glitch_grow_buyers.payment_id` for Razorpay rows is the `pay_…` payment id.
- **Lookup:** `GET https://api.razorpay.com/v1/payments/{pay_id}` (Basic auth: key_id:secret).
- **Refund:** `POST https://api.razorpay.com/v1/payments/{pay_id}/refund` body `{amount, speed:'normal'|'optimum'}`.

### 5. Codeberg — buyer collaborator invites (fulfillment proof)

- **API token:** `/home/support/.codeberg-token` (Tejas's PAT with `write:user` + repo scopes).
- **Per-SKU `-pkg` repos** under `glitch-executor/`:
  - `glitch-grow-ai-ads-agent-pkg` (BSK-002)
  - `glitch-grow-sales-agent-pkg` (BSK-003)
  - `glitch-grow-ai-social-media-agent-pkg` (BSK-004)
  - `glitch-grow-cod-confirm-pkg` (BSK-005)
  - `glitch-grow-ai-seo-agent-pkg` (BSK-006)
  - `glitch-grow-ai-ugc-agent-pkg` (BSK-007)
  - All 6 for BSK-ALL
- **Endpoints:**
  - `GET /api/v1/repos/{owner}/{repo}/collaborators` → list current collaborators
  - `PUT /api/v1/repos/{owner}/{repo}/collaborators/{username}` body `{"permission":"read"}` → invite
  - `DELETE /api/v1/repos/{owner}/{repo}/collaborators/{username}` → revoke (on refund)
- **Auth:** `Authorization: token <PAT>` header.
- **Mapping** lives in `/home/support/glitch-grow-site/functions/_sku-catalog.ts` (source-of-truth for SKU → repo path). Mirror that map in the dashboard's backend.

### 6. Discord — community membership

- **Bot token:** `DISCORD_BOT_TOKEN` env on the payment server (used for role grants in `grant-access`).
- **Guild id:** `DISCORD_GUILD_ID`. Roles: `Agent Buyer`, `Founder Stack Buyer`, plus per-channel roles for the agent-specific channels (`#ads-agent`, `#sales-agent`, etc.).
- **Endpoints:**
  - `GET https://discord.com/api/v10/guilds/{guild_id}/members/{user_id}` → membership state
  - `PUT  /guilds/{guild_id}/members/{user_id}/roles/{role_id}` → grant role
  - `DELETE /guilds/{guild_id}/members/{user_id}/roles/{role_id}` → revoke (on refund)
- **Buyer → Discord user mapping:** captured at checkout (if they linked Discord) and stored in `glitch_grow_buyers.notes.discord_id`. Not all buyers will have it; show "not linked" in UI when absent.

### 7. CAPI events ledger — Meta + TikTok

- The `grant-access` function fires a server-side Purchase event to both Meta + TikTok with deduped `event_id = payment_id`.
- **Read:** Meta Events Manager EMQ dashboard (manual link, not API). TikTok Events Manager likewise. Don't try to re-pull — surface the `event_id` (= `payment_id`) and a "Check in Events Manager" link.
- The dashboard's job here is verification, not display: a green checkmark "Purchase event fired server-side" when `glitch_grow_buyers.notes.capi_meta_status == 'ok'` / `notes.capi_tiktok_status == 'ok'`.

### 8. Welcome email — Resend transactional sends

- Sent by `grant-access` after webhook lands. Resend message id stored in `glitch_grow_buyers.notes.welcome_email_id`.
- `GET https://api.resend.com/emails/{id}` returns delivery state. Surface "delivered / bounced / complained" in the buyer detail page.
- **Resend a welcome email manually:** dashboard calls `POST /api/grow/resend-welcome` (you may need to add this endpoint to the payment server — it should re-invoke the same template renderer used by `grant-access`).

### 9. Sales agent DB — outreach pipeline (existing — already wired)

- DB schema `sales_agent.*` on the same `glitchexecutor` Postgres. Surfaced by the existing `src/api/grow.ts` which the dashboard already uses for the Clients/ClientDetail pages.
- Tables: `leads`, `email_drafts`, `email_sends`, `unsubscribes`. Schema lives in `/home/support/glitch-grow-sales-agent-private/src/sales_agent/db/models.py`.
- **Don't duplicate.** Reuse the existing read-only proxy and TS types.

### 10. Payment server — the API gateway for #1, #3, #4

- **Location:** `/opt/glitchexecutor/payment/server.py` (Flask). Runs in Docker container `glitch-payment` on port `8085`.
- **Restart:** `docker compose restart glitch-payment` from `/opt/glitchexecutor/`.
- **Endpoints already wired** (search for `@app.route` in `server.py`):
  - `GET  /health`
  - `GET  /api/grow/buyers` (list) ← **dashboard reads here**
  - `POST /api/grow/record-buyer` (write — used by webhooks; dashboard shouldn't call)
  - `POST /api/grow/refund-buyer` ← **dashboard refunds here**
  - `POST /api/stripe/webhook` (Stripe webhook target)
  - `POST /api/stripe/portal` (issue Stripe customer-portal links)
- **Endpoints you'll add as you build:**
  - `POST /api/grow/resend-welcome` — re-render + send via Resend, keep idempotency key
  - `POST /api/grow/reinvite-codeberg` — call Codeberg PUT collaborator again
  - `GET  /api/grow/leads` — read Google Sheet + Resend audience, merge, return JSON
  - `GET  /api/grow/buyer/{payment_id}/detail` — joined view: buyer row + Codeberg invite state + Discord membership + Resend welcome state + CAPI status
- **Auth on all `/api/grow/*`:** `X-Fulfill-Secret: $GROW_FULFILL_SECRET`. The dashboard's frontend never sees this — it goes through a backend proxy.

---

## Architecture for the dashboard

```
┌─ Dashboard (Vite SPA, runs at admin.glitchexecutor.com or local) ─┐
│                                                                    │
│   Pages:                                                           │
│   /grow/buyers              list table (filters: SKU, provider,    │
│                              fulfillment-state, date range)        │
│   /grow/buyers/:payment_id   detail (joined view, action panel)    │
│   /grow/leads               Vibe Kit leads (Google Sheet + Resend) │
│   /grow/leads/:email        lead detail + manual-onboarding panel  │
│   /grow/refunds             refund queue (pending + completed)     │
│                                                                    │
└─ axios(api.client) → backend proxy → ───────────────────────────────┘
   (adds X-Fulfill-Secret + bearer auth)
                                              │
   ┌──────────────────────────────────────────┼──────────────────────┐
   │                                          │                      │
   ▼                                          ▼                      ▼
 Payment server                          Codeberg API           Discord API
 (Flask · :8085)                         (graceful PAT)         (bot token)
   │                                                                  │
   ├── Postgres glitch_grow_buyers                                    │
   ├── Stripe / Razorpay APIs                                         │
   ├── Google Sheets API (leads)                                      │
   └── Resend API (audiences + sends)                                 │
```

**Don't** build a direct browser→Postgres path. **Don't** put any API key in the SPA bundle. Every external API call routes through the payment server (or a small new sidecar if you'd rather isolate Grow ops — but the existing Flask app is fine).

---

## Existing files you'll touch / reference

| Path | Purpose |
|---|---|
| `src/api/grow.ts` | EXISTS. Currently surfaces sales-agent. **Extend** — add `getBuyers()`, `getBuyer(paymentId)`, `getLeads()`, `refundBuyer()`, etc. |
| `src/pages/Clients.tsx` | EXISTS. May be a good model for the new `/grow/buyers` page. |
| `src/pages/ClientDetail.tsx` | EXISTS. Model for `/grow/buyers/:payment_id`. |
| `src/components/ui/DataTable.tsx` | EXISTS. Use for buyer + lead tables. |
| `src/components/ui/StatusBadge.tsx` | EXISTS. Use for fulfillment-state pills. |
| `src/stores/auth.ts` | EXISTS. Auth-token bearer for the payment-server proxy. |
| `/home/support/glitch-grow-site/functions/_sku-catalog.ts` | SOURCE-OF-TRUTH. SKU → repo paths. Mirror in dashboard backend, do not fork. |
| `/home/support/glitch-grow-site/functions/api/fulfill/grant-access.ts` | SOURCE-OF-TRUTH. Fulfillment fan-out logic; mirror its sink names in the buyer-detail UI. |
| `/opt/glitchexecutor/payment/server.py` | Flask app. Add the 4 new endpoints listed above here. |

---

## Memory files to check before designing

`/home/support/.claude/projects/-home-support/memory/`:

- `project_glitch_grow_lineup_2026_05_08.md` — current SKU table (6 agents + Stack)
- `project_glitch_grow_delivery_model.md` — three-tier repo model (public / -private / -pkg)
- `project_glitch_grow_stores.md` — Shopify ↔ App ↔ Meta map
- `project_glitch_grow_site.md` — CF Pages deploy model (NOT Workers; static + Functions)
- `feedback_production_coding_rules.md` — Tejas's coding constraints (OSS-first, cheapest paid fallback, no over-engineering)
- `feedback_always_push_commits.md` — push every commit, never leave only-local

Read these before generating any design doc.

---

## Acceptance criteria for v1

A buyer comes in via Stripe webhook → 5 minutes later Tejas opens the dashboard at `/grow/buyers/cs_live_…`. He sees:

1. **Top card**: buyer name + email + SKU + amount + currency + flag for country + provider (Stripe/Razorpay logo).
2. **Fulfillment timeline** (7 rows, each green/amber/red):
   - Payment captured (timestamp)
   - Postgres ledger write (timestamp)
   - Welcome email sent (Resend message id, click-to-view)
   - Codeberg collaborator invite issued (per-SKU repo names, accept status)
   - Discord role granted (`Agent Buyer` / `Founder Stack Buyer`)
   - Meta CAPI Purchase event (event_id = payment_id, link to EMQ)
   - TikTok CAPI Purchase event (link to TT events)
3. **Action panel** (right rail):
   - Resend welcome email (button)
   - Re-fire Codeberg invite (button — useful if buyer's Codeberg username changed)
   - Issue full or partial refund (Stripe/Razorpay-aware modal)
   - Mark manual fulfillment complete (for the BSK-004 GitHub-suspension legacy)
   - Add note (free-form text → `notes` JSONB merge)
4. **Activity log** (bottom): chronological merge of every event touching this payment_id — webhook receipts, CAPI fires, support emails, refund actions.

For leads: lighter version — table of all `kit-leads` rows, click row → see Resend send history + 1-click "Resend welcome" + "Manual founder DM via sales-agent CLI" (link to the script we shipped — `/home/support/glitch-grow-sales-agent-private/scripts/send_founder_dm.py`).

---

## What to deliver in this session

1. A **design doc** at `docs/customer-mgmt-design.md` covering: routes, components, backend endpoint contracts, query keys (TanStack), state shape.
2. The **backend endpoint stubs** in `/opt/glitchexecutor/payment/server.py` (just signatures + auth check + placeholder return). User will run them locally to confirm shape; you'll fill in the bodies in a subsequent session.
3. The **`/grow/buyers` list page** (Buyers.tsx) wired to `GET /api/grow/buyers` — must work end-to-end against real Postgres data.
4. The **`/grow/buyers/:payment_id` detail page** with at minimum the top-card and a placeholder fulfillment timeline (data wiring can stub for now).

Don't try to ship everything in one session. The list page + detail page skeleton + endpoint stubs is enough to validate the architecture.

---

## Coding constraints (from `feedback_production_coding_rules.md`)

- OSS-first, native APIs, cheapest paid fallback only when free is genuinely insufficient (no Madgicx, no Smartlead, no Bland.ai).
- Concise, no over-engineering. No "future-proofing" abstractions for cases that don't exist yet.
- Read the existing dashboard code before adding new patterns; reuse `Card`, `DataTable`, `StatusBadge`, `KpiCard`, `EmptyState`, `Modal` from `src/components/ui/`.
- Push every commit the same turn. Repo is on Codeberg (account `glitch-executor`); use `git push` after every commit. If `origin` points at the suspended `glitch-exec-labs` GitHub, switch the push to the `codeberg` remote.

---

## Run when ready

```bash
cd /home/support/glitch-admin-dashboard
pnpm dev    # or npm dev — runs Vite on http://localhost:5173

# Backend (in another terminal)
cd /opt/glitchexecutor && docker compose logs -f glitch-payment
# Edit server.py, then:
docker compose restart glitch-payment
```

Ask the user (Tejas) for:
- `GROW_FULFILL_SECRET` for local testing (paste into a `.env.local` in the dashboard repo — never commit)
- Admin login credentials seeded in `src/stores/auth.ts` (one-user setup; magic-link or static password is fine for v1)

Don't proceed without those.
