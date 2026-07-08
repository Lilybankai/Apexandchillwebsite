# League Manager — Technical Architecture (Draft)

> Part of the League Manager planning pack. See `01-product-spec.md` (product),
> `02-competitor-analysis.md` (market), `03-sim-integrations.md` (per-sim APIs).
> This document covers **where it lives, how it's routed, how it plugs into the
> existing site, how results flow in, and how it stays fast**.

---

## 1. Recommendation: build it *inside* the existing Next.js site

**Recommendation: build the League Manager as a route group inside this
repository (`apexandchillwebsite`), not as a separate linked app.** Split it out
later only if scale or team-structure forces it — the design below keeps that
door open.

### Why inside

| Concern | Inside existing site | Separate linked app |
|---|---|---|
| **Apex & Chill promotion** (a core product goal) | Automatic — shared header/footer, merch store, partners, replays one click away; every league page *is* an Apex & Chill page | Needs deliberate cross-linking, duplicated branding, and users still perceive it as "another site" |
| **Time to MVP** | Fast — reuse `lib/env.ts`, `lib/supabase.ts`, Stripe wiring, admin gate, UI kit (`components/ui`), Tailwind theme | Slow — new repo, new deploy target, re-implement env/config/auth/UI foundations |
| **Auth** | One Supabase project → one user across join form, league sign-ups, merch (future) | Cross-domain SSO or duplicate accounts |
| **Stripe** | Existing keys, webhook route and order patterns reused for league billing | Second Stripe integration + second webhook endpoint to operate |
| **Ops burden** | One Vercel project, one env var set, one Supabase project | Two of everything; the operator is one person |
| **SEO** | League/driver pages accrue authority to apexandchill.com | Starts from zero |
| **Blast radius** | A League Manager bug ships with the marketing site | Fully isolated |
| **Independent scaling / tech choices** | Constrained to Next.js + Supabase | Free choice |

The last two rows are the honest costs of "inside". They are mitigated by:

- **Route-group isolation** — all League Manager code lives under
  `app/leagues/` (routes), `components/leagues/` (UI), and `lib/league-manager/`
  (domain logic). No existing page imports from it; it can be extracted into its
  own app later by moving three directories plus its tables.
- **The heavy, stateful part is the database, not the app.** Supabase does the
  scaling; the Next.js layer is stateless route handlers + server components,
  which Vercel scales horizontally regardless of which repo they sit in.
- **A domain alias, not a separate site.** If the product wants its own identity
  later (e.g. `grid.apexandchill.com`), point the subdomain at the same Vercel
  deployment and rewrite `/` → `/leagues`. Identity without a second codebase.

### Why not "monorepo with a second Next.js app"?

This repo is currently a single Next.js package. Introducing workspaces +
a shared `packages/types` for one extra surface adds tooling cost with no user
benefit at MVP. Revisit if a second deployable (e.g. the results-uploader
companion agent, §5.3) grows beyond a single small binary/script — *that* is the
first thing that would justify a `packages/` split, and shared result-JSON types
would move there at that point rather than being duplicated.

---

## 2. App Router route map

Public product surface under `/leagues`, organiser console nested per league,
driver dashboard under `/paddock`. Naming follows the existing kebab-case,
folder-per-route convention (`app/lmu-special-events`, `app/api/next-race`).

