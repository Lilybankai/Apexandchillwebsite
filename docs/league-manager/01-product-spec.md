# Apex League Manager — Product Specification

> **Status:** Draft v1 — swarm task `task-mrbzg5bi-bdd95a88` (Builder 1)
> **Date:** 2026-07-08
> **Companion doc:** [02-competitor-analysis.md](./02-competitor-analysis.md)

## 1. Vision

A user-friendly league-management platform for sim racing — an Apex & Chill-branded
alternative to SimGrid and Sim League Pro. Organisers of leagues, racing communities
and endurance teams get one clean place to run everything: sign-ups, seasons, rounds,
tracks, drivers, teams, points systems, penalty points, incident reports and steward
workflows — with automatic results ingestion from self-hosted race servers where the
sim supports it.

**The gap we're filling:** the incumbents are powerful but complicated. Both platforms
present many screens and many required fields before an organiser gets value. There is
room for a product that is opinionated, fast to set up, looks good, and promotes Apex
& Chill Racing at the same time.

**Positioning options** (decision needed — see Open Questions):

1. **Inside the existing site** — a route group (e.g. `/league-manager`) in this
   Next.js app, sharing the Supabase project, auth and design system.
2. **Linked sister site** — its own domain (e.g. `leagues.apexandchill.com`),
   cross-linked from the main site, sharing branding and (optionally) the Supabase
   backend.

Either way the product is a funnel for Apex & Chill: every public league page carries
our branding, and our own GT7/LMU/Thursday leagues are flagship tenants.

## 2. Supported titles

| Title | Server/results integration | Notes |
|-------|---------------------------|-------|
| Assetto Corsa Competizione (ACC) | ✅ Dedicated server; results JSON; community server-manager APIs | Best-documented ecosystem |
| Assetto Corsa (AC) | ✅ Dedicated server; results JSON; mature community tooling | |
| Assetto Corsa EVO | 🔶 Server platform still maturing; SimGrid currently holds an official connection | Watch closely |
| Le Mans Ultimate (LMU) | 🔶 Results files / RaceControl-style ingestion; SimGrid holds an official connection | We already consume SimGrid's LMU data today |
| F1 25 | 🔶 No dedicated-server results file; UDP telemetry broadcast per session | Requires a capture client or manual entry |
| Gran Turismo 7 (GT7) | ❌ No server API — manual/CSV results entry | Our existing GT7 league runs on Sim League Pro today |

Manual results entry is a first-class feature, not a fallback — it makes every sim
supportable on day one and covers titles with no server API.

## 3. Personas

### 3.1 League organiser ("Race Director")
Runs a community league in their spare time. Wants: create a league in minutes, open
sign-ups, publish a season calendar, score races without spreadsheets, and hand out
penalties that automatically hit the standings. Pain today: incumbent platforms
front-load dozens of configuration fields; scoring edge cases mean manual overrides.

### 3.2 Driver
Wants to find a league that matches their sim, platform, skill level and timezone;
sign up in two clicks; see their race card, results, penalty points and championship
position; get notified about upcoming rounds. Pain today: discovery is fragmented
(Discord servers, forums); every league has a different sign-up form.

### 3.3 Team manager (endurance focus)
Manages a roster across one or more endurance teams: driver line-ups per round, stint
plans, team standings, team liveries/colours. Pain today: most platforms model drivers
well but teams poorly; endurance line-up changes are handled in Discord DMs.

### 3.4 Steward
Reviews incident reports post-race. Wants: a queue of incidents with evidence (clip
links, lap/turn, involved drivers), a structured verdict form (no action / warning /
time penalty / grid penalty / points penalty / penalty points on licence), and
automatic application of the outcome to results and standings. Pain today: stewarding
happens in Discord threads; outcomes are re-keyed into results by hand.

## 4. Feature specification

### 4.1 League creation & branding
- Wizard-style creation: name, sim title, platform(s), region/timezone, logo, colours.
  **Opinionated defaults everywhere** — an organiser reaches a publishable league page
  in under 5 minutes, then deepens configuration later.
