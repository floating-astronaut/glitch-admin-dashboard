# INFRA_VIEW_PLAN — Server System Map ingest into the admin panel

Status: **DRAFT** (2026-05-18) — awaiting operator review before coding starts.
Owner: ADMIN-lane executor.
Source prompt: `/home/support/glitch-trade-app/docs/ADMIN_PANEL_INGEST_PROMPT.md`.

This plan covers ingesting the 12 SERVER\_\*.md system-map artifacts
(plus the consolidation log) from `glitch-trade-app/docs/` into the
admin panel as a browseable, searchable, auto-refreshing surface.
Per the prompt's "Deliverable" section: plan first, **stop**, wait
for the operator to review before implementation.

---

## 1. Storage model

**Decision:** single `infra_docs` table on Admin Docker PG16 (the
existing admin_api DB), one row per source file, **raw markdown**
kept as the body. No parsed-tables-per-file in the DB.

Schema (idempotent, added inline to `admin_api/db.py:run_migrations()`):

```sql
CREATE TABLE IF NOT EXISTS infra_docs (
    slug          TEXT PRIMARY KEY,        -- e.g. 'server-product-map'
    title         TEXT NOT NULL,           -- pulled from first '# …' line
    source_path   TEXT NOT NULL,           -- absolute path on this box
    section_num   INT,                     -- 1..12 for SERVER_*.md files; NULL for log/checklist
    content_md    TEXT NOT NULL,           -- raw GFM markdown
    content_hash  TEXT NOT NULL,           -- sha256 of content_md
    bytes         INT NOT NULL,            -- len(content_md.encode())
    last_modified TIMESTAMPTZ NOT NULL,    -- file mtime
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS infra_docs_section_idx ON infra_docs (section_num);
```

**Why raw markdown, not parsed tables.**

- Total volume across all 14 docs is ~150 KB. Storing parsed tables
  triples the surface area for parser drift — every time a table
  layout changes (e.g. row added to `SERVER_REPO_MAP.md`), the parser
  would need a re-run. Storing raw markdown means the parser lives
  *client-side*, can change without a migration, and the DB is purely
  a cache.
- Parsing GFM tables to data arrays for sortable rendering is a
  ~10-line client-side concern (react-markdown + remark-gfm handles
  the heavy lifting; sortable wrappers go around `<table>`).
- Rollback is trivial: `DROP TABLE infra_docs;`, no joined data lost.

**What the row identifies.** `slug` is the canonical key (kebab-case
of the file basename minus `.md`), `source_path` is the absolute file
path on this box, `section_num` keys sort order for the 12 sectional
files. The consolidation log + checklist get NULL `section_num` and
sort to the bottom.

---

## 2. Sync mechanism

**Decision:** **admin_api background asyncio task** running every
**5 minutes**, reading directly from
`/home/support/glitch-trade-app/docs/SERVER_*.md` on this box.

The job:

1. Glob `SERVER_*.md` + `SERVER_CONSOLIDATION_*.md` under
   `/home/support/glitch-trade-app/docs/`.
2. For each match: read file, compute `content_hash = sha256(text)`.
3. UPSERT into `infra_docs`. If `content_hash` unchanged, only
   `last_synced_at` updates (so the operator can see freshness).
4. Files missing from disk → DELETE the row (the system-map track
   may retire artifacts; the panel reflects that within 5 min).

Manual trigger: `POST /api/infra-docs/sync` (admin-only) for the
"Resync now" button.

**Why background task, not systemd timer / cron.**

