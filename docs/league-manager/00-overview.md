# Apex League Manager — Planning Pack Overview

> **Status:** Draft v1 — swarm synthesis (Coordinator)
> **Date:** 2026-07-08
> **The pack:** [01 Product spec](./01-product-spec.md) · [02 Competitor analysis](./02-competitor-analysis.md) · [03 Sim integrations](./03-sim-integrations.md) · [04 Architecture](./04-architecture.md) · [05 Draft data model](./05-data-model.sql)

## What this is

A plan for an Apex & Chill-branded league-management platform — a user-friendly
alternative to SimGrid and Sim League Pro — where racing communities and
endurance teams fully manage their leagues: sign-ups, seasons, rounds, tracks,
drivers, teams, custom points systems, penalty-point ledgers, incident reports
and steward workflows, with race cards and championship standings that update
automatically from race-server results files where the sim allows it.

## The one-paragraph pitch

The incumbents are powerful but complicated: many screens, many required fields,
organiser UX second to driver discovery. We win on **organiser experience** — a
league published with open sign-ups in under 5 minutes, opinionated defaults,
the best stewarding/penalty tooling in the market, real endurance-team support —
wrapped in Apex & Chill branding so every hosted league promotes the community.
We do not fight SimGrid on network effects or official partnerships.

## Key findings

1. **We are unusually well-positioned.** This repo already runs production
   clients for *both* competitors' APIs (`lib/api/simgrid.ts`,
   `lib/api/simleaguepro.ts`) — first-hand knowledge of their data models, and
   a nearly-free **one-click "import your league from SimGrid/SLP" wizard**
   that neither incumbent offers in either direction (the switching-cost killer).
2. **AC + ACC are the automation jackpot** (🟢): free self-hostable servers,
   file-based JSON config and results, mature open source (accweb,
   assetto-server-manager, simresults). The full loop the goal describes —
   *create a round → server spools up → results JSON flows back → race cards
   and championships update* — is achievable, and it's a feature SimGrid
   charges for and Sim League Pro doesn't have.
3. **Per-sim reality check** (details in 03): AC Evo added dedicated servers in
   v0.6 (Apr 2026, 🟡 — design sim-agnostic now, add the driver when formats
   settle); LMU **cannot** be self-hosted (RaceControl is SimGrid-powered, 🟡 —
   we ingest its rich results XML instead); F1 25 has no servers (🟡 — UDP
   capture agent gets the Final Classification packets); GT7 is closed (🔴 —
   first-class *fast manual entry*, which our GT7 league needs anyway).
   **Manual results entry is therefore a first-class feature, not a fallback** —
   it makes every sim supportable on day one.
4. **Proven automation pattern to copy:** SimGrid's local-agent + API-key model
   ("SimGrid App"). Our version — the **Apex Relay** agent plus results
   sidecars on servers we provision — pushes signed results to an idempotent
   ingest endpoint architecturally identical to our existing Stripe webhook.
5. **Pricing anchors:** SimGrid Grid Pass $5.99/mo (drivers) and Partner
   $7.99/mo (communities); Sim League Pro is free. Recommendation: **free at
   launch** (growth/branding play), Stripe-subscription premium tier as Phase 2+.

## Key decisions (recommended)

| Decision | Recommendation | Where argued |
|---|---|---|
| Where it lives | **Inside this Next.js site** as an isolated route group (`app/leagues/`, `lib/league-manager/`, `components/leagues/`); subdomain alias later if it needs its own identity | 04 §1 |
| Auth (new foundation) | **Supabase Auth, Discord OAuth first**, roles in `league_members` enforced in app *and* RLS | 04 §3.1 |
| Results flow | Raw-first immutable ingestions → per-sim pure parsers → canonical result schema (simresults model) → derived points/standings recompute → tag-based cache invalidation | 03 §8, 04 §4 |
| Collector tiers | Manual upload (MVP, all sims) → Apex Relay agent (LMU/F1 25/self-hosted AC/ACC) → auto sidecars on provisioned servers (Phase 3) | 03 §8 |
| Standings performance | Computed on write into `standings_cache`; public pages are one indexed read | 04 §5, 05 |
| Positioning | Organiser-UX wedge + open developer surface (public read API, embeds, OSS parsers on GitHub) | 02 §3 |
| Monetisation | Free at launch; premium league tier ($5.99–7.99 anchor) via existing Stripe wiring in Phase 2+ | 02 §1.3, 04 §3.3 |