- Public league page: branding, description, rules, schedule, standings, sign-up CTA.
- Roles per league: owner, admin, steward, broadcaster/commentator (read + embed).
- "Powered by Apex & Chill Racing" on public pages (removable on a paid tier, if we
  ever charge).

### 4.2 Sign-ups & driver registry
- Configurable sign-up forms (like our existing `/join` flow): platform ID (PSN/GT
  gamertag/Steam), Discord, experience, input method, car-class preference,
  eligibility acknowledgement.
- Application review queue with statuses (`new | reviewed | accepted | declined`) —
  mirrors the existing `join_submissions` table design.
- Driver profiles: cross-league identity, race history, licence/penalty points,
  stats (wins, podiums, avg quali/finish — same shape as our `StandingRow`).
- Waitlists and reserve-driver flags (Sim League Pro models `reserve`; we should too).

### 4.3 Teams
- Team registry per league: name, livery colour (`teamColor` in our existing types),
  logo, manager.
- Endurance mode: multi-driver entries per car, per-round line-ups, driver-swap
  tracking, minimum-drive-time flags.
- Team championships scored alongside driver championships.

### 4.4 Seasons, rounds & tracks
- A league contains seasons; a season contains rounds; a round has track, date/time
  (timezone-aware; we already render Europe/London), format (sprint/feature/endurance),
  car classes, and an optional server booking.
- Track database per sim title (seeded; extendable by organisers).
- Season calendar view + ICS export; "next race" cards (we already have `NextRace`).

### 4.5 Points systems
- Preset templates (F1 2025-style, indy-style, linear, endurance per-class) plus a
  fully custom editor: points per position, per class, fastest-lap bonus, pole bonus,
  qualifying points, drop rounds, half points, team-scoring rules.
- Points recompute is derived, never stored-only: standings are recalculated from
  results + penalties so a late steward verdict re-flows automatically.

### 4.6 Penalty points & licence system
- Per-driver penalty-point ledger with per-season thresholds (e.g. N points = race
  ban) and automatic expiry rules.
- Both platforms treat penalties as an afterthought in standings; our `StandingRow`
  already carries `penalties` — surface it prominently.

### 4.7 Incident reports & steward workflow
- Drivers submit reports post-race: round, lap/turn, involved drivers, description,
  evidence links (YouTube/Twitch clip, replay timestamp).
- Steward queue: assign stewards, discussion thread, structured verdict
  (no action / warning / time / grid / points penalty / licence points), majority
  voting for multi-steward panels (SimGrid's own events use 3 impartial judges —
  support that pattern natively).
- Verdicts apply automatically to race results and standings; a public (or private)
  stewarding log per round builds trust.

### 4.8 Race cards & results
- Race card per round: entry list, grid, results per class, fastest lap, penalties
  applied, incident outcomes.
- Results entry paths, in priority order:
  1. **Automatic** — ingest results JSON from a connected/self-hosted server (§4.10).
  2. **Upload** — organiser uploads the sim's results file (ACC/AC JSON, LMU export).
  3. **Manual** — fast grid-entry UI (position picker, DNF/DSQ flags) and CSV import.
- Post-race: standings, race card and championship cards update automatically.

### 4.9 Championship standings & driver-finder
- Driver + team standings per class, live-updated; embeddable widgets for community
  sites (this is exactly what our own site consumes from SimGrid/SLP today — we should
  offer the API we wish they had).
- **Driver-finder / league-finder:** searchable directory across all hosted leagues by
  sim, platform, region, day-of-week, skill level, open seats. Also the reverse:
  drivers post availability; organisers and endurance team managers search for
  drivers. This two-sided discovery is under-served by both incumbents.

### 4.10 Server integration ("spool up the round")
- Organiser links a server provider (self-hosted VPS agent, or partner hosting) per
  league. Creating a round can provision/configure the server (track, weather, entry
  list from accepted sign-ups) and, post-race, the results JSON is pulled or pushed
  back and ingested automatically.
- Per-sim adapters behind one internal interface (`ResultsAdapter` /
  `ServerAdapter`): ACC and AC first (documented dedicated servers + results JSON and
  existing open-source server-manager APIs), AC EVO and LMU as their ecosystems open
  up, F1 25 via a UDP capture companion app (Phase 3).