```
app/
  leagues/                              # ── public directory & league sites ──
    page.tsx                            # League directory: browse/search leagues, "driver finder" board
    create/page.tsx                     # Create-a-league wizard (auth required)
    [league]/                           # league slug
      page.tsx                          # League home: branding, next race, latest results, join CTA
      seasons/[season]/
        page.tsx                        # Season hub: calendar, entry list, points scheme summary
        standings/page.tsx              # Championship standings (driver / team / class tabs)
        rounds/[round]/page.tsx         # Race card: sessions, results, incidents, penalties, replay embed
        signup/page.tsx                 # Sign-up form (custom questions, class pick)
      drivers/[driver]/page.tsx         # Driver profile within league (results history, penalty points)
      manage/                           # ── organiser console (league_members role-gated) ──
        page.tsx                        # Overview: pending sign-ups, next round checklist, health
        settings/page.tsx               # Branding, visibility, Discord, stewards & admins
        seasons/page.tsx                # Season CRUD, points & penalty scheme editors
        seasons/[season]/
          entries/page.tsx              # Approve sign-ups, grid/teams/car numbers, reserves
          rounds/page.tsx               # Round CRUD: track, date, session format, (Phase 2: server spool-up)
          results/page.tsx              # Ingestion: upload/paste server JSON, review parse, apply
        stewards/page.tsx               # Incident queue: review reports, issue penalties
        import/page.tsx                 # One-click league import from SimGrid / Sim League Pro (§3.5)
  paddock/
    page.tsx                            # Signed-in driver home: my leagues, my entries, my penalties
    profile/page.tsx                    # Driver profile: gamertags, Discord, availability (driver-finder)

  api/
    leagues/
      route.ts                          # GET directory (paginated) / POST create league
      [league]/route.ts                 # GET league bundle; PATCH (staff)
      [league]/signups/route.ts         # POST sign-up; PATCH accept/decline (staff)
      [league]/incidents/route.ts       # POST incident report; PATCH steward decision
    ingest/
      results/route.ts                  # POST results JSON (organiser upload OR agent token) → §5
    webhooks/
      stripe/route.ts                   # EXISTING — extended with league billing events (§4.3)
```

Notes:

- **Server components by default.** Every `page.tsx` above fetches via
  `lib/league-manager/*` server-side. Client components only where interaction
  demands it (sign-up form, scheme editors, ingestion review), mirroring how
  `join`/`merch` are built today.
- **Route handlers are thin.** Domain logic lives in `lib/league-manager/`
  (e.g. `points.ts`, `standings.ts`, `ingest/parse-acc.ts`) so it is testable
  and reusable from both pages and API routes — same split as `lib/api/*` today.
- **Public pages need no login.** Standings, race cards and league homes are
  shareable/SEO surfaces; auth is only required to sign up, manage, or report.

---

## 3. Integration points with the existing site

### 3.1 Auth — the one genuinely new foundation

Today the site has **no end-user auth**: just the single-password `/admin` gate
(`middleware.ts` + `lib/admin-auth.ts`). The League Manager needs real accounts
(drivers, organisers, stewards). Plan:

- **Supabase Auth** on the existing Supabase project — `@supabase/supabase-js`
  is already a dependency and `lib/supabase.ts` already builds clients from
  `lib/env.ts`. Add the `@supabase/ssr` helper for cookie-based sessions in
  server components/route handlers.
- **Discord OAuth as the primary provider** (sim racing communities live on
  Discord; it also gives us the Discord handle for driver rosters), plus
  email/password fallback.
- **`middleware.ts` grows two matchers**: `/paddock/:path*` (require session)
  and `/leagues/:path*/manage/:path*` (require session; role check happens in
  the layout via `league_members`, not in edge middleware, to avoid a DB call
  per edge request). The existing `/admin` password gate is untouched — it
  remains the *operator* backdoor and gains a League Manager oversight tab.
- **Authorisation is data, not code**: roles live in `league_members`
  (owner / admin / steward / driver) and are enforced twice — in
  `lib/league-manager` guards *and* in Postgres RLS (see `05-data-model.sql`),
  so a bug in one layer doesn't expose writes.

### 3.2 Navigation & branding

- `components/layout/Header.tsx` / `Footer.tsx`: add one top-level item —
  **"Leagues"** → `/leagues`. The existing Standings/Schedule pages stay as-is
  for Apex & Chill's own championships during transition.
- **Apex & Chill's own leagues are dogfooded as rows in the new system** and
  flagged `featured` — they headline the `/leagues` directory. Every hosted
  league page carries "Powered by Apex & Chill Racing" with links back to
  merch/partners/Discord: the promotion loop the product exists for.
- Reuse `components/ui` (Button, Card, Marquee) and the Tailwind theme so the
  product looks native on day one — and the feature components that already
  exist for Apex & Chill's own championships (`StandingsTable`, `LeagueTabs`,
  `RoundCard`/`ScheduleList`, `NextRaceCard`, `JoinForm`) are the starting
  point for the league-generic versions rather than new builds.