- No new infra (matches the prompt's hard constraint).
- The trade-app checkout at `/home/support/glitch-trade-app/` is
  already kept current by the operator + the dual/triple-push pattern
  on other lanes. The sync just observes the local working tree.
- 5 min cadence is fine for documentation; if the operator wants
  near-realtime, the "Resync now" button is one click away.
- BackgroundTasks live in the same process as admin_api so they
  inherit the same DB pool + logging — no second connection set.

**Source path note.** The sync reads from the local checkout, NOT
from a `git pull`. The operator already pulls the checkout via
`git-sync-all` + other lanes; an in-process `git pull` would race
those. Flagged in §6.

---

## 3. Parser + search

**Parser:** `react-markdown` (v9) + `remark-gfm` (v4) on the SPA
side. Both maintained, widely deployed, GFM table support is
first-class. Bundle add: ~30 kB gzip (acceptable next to the current
288 kB bundle).

Custom renderer for `<table>` to wrap each rendered GFM table in a
sortable + filterable component (clicking a column header sorts
client-side; small per-doc search above the table filters rows).
This is the "actual sortable tables, not just raw Markdown" the
prompt asks for.

**Search:** **client-side full-text** across already-fetched
markdown.

- Backend returns ALL docs in one `GET /api/infra-docs` call (~150
  kB JSON, fits in a single response, cached by react-query).
- SPA does case-insensitive substring match on `content_md` + `title`
  + `slug`. Highlights matches in the result list (left rail).
- Optional later: Fuse.js for fuzzy match. Not in v1.

**Why client-side, not PG `tsvector`.**

- Volume is ~150 kB.
- Operator-at-3-AM criterion favours zero round-trip on each
  keystroke.
- PG full-text is a backend-side optimisation; revisit only if doc
  volume grows 10×.

---

## 4. UI layout

**Sidebar placement:** new entry **"Server Map"** under the existing
**System** group, between Infrastructure and Control Centre:

```
System
   Today           ← /
   Infrastructure  ← /system/infrastructure
   Server Map      ← /system/server-map        (NEW)
   Control Centre  ← /system/control-centre
   User Management ← /system/users
   Audit Logs      ← /system/audit-logs
   Settings        ← /system/settings
```

This fits the v1.4 IA's System role (shared platform/ops).
Alternative: top-level "Infra" group at sidebar root. Rejected
because (a) System is the right ownership home; (b) the prompt
described it as "Settings / Server tab, or a new top-level Infra
section — your call".

**Page structure** (`/system/server-map` and `/system/server-map/:slug`):

```
┌──────────────────────────────────────────────────────────────────┐
│  Server Map                          last sync 2m ago · Resync▻  │
│  System map ingest from glitch-trade-app/docs/SERVER_*.md.       │
├──────────────────────────────────────────────────────────────────┤
│  🔍 [ search across all 14 docs … ]                              │
├──────────────────────┬───────────────────────────────────────────┤
│ Section 1            │ # Server Product Map                      │
│ Product Map          │                                           │
│ 246 lines · 8 KB     │ Section 1 of the consolidation checklist. │
│ ────────────────     │                                           │
│ Section 2            │ ## 1. Trade                               │
│ DB Ownership         │ | Field            | Value |              │
│ 376 lines · 13 KB    │ |------------------|-------|              │
│ ────────────────     │ | Public API       | …     |              │
│ … (12 more, sorted   │ | Database         | …     |              │
│   by section_num)    │  (rendered as a sortable table)           │
└──────────────────────┴───────────────────────────────────────────┘
```

- Left rail (28%): doc list with title + section number + size.
  Filters by search; highlights active.
- Right pane (72%): selected doc rendered. GFM tables become
  sortable. `<pre>`/`<code>` get the existing dashboard's mono
  styling.
- URL state: `/system/server-map` lands on the first doc;
  `/system/server-map/server-product-map` is direct. Search query is
  also URL-state (`?q=edge-api restart` so the 3 AM bookmark works).

**Per-section route shape:** one route under the parent — child
selection is the `:slug` param. No per-section sub-tabs (the docs
already structure themselves as one page each).

---

## 5. Estimate of code touched

### SPA (`/home/support/glitch-admin-dashboard/`)

| Change | Path |
|---|---|
| NEW | `docs/INFRA_VIEW_PLAN.md` *(this file)* |
| NEW | `src/api/infraDocs.ts` |
| NEW | `src/pages/system/ServerMap.tsx` |
| NEW | `src/components/server-map/ServerMapDocList.tsx` |
| NEW | `src/components/server-map/MarkdownView.tsx` (react-markdown wrapper + sortable-table override) |
| MOD | `src/App.tsx` (routes: `/system/server-map`, `/system/server-map/:slug`) |
| MOD | `src/components/layout/AppSidebar.tsx` (Server Map entry) |
| MOD | `src/components/layout/Layout.tsx` (PAGE_TITLES) |
| MOD | `src/components/ui/CommandPalette.tsx` (palette entry per doc) |
| MOD | `package.json` (+ `react-markdown`, `remark-gfm`) |

**SPA total: 5 new, 4 modified, 1 dep bump.**

### admin_api (`/home/support/glitchexecutor/admin_api/`)

| Change | Path |
|---|---|
| NEW | `routers/infra_docs.py` (endpoints: `GET /api/infra-docs`, `GET /api/infra-docs/{slug}`, `POST /api/infra-docs/sync`) |
| NEW | `tasks/infra_docs_sync.py` (sync logic + background-task scheduler hook) |
| MOD | `db.py` (`CREATE TABLE infra_docs` added to `run_migrations()`) |
| MOD | `main.py` (include the router; start the background task on FastAPI lifespan startup) |

**admin_api total: 2 new, 2 modified.** No new dependencies (Python
stdlib `hashlib` + `pathlib` + `glob` cover it).

### Migrations

Single `CREATE TABLE IF NOT EXISTS infra_docs` in `run_migrations()`
— matches the existing admin_users + audit_log pattern. No
migrations directory, no Alembic.

---

## 6. Rollback plan

Each layer can roll back independently:

| Layer | If it breaks | Rollback |
|---|---|---|
| SPA | Wrong page renders or crashes | `git revert` the SPA commit; remove sidebar entry; CF Pages rebuilds in ~2 min. No data lost. |
| admin_api endpoints | 500s | `git revert` the router include in `main.py`; SPA's `/system/server-map` shows ErrorState; everything else keeps working. |
| Background sync task | Bad data | Toggle off in `main.py` (one-line); table goes stale but is still readable. Manual sync via the button until fixed. |
| DB cache | Corrupted | `TRUNCATE infra_docs` + trigger a manual sync. The cache rebuilds from disk in seconds. Worst case: `DROP TABLE infra_docs` then re-run `run_migrations()`. |

Source-of-truth (the markdown files in `glitch-trade-app/docs/`) is
never touched by this work, so the worst-case blast radius is "Server
Map page is unavailable". No risk of losing the system-map content.

---

## 7. Reviewer-mode flags (decisions I want you to confirm before coding)

These are the points where I made a judgement call but want your
sign-off before implementation. I'll act on the defaults below unless
you say otherwise.

1. **Sidebar placement = System › Server Map** (between Infrastructure
   and Control Centre). The prompt offered "Settings / Server tab, or
   a new top-level Infra section — your call". My pick reads the v1.4
   IA: System owns shared platform/ops, the system map is a
   *reference* surface for it, so it belongs inside System rather
   than a peer group.

2. **Stack note: admin_api is FastAPI, not Flask.** The prompt says
   "Flask `admin_api`" but the actual code (`/home/support/glitchexecutor/admin_api/`)
   uses FastAPI (`from fastapi import APIRouter`). All my router /
   background-task plans assume FastAPI. Confirming you're aware so
   the plan doesn't read as a misunderstanding.

3. **Auth scheme:** I'll reuse the existing admin_api **bearer JWT**
   (`get_current_user` dependency, same one `/api/settings/*`,
   `/api/customers/*`, `/api/billing/*` use). The prompt referenced
   the SSO cookie `/auth/validate` shape from `sso_service_state.md`;
   that flow is for `glitchexecutor-sso.service` (port 6000), which
   the admin dashboard does NOT currently call directly — the SPA
   authenticates against `admin_api /auth/login` and carries a bearer
   JWT. Sticking with bearer keeps the surface uniform; switching to
   SSO cookie is a separate cross-cutting lane.

4. **Sync source = local working tree, not `git pull`.** I'll glob
   `/home/support/glitch-trade-app/docs/SERVER_*.md` directly. The
   alternative is to have admin_api `git pull` from codeberg/gitlab
   before each sync, which would race the existing `git-sync-all`
   cron + per-lane editors. If you want the panel to reflect "what's
   on the remote" (not "what's on disk"), say so and I'll add an
   explicit pull. My default is "what's on disk" because that
   matches every other admin_api read on this box.

5. **Sync cadence = 5 minutes.** Configurable via env. Faster is fine
   if you want sub-minute response to ad-hoc edits, but the 3 AM
   criterion is already covered by the manual "Resync now" button.

6. **Diff view: v2, not v1.** The prompt flagged it as "optional but
   high-leverage if cheap". It's not free — diffing requires keeping
   per-revision history (extra table or git-history fetch). My
   recommendation: ship v1 (read + search), measure operator demand,
   add diff only if asked.

7. **Two non-`SERVER_*.md` files in scope.** I plan to also ingest
   `SERVER_CONSOLIDATION_LOG.md` (the state-table master log) and
   `SERVER_CONSOLIDATION_CHECKLIST.md` (the index) for completeness
   — both are part of the system-map track and the operator will
   want them. They'll appear under the same surface with `section_num
   = NULL` (sorts to the bottom). Confirm or exclude?

8. **No operator notes / annotations in v1.** Per the prompt's
   "READ-ONLY for the system map" constraint, no inline editing, no
   per-doc notes overlay. If you ever want operator-side annotations
   (e.g. "this row is wrong, talk to X"), they'd live in a separate
   `infra_doc_notes` table — not v1.

9. **Markdown library risk.** `react-markdown` v9 dropped the
   built-in HTML sanitizer (recommends rehype-sanitize for untrusted
   input). Our content is trusted (operator-written docs on the same
   repo), so default config is fine. Flagging in case you want the
   sanitizer plugin anyway as defense-in-depth (one extra dep).

10. **Triple-push.** Already standard for the admin-dashboard repo
    (codeberg + gitlab + GitHub-suspended). The admin_api repo uses
    the same pattern. Both lanes will push to all three remotes; the
    GitHub push will fail as expected.

---

## 8. Out of scope (held for follow-up lanes if you want them)

- Per-revision diff view (v2 candidate; see flag #6).
- Operator annotations on docs (would need a second table; see flag #8).
- Backend full-text search via PG `tsvector` (premature; see §3).
- Webhook-driven sync from codeberg/gitlab (more moving parts than
  the 5-minute poll buys us; revisit only if poll cadence becomes a
  problem).
- A "publish to public docs site" surface — system map is operator-
  internal per the prompt's auth constraint.

---

## Implementation order (after approval)

For sequencing once you green-light:

1. **ADMIN-INFRA-1a** — backend ingest. `infra_docs` table +
   `routers/infra_docs.py` + `tasks/infra_docs_sync.py` + lifespan
   hook in `main.py`. Migration runs on next admin_api container
   restart. Verifiable by curl against `/api/infra-docs`.
2. **ADMIN-INFRA-1b** — SPA surface. `/system/server-map` page +
   sidebar entry + react-markdown wiring. Verifiable by browser.
3. **ADMIN-INFRA-1c** *(optional)* — sortable-table wrapper around
   the rendered GFM tables. If 1b's plain-table render is good
   enough, skip.

Each step is its own commit + push. End-of-1b is the operator's
walkthrough gate (this lane carries a UI render so it parks for a
browser-check before being marked `done`, per the verification
policy memory).