- Design principle: the platform must be fully useful with **zero** server
  integration (manual + upload paths), so integration is acceleration, not a
  prerequisite.

### 4.11 Public API & open source
- Public read API (JSON) for standings/schedule/race cards per league — no auth for
  public data, mirroring what Sim League Pro got right (`GET /api/v1/leagues/{id}.json`
  needs no token and is why our GT7 integration was easy).
- The user's goal mentions publishing around GitHub: candidate is open-sourcing the
  per-sim results parsers/adapters as a standalone package — community contributions
  add sims for us, and it markets the platform to exactly our target users.

## 5. Scope phasing

### MVP (Phase 1) — "run a league end-to-end, manually"
- League creation wizard + public league page + roles
- Sign-up forms + application queue + driver registry
- Seasons/rounds/tracks + calendar
- Preset + custom points systems
- Manual results entry + results-file upload (ACC/AC JSON parsing)
- Driver + team standings, race cards
- Penalty points ledger (manual award)
- Apex & Chill branding; our own leagues migrated as flagship tenants
- League directory (basic finder: sim/platform/region filters)

### Phase 2 — "trust and automation"
- Incident reports + steward queue + verdict workflow + auto-applied outcomes
- Endurance/team features (multi-driver entries, line-ups)
- Embeddable widgets + public read API
- Notifications (email/Discord webhooks) for sign-up status, upcoming rounds, verdicts
- LMU results ingestion; driver-finder (two-sided: driver availability profiles)

### Phase 3 — "server integration & ecosystem"
- Server provisioning adapters (ACC/AC first), auto entry-list push, auto results pull
- AC EVO + LMU server hooks as their APIs mature; F1 25 UDP capture companion
- Open-source parser/adapter package on GitHub
- Optional monetisation (hosted servers markup, premium branding tier)

## 6. Architecture notes (for the technical-design task)

- **Stack fit:** the existing site is Next.js 15 App Router + React 19 + Tailwind +
  Supabase. The MVP fits this stack directly; `lib/types.ts` already defines
  `StandingRow`, `ScheduleRound`, `NextRace` etc. that generalise cleanly from
  "consume other platforms" to "be the platform".
- **Data model direction:** Supabase Postgres with RLS (the existing
  `join_submissions`/`race_standings` schema shows the house style: enums, RLS on,
  anon INSERT where public forms need it, service-role for privileged paths).
- **Auth:** Supabase Auth (Discord OAuth first — it is the identity our audience
  already has), plus roles per league.
- **Performance:** standings recomputation should be set-based in SQL (avoid N+1 per
  driver); public pages are server components with cache TTLs mirroring the existing
  `CACHE_TTL_SECONDS` pattern; widgets/embeds served from cached endpoints.
- **Multi-league from day one:** every table keys on `league_id` — no single-tenant
  assumptions, since promoting external organisers onto the platform is the point.

## 7. Success criteria

- An organiser with no help reaches a published league page with open sign-ups in
  **< 5 minutes** (measure it — this is the core differentiator vs incumbents).
- A full race weekend (results in → penalties applied → standings updated → race card
  published) requires **zero spreadsheet use**.
- Apex & Chill's own three leagues run on it, replacing the SimGrid/SLP consumption
  paths on the main site.
- At least one external community runs a season end-to-end in the first cycle after
  Phase 2.

## 8. Open questions (for Operator / Coordinator)

1. **In-site vs sister site** (§1) — affects routing, auth and SEO strategy. Lean:
   start in-site under a route group to reuse everything, split out later if it grows.
2. **Working branch** — the goal asks for "a completely different working branch",
   but swarm rules forbid creating branches; docs are on the current branch for now.
3. **Monetisation** — free like Sim League Pro (growth/branding play) vs paid tiers
   like SimGrid (Grid Pass / server credits)? MVP assumption: free.
4. **Name** — "Apex League Manager" used as a working title throughout.
5. **GT7 scope** — no API exists; is first-class manual tooling for GT7 a launch
   requirement given our flagship GT7 league? (Assumed yes in MVP.)