### 3.3 Stripe

- MVP is free; billing is Phase 2 (premium league tier: custom branding, more
  seasons, server automation). Competitor pricing anchors the tier at
  **$5.99–7.99/mo** (SimGrid Grid Pass / Partner — see
  `02-competitor-analysis.md`), which means Stripe **subscriptions**, not
  one-off Checkout. When it lands it reuses the existing wiring:
  `stripe` config in `lib/env.ts`, Checkout Session creation modelled on
  `app/api/checkout/route.ts`, and the **existing** webhook endpoint
  `app/api/webhooks/stripe/route.ts` switching on new event types
  (`customer.subscription.*`) → a `league_billing` table, exactly as
  `checkout.session.completed` → `merch_orders` works today.

### 3.4 Existing data layer & config conventions

- New env keys go through `lib/env.ts` with the same "missing key ⇒ feature
  degrades gracefully, never throws at import" contract, and get an
  `isConfigured('leagueManager…')` case. Expected keys: ingestion HMAC secret,
  per-provider server-hosting API keys (Phase 2).
- `lib/api/simgrid.ts` / `simleaguepro.ts` remain the read-side for current
  seasons; new shared domain types extend `lib/types.ts` (single-package rule:
  shared types live in the shared module, not duplicated per feature).
- **Hot files — single-owner, coordinate before touching** during the build
  phase: `lib/types.ts`, `lib/env.ts`, `lib/leagues.ts`, `supabase/schema.sql`,
  `components/layout/Header.tsx`, and `.env.example` (which has a history of
  live secrets being pasted in — audit before every commit that touches it).

### 3.5 League import — the switching-cost killer

Both competitors expose **public, unauthenticated league data**, and this repo
already has working clients for both (`lib/api/simgrid.ts`,
`lib/api/simleaguepro.ts`). `manage/import` reuses them as a one-click wizard:
paste a SimGrid championship / Sim League Pro league URL → we pull seasons,
calendar, entry list, standings and per-race results → preview → write into the
tables in `05-data-model.sql` (imported drivers land unclaimed in `drivers`,
ready to be claimed on first sign-in). This turns "migrating my league" — the
single biggest reason organisers stay put — into minutes, and it is nearly free
to build because the data models are already mapped in `lib/api/*`.

---

## 4. Results-ingestion service design

The core magic: **race server JSON in → race cards & standings update
automatically.** Per-sim specifics are Builder 2's `03-sim-integrations.md`;
this section is the pipeline they plug into.

### 4.1 Pipeline

```
 [source] ──▶ POST /api/ingest/results ──▶ result_ingestions (raw, immutable)
                                               │  parse (per-sim adapter)
                                               ▼
                                   race_sessions + results (normalised)
                                               │  points engine
                                               ▼
                    points_scheme + penalties ─▶ results.points
                                               │  standings recompute
                                               ▼
                                     standings_cache (per season/class)
                                               │
                                               ▼
                        revalidateTag('standings:<season>', 'round:<round>')
```

1. **Receive & store raw.** `POST /api/ingest/results` accepts the sim's
   native results file, authenticated as an organiser session **or** a per-league
   agent token (scoped, revocable, HMAC-signed). The endpoint is architecturally
   the existing Stripe webhook (`app/api/webhooks/stripe/route.ts`): verify the
   signature, then **idempotent upsert** — the same file POSTed twice (agent
   retries) lands as one ingestion, exactly as `stripe_session_id` dedupes
   `merch_orders`. The raw payload is written verbatim to `result_ingestions`
   *before* any parsing — immutable audit trail, free re-processing when a
   parser improves, and no data loss on parser bugs.
2. **Parse.** A per-sim adapter (`lib/league-manager/ingest/<sim>.ts`)
   implements one interface: `parse(raw) → NormalisedSession` (session type,
   track, laps, per-driver classification, best laps, DNF/DSQ flags). Adapters
   are pure functions — unit-testable against fixture files from real servers.
