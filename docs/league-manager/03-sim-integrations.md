# 03 — Sim Integrations: Server APIs & Results Ingestion

> Research for the Apex & Chill League Manager (SimGrid / SimLeaguePro alternative).
> Covers, per simulator: dedicated-server hosting options, server config formats,
> results/JSON output formats, live telemetry/UDP APIs, feasibility of
> auto-provisioning servers from our platform, and relevant open-source projects.
> Ends with a recommended results-ingestion pipeline and per-sim feasibility ratings.
>
> Companion docs: `01-product-spec.md` (features/personas), `02-competitor-analysis.md`.
> Last verified: July 2026.

---

## TL;DR

| Sim | Self-hostable server? | Auto-provision from our platform | Results ingestion | Live data | Overall |
|-----|----------------------|----------------------------------|-------------------|-----------|---------|
| Assetto Corsa (AC) | ✅ Native Windows + Linux binary | **Easy** (Docker, mature OSS) | **Easy** — JSON per session + live UDP plugin events | **Easy** — UDP plugin protocol | 🟢 **EASY** |
| ACC | ✅ Free `accServer.exe` (Windows; runs under Wine in Docker) | **Easy–Medium** | **Easy** — JSON per session (UTF-16LE) | **Medium** — Broadcasting UDP SDK | 🟢 **EASY** |
| AC Evo | ✅ Since v0.6 (Apr 2026): Steam dedicated-server tool + official managed service | **Medium** (ecosystem is weeks/months old) | **Medium** — formats still stabilising | TBD | 🟡 **MEDIUM** |
| Le Mans Ultimate | ❌ Hosted Servers only, on RaceControl infra (SimGrid-powered) | **Hard** (captive platform) | **Medium** — rF2-style results XML via upload/watcher agent | **Medium** — rF2 shared memory via client agent | 🟡 **MEDIUM** |
| F1 25 | ❌ No servers exist (peer-hosted lobbies) | N/A | **Medium** — UDP capture agent on a lobby member's network | **Medium** — official UDP telemetry spec | 🟡 **MEDIUM** |
| GT7 | ❌ Closed platform, lobbies only | N/A | **Hard** — manual entry / screenshot-assisted | **Hard** — unofficial encrypted UDP, per-console | 🔴 **HARD** |

Strategic headline: **AC + ACC give us a genuinely automated "create round → server spools up → results flow back" experience that SimGrid charges for and SimLeaguePro doesn't do well.** LMU and F1 25 get a lightweight **capture/upload agent**. GT7 keeps the manual steward workflow we already run today (see `lib/leagues.ts` / `supabase/schema.sql` — the site already has a manual `race_standings` store and SimGrid championship hooks we'd be replacing).

---

## 1. Assetto Corsa Competizione (ACC)

