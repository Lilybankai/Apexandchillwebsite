# Competitor Analysis — SimGrid & Sim League Pro

> **Status:** Draft v1 — swarm task `task-mrbzg5bi-bdd95a88` (Builder 1)
> **Date:** 2026-07-08
> **Companion doc:** [01-product-spec.md](./01-product-spec.md)

## Method & sourcing caveats

Both `thesimgrid.com` and `simleaguepro.com` (and their subdomains) return HTTP 403
to automated fetches, so this analysis is built from: (a) web-search results quoting
their marketing/help/rules pages, (b) **first-hand knowledge from this repo's live
integrations** (`lib/api/simgrid.ts`, `lib/api/simleaguepro.ts` — we consume both
platforms' APIs in production today), and (c) third-party reviews. Claims sourced
from marketing copy are flagged as such. A follow-up logged-in walkthrough of both
organiser dashboards would strengthen the UX-pain-point sections (candidate Scout
task).

---

## 1. SimGrid (thesimgrid.com)

### 1.1 Overview
The market leader: positions itself as "the biggest, fastest-growing home for sim
racers", offering daily ranked races, community-hosted events and championships
across every major sim. Claims to be **the only platform officially connected to Le
Mans Ultimate and Assetto Corsa EVO** — a genuine moat for those two titles. Runs
manufacturer-backed esports (Mercedes-AMG Motorsport Virtual Championship) and is
the scoring partner for RaceControl.gg's LMU successor.

### 1.2 League/community features
- Communities host single-driver races and **team-based endurance competitions**
  across any supported game/platform.
- Custom community profiles (logo, branding); custom points systems per event;
  organisers can highlight perks (live stewarding, broadcasting, prizes).
- Event/championship pages with rules, entry lists, results and standings; an
  **Event Finder** for drivers to discover races (marketing: "eliminates the
  complexities of managing your league through spreadsheets and Discord").
- Stewarding: incident reports are submitted through the platform and reviewed
  post-race; penalties are time- or points-based. SimGrid's own events use a
  **3-impartial-judge unanimous model** — but community leagues largely define and
  operate their own stewarding processes in rules text, not structured tooling.
- Weekly feature releases; actively engaged with community owners (marketing claim).

### 1.3 Pricing
- **Grid Pass** subscription: **$5.99/month** — performance-analysis app (per-lap,
  per-stint detail), SimGrid Seasons daily racing (incl. console), Pro Discord role,
  ad-free browsing. Bundled with Coach Dave Academy's Delta subscription.
- **Server hosting via credits**: scalable pricing by server size, from **~€0.38/hr**
  — organisers rent race servers directly through the platform.
- Hosting/joining community championships is free; monetisation is driver-side
  subscription + server credits.

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
- **Stewarding is process, not product**: community leagues write stewarding rules
  as prose; there's no first-class structured verdict/queue tooling for them.
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
platforms (includes long-tail sims, e.g. Live for Speed — and GT7, which is why our
GT7 league lives there). Explicitly "under heavy development with more features
added weekly".

### 2.2 League features
- Build leagues and races, manage drivers, score events, auto-updating leaderboards.
- **Role system**: community managers create leagues and assign league admins,
  commentators, stewards.
- **Custom scoring**: "easy to understand, but can be customized in any way".
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
| Price (organiser) | Free + server credits | Free | Free at launch |
| Price (driver) | Grid Pass $5.99/mo for pro features | Free | Free |
| Titles | All major sims; official LMU + AC EVO | Broad incl. long-tail + GT7 | F1 25 / LMU / ACC / AC EVO / AC / GT7 |
| Setup UX | Powerful but complex, many screens | Simpler but dated | **< 5-min wizard, opinionated defaults** |
| Custom points | ✅ | ✅ | ✅ + derived recompute |
| Penalty-point licence ledger | Rules-text only | Partial (`penalty_points` field) | **First-class ledger + thresholds** |
| Incident reports / stewarding | Platform-level; community leagues DIY | Role only, no workflow | **Structured queue, verdicts, auto-apply** |
| Endurance team mgmt | Shallow | Minimal | **Line-ups, swaps, team champs** |
| Server provisioning | ✅ (credits, in-platform) | ❌ | Phase 3 adapters (ACC/AC first) |
| Auto results ingestion | ✅ for connected sims | ❌ manual | Upload (MVP) → auto (Phase 3) |
| Driver-finder | Event Finder (events, not drivers) | League search | **Two-sided: drivers ↔ seats** |
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
4. **Manual-first results entry is a feature**, not a stopgap: it makes GT7 (and any
   future sim) supportable day one, where SimGrid's automation-centric model can't go.