## Roadmap

**MVP — "run a league end-to-end, manually."** League creation wizard (< 5 min
to published page), sign-ups + application queue, driver registry, seasons/
rounds/tracks + calendar, preset/custom points systems, manual results entry +
ACC/AC results-file upload through the full ingestion pipeline, penalty-point
ledger, driver/team standings + race cards, league directory, SimGrid/SLP
import wizard, Apex & Chill's own leagues migrated as flagship tenants.
*Foundation work: Supabase Auth + `league_members` roles + the 05 schema.*

**Phase 2 — "trust and automation."** Structured incident reports + steward
queue + verdicts that auto-apply to results/standings, endurance/team features
(multi-driver entries, line-ups, swaps), LMU XML ingestion + Apex Relay watcher
app, notifications (Discord webhooks/email), embeddable widgets + public read
API, premium tier billing.

**Phase 3 — "server integration & ecosystem."** One-click server provisioning
for AC/ACC (Docker fleet or Pterodactyl API, per-hour credits), AC Evo driver
once formats stabilise, F1 25 UDP capture in Relay, live timing (with AC
collision events auto-drafting incident reports), OSS parser/adapter package on
GitHub, GT7 OCR-assisted entry.

## Cross-document reconciliation (review outcomes)

Review surfaced three inconsistencies across the pack; this section is the
authoritative resolution:

1. **Server-provisioning phase** — 01 placed AC/ACC server provisioning in
   Phase 3 while 03's build order and 04 suggested Phase 2. **Resolved: Phase 3.**
   Phase 2's Apex Relay already delivers hands-off results automation on
   self-hosted servers; provisioning is acceleration, not a prerequisite (01
   §4.10's own design principle), and it is the only roadmap item carrying real
   infrastructure cost. Pull it forward only if Phase 2 adoption demands it.
2. **LMU server integration** — 01's "as their APIs mature" framing is
   superseded by 03's finding: LMU provisioning is **strategically blocked**
   (servers exist only inside RaceControl, which is SimGrid-powered, with no
   public API and no incentive to grant one). LMU scope is results-XML
   ingestion + championship automation, permanently unless that landscape
   changes.
3. **Agent naming** — "Apex Relay" (03) is the canonical name for the
   companion uploader/capture agent; 04's "companion uploader agent" refers to
   the same component.

## Success criteria (from 01 §7)

- Organiser reaches a published league page with open sign-ups in **< 5 minutes**.
- A full race weekend needs **zero spreadsheets**.
- Apex & Chill's three leagues run on it, replacing the SimGrid/SLP consumption paths.
- One external community completes a season end-to-end after Phase 2.

## Open questions for the Operator

1. **Branch:** the goal asked for a separate working branch; swarm rules forbid
   branch creation, so this pack landed as docs-only commits on `main`. Say the
   word and the implementation work starts on a feature branch.
2. **In-site vs sister site:** pack recommends in-site (`/leagues`) with a
   later subdomain alias — confirm.
3. **Name:** "Apex League Manager" is a working title; the URL prefix
   (`/leagues`) follows the name.
4. **Monetisation:** confirm free-at-launch.
5. **Competitor UX walkthrough:** both sites 403 automated fetching; a
   logged-in human walkthrough of both organiser dashboards would sharpen the
   "< 5-minute" benchmark.
6. **Dogfooding timing:** migrate current GT7/LMU seasons immediately, or run
   parallel for one season?