### Dedicated server & hosting
- Kunos ships a **free dedicated server** (`accServer.exe`) with the game (Steam, `server/` folder). Windows binary only, but it runs reliably under **Wine**, which is how the community Docker images work.
- Hosting options: self-host on any VPS/dedicated box; community Docker images ([fattylewis/assetto_corsa_competizione_server](https://github.com/fattylewis/assetto_corsa_competizione_server), [ich777/docker-accompetizione](https://github.com/ich777/docker-accompetizione)); commodity game hosts (GPORTAL, Nitrado, GTX, EMP) also rent ACC servers.

### Server config format
- Plain **JSON files** in `cfg/`: `configuration.json` (ports), `settings.json` (server name, admin/join passwords, car group, dump leaderboards), `event.json` (track, sessions, weather), `eventRules.json`, `entrylist.json` (locked entries, car numbers — key for leagues), `assistRules.json`, `bop.json`.
- ⚠️ Gotcha: ACC config and results files are **UTF-16LE encoded** — parsers must transcode before `JSON.parse`.
- Generating an event from our UI = writing ~5 small JSON files and restarting the process. Trivially templatable.

### Results output
- With `"dumpLeaderboards": 1`, each session writes a **JSON results file** to `results/` (again UTF-16LE): session type, track, leaderboard lines (car, team, drivers with playerID, best/total times, lap count), laps with splits/validity, and penalties.
- Ingestion = watch the `results/` directory, transcode, parse, POST. No polling of a remote API needed when we run the server.

### Live telemetry / APIs
- **Broadcasting SDK**: enable a UDP port via `broadcasting.json`; a documented message protocol streams realtime session info, car positions, laps and broadcast events. Kunos provides a C# reference client; community wrappers exist in most languages. This powers live timing screens.
- No REST API on the server itself — management is file + process based (which is exactly what tools like accweb automate).

### Open-source projects
- [assetto-corsa-web/accweb](https://github.com/assetto-corsa-web/accweb) — Go + Vue web management: create/start/stop/monitor many server instances, import/export configs, **HTTP callbacks on instance events**. Strong reference (or embed candidate) for our provisioning layer.
- [gotzl/accservermanager](https://github.com/gotzl/accservermanager) — Python/Django alternative.
- [StarkBotha/ACC-Server-Control](https://github.com/StarkBotha/ACC-Server-Control) — .NET platform for spinning up ACC servers remotely.
- Docker images above for containerised fleets.

### Auto-provisioning feasibility: **EASY–MEDIUM**
Everything is file-driven and process-driven; accweb proves the model. The only friction is the Windows binary (Wine layer) and Steam content updates (containers rebuild on game patches).

---

## 2. Assetto Corsa (original)

### Dedicated server & hosting
- Free `acServer` binary with **native Linux and Windows builds**, installable headlessly via `steamcmd`. The cheapest and best-understood sim server in existence; every game host offers it.

### Server config format
- Two **INI files**: `server_cfg.ini` (track, sessions, rules, ports, UDP plugin address) and `entry_list.ini` (grid slots, car/skin, GUIDs for booking). Mod content (tracks/cars) must match client checksums — league admins already understand this.

### Results output
- Per-session **JSON results** (`results/*.json` / `race_out.json`): players, cars, laps with sectors, cuts, events (collisions). Caveat noted by the simresults project: some AC result files only contain best laps — the **UDP plugin stream is the authoritative source for full lap-by-lap data**.

### Live telemetry / APIs
- The **acServer UDP plugin protocol** is the gem: the server pushes realtime events — connections/disconnections, lap completed (with cuts), collisions with car/environment (speed + participants) — and accepts admin commands (kick, next session, broadcast chat). This enables **automated incident logs** feeding our stewarding workflow, plus live timing.
- Bridges: [germanrcuriel/assetto-corsa-server-udp2ws](https://github.com/germanrcuriel/assetto-corsa-server-udp2ws) (UDP↔WebSocket).

### Open-source projects
- [JustaPenguin/assetto-server-manager](https://github.com/JustaPenguin/assetto-server-manager) — Go web manager with **championships, race weekends, results, live timing, entry management** — the single most useful reference implementation for our whole product (open source; Emperor Servers sell a hosted fork, proving the commercial model).
- [compujuckel/AssettoServer](https://github.com/compujuckel/AssettoServer) — C# reimplementation of the server itself (freeroam-focused; shows the protocol is fully understood).
- Plugin ecosystem for penalties/tracking: sTracker/pTracker, KissMyRank, Real Penalty (all integrate via the UDP plugin chain; see [Emperor's UDP plugin docs](https://wiki.emperorservers.com/assetto-corsa-server-manager/udp-plugins)).
- [mauserrifle/simresults](https://github.com/mauserrifle/simresults) — PHP reader powering simresults.net; parses AC (and rF2, and more) into one data model. **Blueprint for our canonical results schema.**

### Auto-provisioning feasibility: **EASY**
Native Linux binary + INI configs + mature OSS = the fastest path to a "click to spool a server" demo.

---

## 3. Assetto Corsa EVO (AC Evo)

### Dedicated server & hosting — new as of v0.6 (April 2026)
- The **v0.6 update introduced dedicated servers**: a dedicated-server app in the Steam **Tools** section for self-hosting, with full session customisation (track/layout, cars, password, weather presets) ([Traxion](https://traxion.gg/assetto-corsa-evos-v0-6-update-to-feature-self-hosted-servers-and-ai-updates/), [OverTake](https://www.overtake.gg/news/assetto-corsa-evo-introduces-custom-online-servers-to-the-masses.3856/)).
- Kunos also authorises an **official managed hosting service** — 14 global regions, auto-updates, DDoS protection, web control panel ([acevo-servers.com](https://www.acevo-servers.com/en)) — and third-party hosts are already live ([assettohosting.com](https://assettohosting.com/en/servers/assetto-corsa-evo), from ~€5/mo).
- Core multiplayer is free; custom championships on private servers are an explicit use case Kunos promotes.

### Config / results / telemetry
- Formats are **early and still stabilising** (the server tool is ~3 months old at time of writing). Kunos lineage strongly suggests file-based config plus session result dumps like AC/ACC, but we should not hard-code assumptions yet.
- No published broadcasting/UDP SDK for Evo yet; expect one to follow the ACC pattern.

### Open-source projects
- Ecosystem is embryonic — watch for the Evo equivalents of accweb/server-manager. Third-party host panels (AssettoHosting's "custom Server Manager") indicate programmatic config is already possible.

### Auto-provisioning feasibility: **MEDIUM (trending EASY)**
Self-hosting exists and Kunos culture is automation-friendly. Recommendation: design our provisioning layer sim-agnostically now, add the Evo driver once formats settle (target: 2–3 months after our MVP). This is a **differentiator window** — competitors are equally early on Evo.

---

## 4. Le Mans Ultimate (LMU)

### Dedicated server & hosting — captive to RaceControl
- LMU (1.0 released 22 July 2025) is built on the **rFactor 2 engine (isiMotor 2.5)**. Multiplayer runs through Motorsport Games' **RaceControl** platform.
- **There is no public self-hosted dedicated server tool.** Private racing uses **Hosted Servers**: created from racecontrol.gg, run on RaceControl infrastructure, billed **per hour in server credits** (from ~€0.38/hr, free Lite account can create) ([official Hosted Servers page](https://lemansultimate.com/hosted-servers/), [guide](https://guide.lemansultimate.com/hc/en-gb/articles/13211353947407-What-are-Hosted-Servers)).
- ⚠️ Strategic note: **RaceControl.gg for LMU is powered by SimGrid** ([announcement](https://pits.thesimgrid.com/announcements/your-brand-new-racecontrol-gg-for-le-mans-ultimate-powered-by-simgrid/)) — our competitor effectively owns LMU server provisioning. Don't plan on API-provisioning LMU servers; there is no public API and no incentive for them to grant one.

### Results output
- LMU exports **rF2-style XML results files** with lap times, sector splits, incidents, penalties, tyre/fuel data — richer than most sims. Parsed today by [arminreiter/lmu-analyzer](https://github.com/arminreiter/lmu-analyzer/) (browser XML dashboard) and watched/uploaded by [MyLMU](https://www.mylmu.app/) (tray app watching Results + Telemetry folders — exactly the "watcher agent" UX we'd copy).
- [mauserrifle/simresults](https://github.com/mauserrifle/simresults) already parses rF2 XML — our normaliser can port its rF2 mapping.

### Live telemetry / APIs
- The game exposes a **local REST API** used by community tools (documentation thread on the [official community forum](https://community.lemansultimate.com/index.php?threads%2Frest-api-documentation.3278%2F=)) and **rF2-style shared memory** for telemetry (the `DedicatedServerMapGlobally` plugin convention carries over; see [DR Sim Manager docs](https://docs.departedreality.com/dr-sim-manager/general/sources/le-mans-ultimate)). Both are **client-side** — they require an agent on a participant's PC, not server access.
- In-game broadcast overlay outputs HTML for OBS — useful for league streams but not an ingestion path.

### Open-source projects
- [JeGoBE8900/LMUTools](https://github.com/JeGoBE8900/LMUTools) (replay + results XML browsing), [arminreiter/lmu-analyzer](https://github.com/arminreiter/lmu-analyzer/), simresults (rF2 XML), TinyPedal/CrewChief (shared-memory consumers, good protocol references).

### Feasibility: **MEDIUM**
- Results ingestion: **works well** — organiser drag-drops the XML, or runs our watcher agent. Fully automatable from the league admin's side.
- Auto-provisioning: **HARD/blocked** — servers only exist inside RaceControl (SimGrid). Position LMU as "results + championship automation" with a great manual server checklist, not one-click servers. This matters to Apex & Chill directly since we run an LMU league.

---

## 5. F1 25 (EA / Codemasters)

### Servers
- **No dedicated servers exist.** Online races are peer-hosted lobbies / league sessions inside the game. Nothing to provision — feasibility question shifts entirely to data capture.

### Live telemetry / results — official UDP spec
- EA publishes an official **UDP telemetry specification** ([EA Forums spec thread](https://forums.ea.com/blog/f1-games-game-info-hub-en/ea-sports%E2%84%A2-f1%C2%AE25-udp-specification/12187347)); the game (PC, PS5, Xbox) streams packets to a configurable IP:port (default 20777) — consoles can target a LAN PC or Pi.
- Key packets for us: **Session**, **Participants**, **Lap Data**, **Session History**, and crucially **Final Classification** — sent every 5s on the results screen, matching the post-race results exactly (F1 25 added a `result reason` field). This is precisely the data needed to auto-fill a race card.
- Ingestion approach (proven by F1Laps and every serious F1 league tool): a lightweight **capture agent** on any lobby member's network (ideally the host's) listens to UDP, extracts Participants + Final Classification, POSTs to our ingest API. One agent per lobby session suffices.
- Caveats: player names can be hidden ("Player") depending on privacy settings — mapping to our driver registry may need car-number matching, which leagues fix by assigning numbers anyway.

### Open-source projects
- [MacManley/f1-25-udp](https://github.com/MacManley/f1-25-udp) (F1 25 packet structs), [F1Game.UDP](https://www.nuget.org/packages/F1Game.UDP/) (.NET, v25.x), [f1-2020-telemetry docs](https://f1-2020-telemetry.readthedocs.io/en/stable/telemetry-specification.html) (best-written reference for the packet model), plus f1-22/23/24 parsers in JS/Python.

### Feasibility: **MEDIUM**
No infrastructure burden at all, but results are only as reliable as the capture agent being online during the race. UX: ship a tiny "Apex Relay" desktop app + clear setup guide.

---

## 6. Gran Turismo 7 (note)

- **Closed platform**: no dedicated servers, no results export, no official API; racing happens in lobbies on PSN.
- Unofficial telemetry exists — the "**Simulator Interface**" UDP stream (ports 33739/33740, heartbeat-activated, **Salsa20-encrypted**), reverse-engineered via Nenkai's PDTools ([GTPlanet coverage](https://www.gtplanet.net/gran-turismo-7-telemetry-data-now-available-via-open-source-software/)). OSS: [snipem/gt7dashboard](https://github.com/snipem/gt7dashboard), [granturismo (PyPI)](https://pypi.org/project/granturismo/), [MacManley/gt7-udp](https://github.com/MacManley/gt7-udp), SimHub support.
- But telemetry is **per-console and driver-centric** — reconstructing an authoritative multi-car race result would require every driver running a capture device. Not viable for league results.
- **Recommendation:** GT7 stays on the manual steward workflow (this is what SimGrid does too — no automation gap to close). Our angle: make manual entry *fast* — grid import from sign-ups, keyboard-first finishing-order entry, optional screenshot upload with OCR assist later. Note: the site's existing `race_standings` Supabase table (see `supabase/schema.sql`) already models exactly this and can seed the new system.

---

## 7. Hosting & auto-provisioning architecture

How "create a round on our platform → a server spools up" can actually work:

1. **Own fleet (recommended for AC/ACC, later AC Evo)**
   - Docker containers per server instance (AC native Linux; ACC via Wine images above) on cheap EU metal/VPS (Hetzner/OVH). A small **control plane** service: `POST /servers` with a round spec → renders config files from templates → starts container → registers the join details back on the round page.
   - [Pterodactyl/Pelican panel](https://pterodactyl.io/) has community eggs for AC/ACC and a full REST API — a viable off-the-shelf control plane instead of building our own.
   - Each container gets a **results sidecar**: watches the results dir, transcodes (UTF-16→UTF-8 for ACC), POSTs signed payloads to our ingest API. accweb's HTTP event callbacks show the pattern.
   - Billing model: per-hour server credits (same shape as RaceControl's €0.38/hr — we can undercut or bundle with league subscription).
2. **Rented via host APIs (fallback/scale)** — Nitrado exposes a public API for provisioning game servers; usable if we don't want to run infra day one.
3. **No-server sims** — LMU: deep-link the organiser to racecontrol.gg with a pre-filled checklist; F1 25/GT7: nothing to provision.

---

## 8. Recommended results-ingestion pipeline

**Goal: server/session output → race card + championship standings update automatically, no admin spreadsheet work.**

```
 SOURCES                      COLLECTORS                    PLATFORM
┌──────────────────┐   ┌──────────────────────────┐   ┌─────────────────────────────┐
│ ACC results JSON │──▶│ Sidecar watcher (our     │   │ POST /api/league-manager/    │
│ AC results JSON  │──▶│  provisioned containers) │──▶│  ingest  (HMAC per league)   │
│ LMU results XML  │──▶│ "Apex Relay" desktop app │   │  ├─ store raw file (Supabase │
│ F1 25 UDP        │──▶│  (folder watch / UDP     │   │  │   storage, replayable)    │
│ GT7 / fallback   │──▶│   listener)              │   │  ├─ per-sim normaliser       │
└──────────────────┘   │ Manual upload in admin UI│   │  ▼                           │
                       └──────────────────────────┘   │ canonical Result schema      │
                                                      │  ├─ idempotent upsert keyed  │
                                                      │  │  (league, round, session) │
                                                      │  ├─ points engine (league's  │
                                                      │  │  custom points + penalty  │
                                                      │  │  system, incident links)  │
                                                      │  ▼                           │
                                                      │ race cards + standings +     │
                                                      │ Supabase Realtime push       │
                                                      └─────────────────────────────┘
```

Design decisions:

0. **Fit the site's existing ingestion conventions.** The codebase already has the exact shapes this pipeline needs:
   - Every data payload carries `source: DataSource` provenance (`lib/types.ts` — currently `'simgrid' | 'simleaguepro' | 'cache' | 'sample' | …`). Ingested race results extend that union (e.g. `'server-ingest'` for sidecar/relay pushes, `'manual'` for steward uploads) so race cards and standings stay honest about freshness exactly like today's UI.
   - Config is env-gated via `lib/env.ts` with graceful degradation to sample data — per-sim ingestion keys follow the same pattern (a league with no relay key simply stays on manual upload).
   - The ingest endpoint mirrors `app/api/webhooks/stripe/route.ts`: **signature verification + idempotent upsert**. Results POSTs are HMAC-signed with a per-league API key, and replays are no-ops.
   - `lib/api/simgrid.ts` and `lib/api/simleaguepro.ts` already map both competitors' data models — they double as the **import wizard** ("bring your league from SimGrid/SLP") and as reference shapes for the canonical schema below.
1. **The automation bar to clear is the "SimGrid App"** — SimGrid's local agent that auto-boots ACC servers for scheduled events and auto-uploads results with an API key. Our **Apex Relay** (collector tier 2) plus provisioned sidecars (tier 3) meet and beat it: same API-key push model, but we also cover AC, LMU XML and F1 25 UDP, and on servers *we* provision no agent is needed at all.
2. **Canonical result schema** (model on simresults' data model): `Session {sim, track, type, weather}` → `Entry {car, team, drivers[]}` → `Lap {times, sectors, valid, cuts}` + `Penalty` + `Incident`. Per-sim parsers are pure functions `rawFile → CanonicalResult`, living in a **shared module with no web imports** (`lib/league-manager/parsers/` today; extractable to a package if the relay app lands) so the website, relay app, and any future services reuse them. TypeScript ports of the ACC JSON, AC JSON and rF2/LMU XML mappings are each ~1–2 days; simresults is the reference test oracle.
3. **Raw-file retention + idempotent upsert**: always store the original file; re-running the normaliser must be safe (keyed by league/round/session + file hash). This gives stewards an audit trail and lets us fix parser bugs retroactively.
4. **Points/penalty engine is sim-agnostic**: standings are *derived* (recomputed from canonical results + league rules on every change), never hand-edited — hand adjustments happen as explicit steward decisions (penalty records), which keeps the audit trail SimGrid lacks.
5. **Three collector tiers by league maturity**: manual upload (day one, all sims) → Apex Relay desktop agent (LMU/F1 25, self-hosted AC/ACC) → fully automatic sidecars (servers we provision). Every tier hits the same ingest API.
6. **Live timing is Phase 3**, layered on the same normaliser: ACC Broadcasting UDP, AC UDP plugin, LMU shared-memory bridge, F1 25 UDP → WebSocket/Realtime → live race cards. AC's UDP collision events additionally auto-draft **incident reports** for the steward queue — a genuine wow-feature.

### Suggested build order
1. **MVP:** canonical schema + ACC & AC JSON parsers + manual upload + points engine → auto race cards/standings (replaces the manual `race_standings` flow).
2. **Phase 2:** LMU XML parser + Apex Relay watcher app; AC/ACC server provisioning (Docker fleet or Pterodactyl API).
3. **Phase 3:** F1 25 UDP capture in Relay; live timing; AC Evo provisioning driver once its formats stabilise; GT7 OCR-assisted entry.

---

## Sources

- ACC: [accweb](https://github.com/assetto-corsa-web/accweb) · [gotzl/accservermanager](https://github.com/gotzl/accservermanager) · [ACC-Server-Control](https://github.com/StarkBotha/ACC-Server-Control) · [Docker: fattylewis](https://github.com/fattylewis/assetto_corsa_competizione_server) · [Docker: ich777](https://github.com/ich777/docker-accompetizione)
- AC: [JustaPenguin/assetto-server-manager](https://github.com/JustaPenguin/assetto-server-manager) · [compujuckel/AssettoServer](https://github.com/compujuckel/AssettoServer) · [udp2ws](https://github.com/germanrcuriel/assetto-corsa-server-udp2ws) · [Emperor UDP plugin docs](https://wiki.emperorservers.com/assetto-corsa-server-manager/udp-plugins)
- AC Evo: [Traxion v0.6](https://traxion.gg/assetto-corsa-evos-v0-6-update-to-feature-self-hosted-servers-and-ai-updates/) · [OverTake](https://www.overtake.gg/news/assetto-corsa-evo-introduces-custom-online-servers-to-the-masses.3856/) · [acevo-servers.com](https://www.acevo-servers.com/en) · [AssettoHosting](https://assettohosting.com/en/servers/assetto-corsa-evo)
- LMU: [Hosted Servers](https://lemansultimate.com/hosted-servers/) · [Hosted Servers guide](https://guide.lemansultimate.com/hc/en-gb/articles/13211353947407-What-are-Hosted-Servers) · [RaceControl powered by SimGrid](https://pits.thesimgrid.com/announcements/your-brand-new-racecontrol-gg-for-le-mans-ultimate-powered-by-simgrid/) · [REST API forum thread](https://community.lemansultimate.com/index.php?threads%2Frest-api-documentation.3278%2F=) · [lmu-analyzer](https://github.com/arminreiter/lmu-analyzer/) · [LMUTools](https://github.com/JeGoBE8900/LMUTools) · [MyLMU](https://www.mylmu.app/) · [DR Sim Manager LMU docs](https://docs.departedreality.com/dr-sim-manager/general/sources/le-mans-ultimate) · [Wikipedia](https://en.wikipedia.org/wiki/Le_Mans_Ultimate)
- F1 25: [EA UDP spec](https://forums.ea.com/blog/f1-games-game-info-hub-en/ea-sports%E2%84%A2-f1%C2%AE25-udp-specification/12187347) · [MacManley/f1-25-udp](https://github.com/MacManley/f1-25-udp) · [F1Game.UDP](https://www.nuget.org/packages/F1Game.UDP/) · [f1-2020-telemetry reference](https://f1-2020-telemetry.readthedocs.io/en/stable/telemetry-specification.html) · [F1Laps setup](https://www.f1laps.com/faqs/f1-25-udp-telemetry-settings/)
- GT7: [GTPlanet on open-source telemetry](https://www.gtplanet.net/gran-turismo-7-telemetry-data-now-available-via-open-source-software/) · [gt7dashboard](https://github.com/snipem/gt7dashboard) · [granturismo PyPI](https://pypi.org/project/granturismo/) · [gt7-udp](https://github.com/MacManley/gt7-udp)
- Cross-sim results parsing: [mauserrifle/simresults](https://github.com/mauserrifle/simresults) · [simresults.net](https://simresults.net/)