3. **Match drivers.** Server JSON identifies drivers by platform name/ID, which
   rarely equals the roster name. Matching is: exact platform-ID → alias table
   (`driver_aliases`) → fuzzy suggestion queued for organiser confirmation.
   Every confirmed match writes an alias, so season round 2 onwards is fully
   automatic.
4. **Apply.** One transaction writes `race_sessions` + `results`, runs the
   points engine (league's `points_scheme` + standing `penalties`), and
   recomputes `standings_cache` for the season. Ingestions land as `parsed`
   for organiser review-then-apply by default; leagues can enable auto-apply.
5. **Invalidate.** `revalidateTag` on the affected season/round tags so the
   public pages regenerate on next request (see §6).

### 4.2 Ingestion sources (in delivery order)

1. **MVP — manual upload/paste.** Organiser drops the results JSON on
   `manage/seasons/[season]/results`. Zero infrastructure, works for every sim
   that writes a results file, and exercises the whole pipeline end-to-end.
2. **Companion uploader agent.** A tiny script/binary on the game-server box
   watching the results folder and POSTing new files with the league's agent
   token. Turns "upload after each race" into fully hands-off. (This is the
   candidate second package, §1.)
3. **Hosting-provider pull.** For managed hosts with APIs, a scheduled job
   pulls results directly — no agent needed.
4. **Server provisioning (Phase 2/3).** A `ServerProvider` interface
   (`provision(roundConfig) → serverInstance`) per sim/host lets a round in
   `manage/rounds` spool up its own server; feasibility per sim comes from
   `03-sim-integrations.md`. Designed-for now, built later.

### 4.3 Failure handling

Consistent with the repo's "no silent failures" rule: every ingestion row
carries `status` (`received → parsed → applied` / `failed`) and `error`;
failures surface in the organiser console with the raw file downloadable.
Parse errors never partially write results (single transaction per apply).

---

## 5. Performance considerations

- **Standings are computed on write, read from `standings_cache`.** The
  expensive aggregation (points, drops, penalties, tie-breaks across a season)
  runs once per ingestion/penalty event — never on page view. Public standings
  pages are a single indexed read: `standings_cache where season_id = ? order by
  position`. This is also what makes "live championship" pages cheap to cache.
- **Kill N+1 at the query layer.** Page bundles are fetched as one or two
  queries using PostgREST embedded selects (e.g. season → rounds → track in one
  request; entry list with team + driver embedded), or a Postgres view/RPC where
  the shape is deep (race card = sessions + results + penalties + incidents).
  Never loop `await` per row — same discipline as `lib/api/*` batching today.
- **Cache with tags, not TTL guesswork.** Public league pages use Next's data
  cache with `unstable_cache`/`revalidateTag` keyed per league/season/round
  (`CACHE_TTL_SECONDS` as the outer bound, mirroring the existing API-route
  caching). Writes (ingestion apply, penalty issued, entry accepted) invalidate
  exactly the affected tags — pages are static-fast between races, fresh within
  one request after results land.
- **Lazy-load the heavy tails.** Replay/clip embeds on race cards and incident
  evidence load via `next/dynamic` + intersection observer; the organiser
  console's scheme editors and ingestion review (client components) are
  code-split per route by the App Router automatically. Driver directory and
  results tables paginate at the query (`range()`), not in the client.
- **Indexes shipped with the schema** (see `05-data-model.sql`): every FK,
  plus the hot paths — `standings_cache (season_id, class_id, position)`,
  `results (session_id, position)`, `penalties (season_id, driver_id)`,
  `signups (season_id, status)`.
- **Client re-renders.** Standings/race tables are server-rendered HTML —
  no client state, nothing to re-render. Interactive islands (sign-up form,
  steward queue) keep state local and derive rather than duplicate, matching
  the existing merch product-page pattern.

---

## 6. Open questions (for Coordinator / product)

1. **Product name & URL prefix** — `/leagues` assumed here; Builder 1's spec
   owns naming (affects only the route-group folder name).
2. **Auth provider set** — Discord-first assumed; confirm whether PSN/Steam
   linking is MVP (drives `drivers.platform_ids` usage).
3. **Migration of current GT7/LMU seasons** — dogfood immediately (flagged
   `featured`) or run parallel until the first full season completes?
