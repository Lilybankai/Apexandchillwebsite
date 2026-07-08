# Competitor Analysis — SimGrid & Sim League Pro

> **Status:** Draft v1 — swarm task `task-mrbzg5bi-bdd95a88` (Builder 1)
> **Date:** 2026-07-08
> **Companion doc:** [01-product-spec.md](./01-product-spec.md)

## Method & sourcing caveats

Both `thesimgrid.com` and `simleaguepro.com` (and their subdomains) return HTTP 403
to automated fetches, so this analysis is built from: (a) web-search results quoting
their marketing/help/rules pages, (b) **first-hand knowledge from this repo's live
integrations** (`lib/api/simgrid.ts`, `lib/api/simleaguepro.ts` — we consume both
platforms' APIs in production today), (c) third-party reviews, and (d) Scout 1's
recon report on the swarm board. Claims sourced from marketing copy are flagged as
such. A follow-up logged-in walkthrough of both organiser dashboards would
strengthen the UX-pain-point sections — flagged to the Operator as an open item;
this analysis does not block on it.

---

## 1. SimGrid (thesimgrid.com)

### 1.1 Overview
The market leader at scale: **~300,000 drivers, 2,800+ communities, 16 titles**
(PC + console). Positions itself as "the biggest, fastest-growing home for sim
racers", offering daily ranked races, community-hosted events and championships
across every major sim. Claims to be **the only platform officially connected to Le
Mans Ultimate and Assetto Corsa EVO** (LMU league racing runs through RaceControl.gg
"powered by SimGrid") — a genuine moat for those two titles. Runs manufacturer-backed
esports (Mercedes-AMG Motorsport Virtual Championship).

### 1.2 League/community features
- Communities host single-driver races and **team-based endurance competitions**
  across any supported game/platform.
- Custom community profiles (logo, branding); custom points systems per event;
  organisers can highlight perks (live stewarding, broadcasting, prizes).
- Event/championship pages with rules, entry lists, results and standings; an
  **Event Finder** for drivers to discover races (marketing: "eliminates the
  complexities of managing your league through spreadsheets and Discord").
- Stewarding: incident reports are submitted through the platform and reviewed
  post-race; penalties are time- or points-based, and organisers get post-race
  stewarding tools (edit results, add penalties, adjust times). SimGrid's own events
  use a **3-impartial-judge unanimous model** — but community leagues still define
  their stewarding *process* (panels, voting, evidence standards, licence-point
  ledgers) in rules text rather than structured workflow tooling.
- Team management and endurance/team races with stint swaps; class-based
  championship scoring; Discord integration.
- **Server automation — the bar we must clear:** the "SimGrid App" in Full Server
  Service mode reads scheduled events from the community profile, **auto-boots the
  ACC (PC) server at start time, and auto-uploads the generated results** back to
  SimGrid, keyed by an API key. ACC has no hosted REST API, so this local-agent +
  API-key pattern is the proven design for the exact loop our goal describes
  (spool server for a round → ingest results JSON → auto-update race cards).
- Weekly feature releases; actively engaged with community owners (marketing claim).

### 1.3 Pricing
- **Grid Pass** subscription: **$5.99/month** — performance-analysis app (per-lap,
  per-stint detail), SimGrid Seasons daily racing (incl. console), Pro Discord role,
  ad-free browsing. Bundled with Coach Dave Academy's Delta subscription.
- **Partner Program** (communities): **$7.99/month** flat (previously tiered up to
  ~$24/mo Gold); Bronze/Silver/Gold tiers carry 10/12/15% affiliate commission.
- **Server hosting via credits**: scalable pricing by server size, from **~€0.38/hr**
  — organisers rent race servers directly through the platform.
- Core community hosting is effectively low-cost/freemium; monetisation is the
  driver-side subscription + community partner tier + server credits.

### 1.4 API (first-hand, from our production client)
- `GET https://www.thesimgrid.com/api/v1/championships/{id}` → metadata, `races[]`,
  `upcoming_race`; `GET .../championships/{id}/standings` → entries grouped by car
  class. Auth: `Authorization: Bearer <token>`.
- Works, but is read-only, championship-scoped and thinly documented; standings
  grouped by class need client-side reshaping (our client normalises this). No
  webhooks — we poll with a cache TTL.

### 1.5 Pain points & gaps (our opportunity)
- **Complexity**: many screens and required fields to set up a championship; the
  platform is driver-discovery-first, organiser-UX second. This is the gap the
  swarm goal identifies.
- **Stewarding workflow is thin**: results-editing and penalty tools exist, but
  community leagues still run panels, voting, evidence handling and verdict logs as
  prose rules + Discord threads — no first-class structured incident queue.
- **Penalty-point/licence systems** per league are rules-text, not tracked ledgers.
- **Endurance team management** (per-round line-ups, driver swaps, stint plans) is
  shallow relative to what endurance communities improvise in Discord.
- **API**: read-only, no webhooks, token-gated even for public data — hard for
  communities to build their own sites on top (we know; we did).
- Driver-side paywall (Grid Pass) creates friction incumbents can't easily undo.

---

## 2. Sim League Pro (simleaguepro.com)

### 2.1 Overview
A **free** league-management platform: "promote and manage leagues with ease for
free", from small friend groups to multi-league communities across many games and
platforms (F1 2025, GT7 — which is why our GT7 league lives there — Rennsport, and
long-tail sims like Live for Speed, with per-game pages at `/games/*`). Explicitly
"under heavy development with more features added weekly".

### 2.2 League features
- Build leagues and races, manage drivers, score events, auto-updating leaderboards.
- **Role system**: community managers create leagues and assign league admins,
  commentators, stewards.
- **Custom scoring**: "easy to understand, but can be customized in any way",
  including per-manufacturer/team scoring; teams are modelled.
- Driver-side league search across platforms/games.
- Models useful detail we can confirm from its API payloads: `penalty_points`,
  `reserve` drivers, `vehicle_classes`, per-race `race_results[]`.

### 2.3 Pricing
Free. No visible premium tier. (Implication: monetisation pressure may arrive
later; also implies limited resources — a small team, consistent with the weekly-
dev messaging and the polish gap.)

### 2.4 API (first-hand, from our production client)
- `GET https://simleaguepro.com/api/v1/leagues/{id}.json?include_results=true` —
  **one public endpoint, no auth**, returns the whole league: metadata,
  `league_results[]` (standings incl. penalty points), `races[]` with per-race
  results. Trivial to integrate (our GT7 integration is one file).
- Downsides: all-or-nothing payload (no granular endpoints), no webhooks, no write
  API, no schedule-only endpoint (we bundle a sample schedule because of this).

### 2.5 Reputation & pain points
- Trustpilot: **4★ from only 4 reviews** — tiny footprint. Praise centres on the
  dev team, scoring tools and simple sign-ups.
- Gaps: no server integration/hosting at all (fully manual results), thin incident/
  steward tooling (stewards are a role, not a workflow), dated visual polish, weak
  discovery network effects vs SimGrid, endurance/team features minimal.

---

## 3. Head-to-head vs the Apex League Manager opportunity

| Capability | SimGrid | Sim League Pro | Apex opportunity |
|---|---|---|---|
| Price (organiser) | Freemium; Partner $7.99/mo + server credits | Free | Free at launch |
| Price (driver) | Grid Pass $5.99/mo for pro features | Free | Free |
| Titles | All major sims; official LMU + AC EVO | Broad incl. long-tail + GT7 | F1 25 / LMU / ACC / AC EVO / AC / GT7 |
| Setup UX | Powerful but complex, many screens | Simpler but dated | **< 5-min wizard, opinionated defaults** |
| Custom points | ✅ | ✅ | ✅ + derived recompute |
| Penalty-point licence ledger | Rules-text only | Partial (`penalty_points` field) | **First-class ledger + thresholds** |
| Incident reports / stewarding | Platform-level; community leagues DIY | Role only, no workflow | **Structured queue, verdicts, auto-apply** |
| Endurance team mgmt | Shallow | Minimal | **Line-ups, swaps, team champs** |
| Server provisioning | ✅ credits + SimGrid App (local agent auto-boots ACC) | ❌ | Phase 3 adapters (ACC/AC first, agent + API-key pattern) |
| Auto results ingestion | ✅ SimGrid App auto-uploads results | ❌ manual | Upload (MVP) → auto (Phase 3) |
| Driver-finder | Event Finder (events, not drivers) | League search | **Two-sided: drivers ↔ seats** |
| League import | ❌ | ❌ | **One-click import from SimGrid/SLP** |
| Public API | Read-only, token, undocumented | One open endpoint | **Open read API + webhooks + embeds** |
| Open source | ❌ | ❌ | **OSS results parsers/adapters on GitHub** |

### Strategic take
1. **Don't fight SimGrid on network effects or official partnerships** (LMU/AC EVO
   connections, esports). Win on **organiser experience**: fastest setup, best
   stewarding/penalty tooling, best endurance-team support.
2. **Sim League Pro proves free works** for adoption but shows the ceiling of a
   small unpolished product — we bring the Apex & Chill brand, a modern stack and
   design quality it lacks.
3. **Both have weak developer surfaces.** An open read API + embeddable widgets +
   OSS parsers is cheap for us (we build the site with them anyway) and directly
   courts the community-site builders who feel the incumbents' API pain — we were
   that customer.
4. **Both expose public league data — build the switching path.** A one-click
   "import your league from SimGrid / Sim League Pro" wizard is nearly free for us:
   working clients for both APIs already live in this repo (`lib/api/*`). Neither
   incumbent offers migration in either direction.
5. **Manual-first results entry is a feature**, not a stopgap: it makes GT7 (and any
   future sim) supportable day one, where SimGrid's automation-centric model can't go.
6. **For server automation, copy the proven SimGrid App shape**: a local agent with
   an API key that boots the ACC/AC server for scheduled rounds and pushes results
   back (webhook-style ingest — same idempotent-upsert shape as our existing Stripe
   webhook handler). F1 25 is UDP-telemetry-only and GT7 has no self-hosting, so
   those titles stay on capture/manual paths.
