-- ============================================================================
-- League Manager — DRAFT Supabase/Postgres data model
-- ----------------------------------------------------------------------------
-- STATUS: DRAFT / planning artefact. Do NOT run against production yet.
-- Companion to docs/league-manager/04-architecture.md (see §4 pipeline, §5
-- performance). Written in the same style as supabase/schema.sql so it can be
-- promoted there (or to supabase/migrations/) once the plan is approved.
--
-- Shape of the model, top to bottom:
--   sims, tracks                      — shared reference data
--   drivers, driver_aliases           — driver registry + results name-matching
--   leagues, league_members           — a community and its roles (RLS backbone)
--   points_schemes, penalty_schemes   — reusable scoring/penalty rule sets
--   seasons, season_classes           — a championship and its car classes
--   teams, signups, entries,          — who is racing, in what, for whom
--     entry_drivers
--   rounds, race_sessions             — the calendar and what actually ran
--   result_ingestions, results        — raw server JSON in, normalised rows out
--   incidents, penalties              — steward workflow
--   standings_cache                   — computed-on-write championship tables
--
-- Design notes:
--   * gen_random_uuid() requires pgcrypto (enabled by default on Supabase).
--   * Row Level Security is ON everywhere. Public league pages (standings,
--     race cards) read with anon; all writes require either a member role via
--     league_members or the service-role key (ingestion agent, admin ops).
--   * Roles are data: is_league_staff() / is_league_steward() helpers back the
--     write policies, so authorisation lives in the DB as well as the app.
--   * Standings are recomputed on write into standings_cache (never on read) —
--     public pages are a single indexed SELECT. See 04-architecture.md §5.
--   * Sims are a lookup table (not an enum like public.league) because titles
--     arrive yearly (F1 25 → F1 26) and adding a row must not need a migration.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
--   Kept to states that are code-level contracts; content-ish things (sims,
--   classes, penalty categories) are rows, not enums.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'league_role') then
    create type league_role as enum ('owner', 'admin', 'steward', 'driver');
  end if;
  if not exists (select 1 from pg_type where typname = 'season_status') then
    create type season_status as enum ('draft', 'signups', 'active', 'completed', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'signup_status') then
    create type signup_status as enum ('pending', 'accepted', 'reserve', 'declined', 'withdrawn');
  end if;
  if not exists (select 1 from pg_type where typname = 'round_status') then
    create type round_status as enum ('scheduled', 'live', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'session_type') then
    create type session_type as enum ('practice', 'qualifying', 'sprint', 'race');
  end if;
  if not exists (select 1 from pg_type where typname = 'result_status') then
    create type result_status as enum ('finished', 'dnf', 'dns', 'dsq');
  end if;
  if not exists (select 1 from pg_type where typname = 'ingestion_status') then
    create type ingestion_status as enum ('received', 'parsed', 'applied', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'incident_status') then
    create type incident_status as enum ('open', 'under_review', 'decided', 'dismissed');
  end if;
  if not exists (select 1 from pg_type where typname = 'penalty_type') then
    create type penalty_type as enum ('time', 'grid', 'points_deduction', 'penalty_points', 'dsq', 'race_ban', 'warning');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- Helper: is_league_staff / is_league_steward
--   RLS predicates for write policies. SECURITY DEFINER so policies can call
--   them without granting direct league_members reads beyond the member's own.
-- ----------------------------------------------------------------------------
create or replace function public.is_league_staff(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.league_members m
    where m.league_id = p_league_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_league_steward(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.league_members m
    where m.league_id = p_league_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin', 'steward')
  );
$$;

-- ----------------------------------------------------------------------------
-- Table: sims
--   The simulator titles we support (ACC, AC, AC Evo, LMU, F1 25, GT7, …).
--   A lookup table so new titles are an INSERT, not a migration. Integration
--   capability flags mirror docs/league-manager/03-sim-integrations.md.
-- ----------------------------------------------------------------------------
create table if not exists public.sims (
  id                  uuid primary key default gen_random_uuid(),
  slug                text        not null unique,          -- 'acc', 'lmu', 'f1-25', 'gt7', …
  name                text        not null,                 -- 'Assetto Corsa Competizione'
  short_name          text        not null,                 -- 'ACC'
  has_results_export  boolean     not null default false,   -- server writes parseable results files
  has_server_api      boolean     not null default false,   -- servers can be provisioned via API (Phase 2)
  results_format_note text,                                 -- pointer into 03-sim-integrations.md
  created_at          timestamptz not null default now()
);

comment on table public.sims is 'Supported simulator titles and their integration capabilities.';

-- ----------------------------------------------------------------------------
-- Table: tracks
--   Per-sim track/layout registry (content differs per title, so tracks hang
--   off a sim). Seeded per sim; organisers pick from these on rounds.
-- ----------------------------------------------------------------------------
create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  sim_id      uuid        not null references public.sims (id) on delete cascade,
  slug        text        not null,                          -- 'spa', 'monza', matches server config value
  name        text        not null,                          -- 'Circuit de Spa-Francorchamps'
  layout      text,                                          -- 'GP', 'National', … null = default layout
  country     text,                                          -- ISO 3166-1 alpha-2, e.g. 'BE'
  length_m    int,                                           -- lap length in metres
  created_at  timestamptz not null default now(),
  unique (sim_id, slug, layout)
);

comment on table public.tracks is 'Per-sim track/layout registry; slug matches the value used in server configs.';

create index if not exists tracks_sim_idx on public.tracks (sim_id);

-- ----------------------------------------------------------------------------
-- Table: drivers
--   The driver registry. Deliberately NOT 1:1 with auth accounts: organisers
--   add drivers who never sign in, and results ingestion creates drivers from
--   server JSON before anyone claims them. `user_id` links a driver to a
--   Supabase Auth account once claimed.
-- ----------------------------------------------------------------------------
create table if not exists public.drivers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        unique references auth.users (id) on delete set null,
  display_name  text        not null,
  discord       text,                                        -- Discord handle (primary community identity)
  country       text,                                        -- ISO 3166-1 alpha-2
  platform_ids  jsonb       not null default '{}'::jsonb,    -- { steamId, psn, gamertag, eaId, … }
  avatar_url    text,
  open_to_offers boolean    not null default false,          -- surfaces on the driver-finder board
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.drivers is 'Driver registry; optionally claimed by an auth user. Created by sign-up, organiser, or ingestion.';

create index if not exists drivers_display_name_idx on public.drivers (lower(display_name));

-- ----------------------------------------------------------------------------
-- Table: driver_aliases
--   Results name-matching memory (04-architecture.md §4.1 step 3). Server JSON
--   identifies drivers by platform name/id; each confirmed match is recorded
--   here so subsequent ingestions for that sim resolve automatically.
-- ----------------------------------------------------------------------------
create table if not exists public.driver_aliases (
  id          uuid primary key default gen_random_uuid(),
  driver_id   uuid        not null references public.drivers (id) on delete cascade,
  sim_id      uuid        not null references public.sims (id) on delete cascade,
  alias       text        not null,                          -- raw name/id as it appears in server results
  created_at  timestamptz not null default now(),
  unique (sim_id, alias)
);

comment on table public.driver_aliases is 'Maps raw server-results names/ids to drivers, per sim. Written on confirmed matches.';

create index if not exists driver_aliases_driver_idx on public.driver_aliases (driver_id);

-- ----------------------------------------------------------------------------
-- Table: leagues
--   A racing community/league. `featured` headlines Apex & Chill's own leagues
--   on the directory (the dogfooding + promotion loop).
-- ----------------------------------------------------------------------------
create table if not exists public.leagues (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,                  -- URL segment: /leagues/[slug]
  name         text        not null,
  tagline      text,
  description  text,
  logo_url     text,
  banner_url   text,
  accent_color text        not null default '#e11d48',       -- hex, drives per-league theming
  discord_url  text,
  is_public    boolean     not null default true,            -- false = unlisted (link-only)
  featured     boolean     not null default false,           -- Apex & Chill / showcase leagues
  created_by   uuid        references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.leagues is 'A racing community. Everything below hangs off a league.';

create index if not exists leagues_featured_idx on public.leagues (featured) where featured;

-- ----------------------------------------------------------------------------
-- Table: league_members
--   Role assignments per league — the backbone of RLS write policies.
-- ----------------------------------------------------------------------------
create table if not exists public.league_members (
  league_id   uuid        not null references public.leagues (id) on delete cascade,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  role        league_role not null default 'driver',
  created_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

comment on table public.league_members is 'Per-league roles (owner/admin/steward/driver); backs is_league_staff/steward RLS helpers.';

create index if not exists league_members_user_idx on public.league_members (user_id);

-- ----------------------------------------------------------------------------
-- Table: points_schemes
--   Reusable scoring rule sets. `league_id` NULL = a global preset (F1-style,
--   MotoGP-style, linear, …) that any league can pick or clone.
--   `positions_points` is an ordered array: index 0 = P1 points, etc.
-- ----------------------------------------------------------------------------
create table if not exists public.points_schemes (
  id                        uuid primary key default gen_random_uuid(),
  league_id                 uuid        references public.leagues (id) on delete cascade,  -- null = global preset
  name                      text        not null,
  positions_points          jsonb       not null default '[25,18,15,12,10,8,6,4,2,1]'::jsonb,
  pole_points               int         not null default 0,
  fastest_lap_points        int         not null default 0,
  fastest_lap_requires_top  int,                             -- e.g. 10 → FL point only if finishing top 10; null = always
  dnf_scores                boolean     not null default false,  -- do classified DNFs still score by position?
  drop_rounds               int         not null default 0,      -- worst N rounds dropped from season total
  created_at                timestamptz not null default now()
);

comment on table public.points_schemes is 'Scoring rule sets; null league_id rows are global presets. Consumed by the points engine on ingestion.';

create index if not exists points_schemes_league_idx on public.points_schemes (league_id);

-- ----------------------------------------------------------------------------
-- Table: penalty_schemes
--   Penalty-point rule sets: categories + default sanctions + licence
--   thresholds (e.g. 12 penalty points in a season → one-race ban).
--   `rules` example:
--     [{ "category": "avoidable contact", "penaltyPoints": 2, "timeSeconds": 5 },
--      { "category": "track limits abuse", "penaltyPoints": 1 }]
-- ----------------------------------------------------------------------------
create table if not exists public.penalty_schemes (
  id                   uuid primary key default gen_random_uuid(),
  league_id            uuid        references public.leagues (id) on delete cascade,  -- null = global preset
  name                 text        not null,
  rules                jsonb       not null default '[]'::jsonb,
  ban_threshold_points int,                                  -- penalty points before an automatic race ban; null = no auto-ban
  points_expire_after  int,                                  -- rounds after which penalty points lapse; null = end of season
  created_at           timestamptz not null default now()
);

comment on table public.penalty_schemes is 'Penalty/licence-point rule sets; null league_id rows are global presets.';

create index if not exists penalty_schemes_league_idx on public.penalty_schemes (league_id);

-- ----------------------------------------------------------------------------
-- Table: seasons
--   A championship run by a league in one sim, scored by one scheme pair.
-- ----------------------------------------------------------------------------
create table if not exists public.seasons (
  id                 uuid primary key default gen_random_uuid(),
  league_id          uuid          not null references public.leagues (id) on delete cascade,
  sim_id             uuid          not null references public.sims (id),
  points_scheme_id   uuid          references public.points_schemes (id),
  penalty_scheme_id  uuid          references public.penalty_schemes (id),
  slug               text          not null,                 -- URL segment: /leagues/x/seasons/[slug]
  name               text          not null,                 -- 'Season 4', 'Winter Endurance Cup'
  status             season_status not null default 'draft',
  signup_opens_at    timestamptz,
  signup_closes_at   timestamptz,
  max_entries        int,                                    -- grid cap; null = unlimited
  signup_questions   jsonb         not null default '[]'::jsonb,  -- custom sign-up form fields
  teams_enabled      boolean       not null default true,
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now(),
  unique (league_id, slug)
);

comment on table public.seasons is 'A championship: one league, one sim, one points+penalty scheme pair.';

create index if not exists seasons_league_idx on public.seasons (league_id, status);

-- ----------------------------------------------------------------------------
-- Table: season_classes
--   Car classes within a season (multiclass is the norm in endurance racing:
--   Hypercar/LMGT3, GT3/GT4, …). Single-class seasons get one default row.
-- ----------------------------------------------------------------------------
create table if not exists public.season_classes (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid        not null references public.seasons (id) on delete cascade,
  name        text        not null,                          -- 'GT3', 'Hypercar', 'Gr.3'
  color       text        not null default '#ffffff',        -- hex accent used on entry lists / standings
  car_models  jsonb       not null default '[]'::jsonb,      -- allowed cars; empty = any
  sort_order  int         not null default 0,
  unique (season_id, name)
);

comment on table public.season_classes is 'Car classes within a season; standings and entries are scoped per class.';

create index if not exists season_classes_season_idx on public.season_classes (season_id);

-- ----------------------------------------------------------------------------
-- Table: teams
--   Teams belong to a league (persist across seasons); entries reference them
--   per season. `manager_driver_id` is the team boss for endurance line-ups.
-- ----------------------------------------------------------------------------
create table if not exists public.teams (
  id                 uuid        primary key default gen_random_uuid(),
  league_id          uuid        not null references public.leagues (id) on delete cascade,
  name               text        not null,
  color              text        not null default '#ffffff',
  logo_url           text,
  manager_driver_id  uuid        references public.drivers (id) on delete set null,
  created_at         timestamptz not null default now(),
  unique (league_id, name)
);

comment on table public.teams is 'League-level teams; referenced by season entries.';

create index if not exists teams_league_idx on public.teams (league_id);

-- ----------------------------------------------------------------------------
-- Table: signups
--   A driver's application to a season (the public sign-up form). Accepting a
--   sign-up creates/assigns an entry; the sign-up row remains as history.
-- ----------------------------------------------------------------------------
create table if not exists public.signups (
  id          uuid          primary key default gen_random_uuid(),
  season_id   uuid          not null references public.seasons (id) on delete cascade,
  driver_id   uuid          not null references public.drivers (id) on delete cascade,
  class_id    uuid          references public.season_classes (id) on delete set null,
  status      signup_status not null default 'pending',
  answers     jsonb         not null default '{}'::jsonb,    -- responses to seasons.signup_questions
  message     text,
  decided_by  uuid          references auth.users (id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz   not null default now(),
  unique (season_id, driver_id)
);

comment on table public.signups is 'Season applications; accepted sign-ups become entries.';

create index if not exists signups_season_status_idx on public.signups (season_id, status);

-- ----------------------------------------------------------------------------
-- Table: entries
--   A confirmed grid slot in a season: the CAR. Drivers attach via
--   entry_drivers so endurance line-ups (multiple drivers per car) work the
--   same as sprint seasons (one driver per car).
-- ----------------------------------------------------------------------------
create table if not exists public.entries (
  id          uuid        primary key default gen_random_uuid(),
  season_id   uuid        not null references public.seasons (id) on delete cascade,
  class_id    uuid        references public.season_classes (id) on delete set null,
  team_id     uuid        references public.teams (id) on delete set null,
  car_number  int,
  car_model   text,                                          -- sim-specific car identifier
  livery_url  text,
  withdrawn   boolean     not null default false,
  created_at  timestamptz not null default now(),
  unique (season_id, car_number)
);

comment on table public.entries is 'A grid slot (car) in a season; drivers attach via entry_drivers.';

create index if not exists entries_season_idx on public.entries (season_id, class_id);
create index if not exists entries_team_idx on public.entries (team_id);

-- ----------------------------------------------------------------------------
-- Table: entry_drivers
--   Driver line-up per entry. One row for sprint seasons; several for
--   endurance cars (driver/co-driver/reserve).
-- ----------------------------------------------------------------------------
create table if not exists public.entry_drivers (
  entry_id    uuid        not null references public.entries (id) on delete cascade,
  driver_id   uuid        not null references public.drivers (id) on delete cascade,
  role        text        not null default 'driver',         -- 'driver' | 'co-driver' | 'reserve'
  created_at  timestamptz not null default now(),
  primary key (entry_id, driver_id)
);

comment on table public.entry_drivers is 'Driver line-up per entry (supports endurance multi-driver cars).';

create index if not exists entry_drivers_driver_idx on public.entry_drivers (driver_id);

-- ----------------------------------------------------------------------------
-- Table: rounds
--   A calendar event in a season. `server_config` holds the intended session
--   format; Phase 2 server provisioning reads it to spool up a server
--   (04-architecture.md §4.2.4).
-- ----------------------------------------------------------------------------
create table if not exists public.rounds (
  id             uuid         primary key default gen_random_uuid(),
  season_id      uuid         not null references public.seasons (id) on delete cascade,
  track_id       uuid         references public.tracks (id) on delete set null,
  round_no       int          not null,
  name           text,                                       -- '6 Hours of Spa'; null = 'Round {round_no}'
  starts_at      timestamptz,
  status         round_status not null default 'scheduled',
  server_config  jsonb        not null default '{}'::jsonb,  -- session format, weather, length, host details
  created_at     timestamptz  not null default now(),
  unique (season_id, round_no)
);

comment on table public.rounds is 'Season calendar entries; server_config feeds Phase 2 auto-provisioning.';

create index if not exists rounds_season_idx on public.rounds (season_id, round_no);
create index if not exists rounds_starts_at_idx on public.rounds (starts_at);

-- ----------------------------------------------------------------------------
-- Table: result_ingestions
--   Immutable raw results payloads (04-architecture.md §4.1 step 1). The raw
--   JSON is stored verbatim BEFORE parsing: audit trail + free re-processing.
-- ----------------------------------------------------------------------------
create table if not exists public.result_ingestions (
  id           uuid             primary key default gen_random_uuid(),
  season_id    uuid             not null references public.seasons (id) on delete cascade,
  round_id     uuid             references public.rounds (id) on delete set null,
  sim_id       uuid             not null references public.sims (id),
  source       text             not null default 'upload',   -- 'upload' | 'agent' | 'provider_pull'
  file_name    text,
  raw          jsonb            not null,                    -- the server results file, verbatim
  payload_hash text             not null unique,             -- sha256 of raw: agent retries upsert, never duplicate
                                                             -- (same idempotency shape as merch_orders.stripe_session_id)
  status       ingestion_status not null default 'received',
  error        text,                                         -- populated when status = 'failed'
  uploaded_by  uuid             references auth.users (id) on delete set null,
  created_at   timestamptz      not null default now(),
  applied_at   timestamptz
);

comment on table public.result_ingestions is 'Raw server results JSON, immutable. Parsed into race_sessions/results by per-sim adapters.';

create index if not exists result_ingestions_season_idx on public.result_ingestions (season_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Table: race_sessions
--   What actually ran: one row per session (practice/quali/race) per round,
--   created by ingestion apply (or manually for manual-results leagues).
-- ----------------------------------------------------------------------------
create table if not exists public.race_sessions (
  id            uuid         primary key default gen_random_uuid(),
  round_id      uuid         not null references public.rounds (id) on delete cascade,
  ingestion_id  uuid         references public.result_ingestions (id) on delete set null,
  type          session_type not null,
  started_at    timestamptz,
  duration_s    int,
  weather       jsonb,                                       -- as reported by the server, sim-specific
  created_at    timestamptz  not null default now()
);

comment on table public.race_sessions is 'Sessions that ran within a round; parent of results rows.';

create index if not exists race_sessions_round_idx on public.race_sessions (round_id, type);

-- ----------------------------------------------------------------------------
-- Table: results
--   Normalised per-driver classification for a session. `points` is written by
--   the points engine on apply (scheme + penalties), never computed on read.
-- ----------------------------------------------------------------------------
create table if not exists public.results (
  id             uuid          primary key default gen_random_uuid(),
  session_id     uuid          not null references public.race_sessions (id) on delete cascade,
  entry_id       uuid          references public.entries (id) on delete set null,
  driver_id      uuid          not null references public.drivers (id),
  position       int           not null,
  grid_position  int,
  laps           int           not null default 0,
  total_time_ms  bigint,                                     -- null for lapped/DNF where the sim omits it
  gap_ms         bigint,                                     -- to class leader
  best_lap_ms    int,
  status         result_status not null default 'finished',
  fastest_lap    boolean       not null default false,       -- fastest of class this session
  pole           boolean       not null default false,       -- quali P1 (set on the race row for scoring)
  points         int           not null default 0,           -- written by the points engine
  created_at     timestamptz   not null default now(),
  unique (session_id, driver_id)
);

comment on table public.results is 'Normalised session classification; points written by the engine on ingestion apply.';

create index if not exists results_session_position_idx on public.results (session_id, position);
create index if not exists results_driver_idx on public.results (driver_id);

-- ----------------------------------------------------------------------------
-- Table: incidents
--   Incident reports feeding the steward workflow (this table IS the
--   "incident_reports" concept — one table, statuses carry the workflow).
--   Reporter and accused are drivers; decisions may spawn penalties
--   (penalties.incident_id).
-- ----------------------------------------------------------------------------
create table if not exists public.incidents (
  id                  uuid            primary key default gen_random_uuid(),
  round_id            uuid            not null references public.rounds (id) on delete cascade,
  session_id          uuid            references public.race_sessions (id) on delete set null,
  reported_by         uuid            references public.drivers (id) on delete set null,
  against_driver_id   uuid            references public.drivers (id) on delete set null,
  lap                 int,
  description         text            not null,
  evidence_url        text,                                  -- clip/replay link
  status              incident_status not null default 'open',
  steward_notes       text,
  decided_by          uuid            references auth.users (id) on delete set null,
  decided_at          timestamptz,
  created_at          timestamptz     not null default now()
);

comment on table public.incidents is 'Incident reports; the steward queue. Decisions may issue penalties.';

create index if not exists incidents_round_status_idx on public.incidents (round_id, status);

-- ----------------------------------------------------------------------------
-- Table: penalties
--   Sanctions issued by stewards (usually from an incident, but issuable
--   directly). penalty_points accumulate toward penalty_schemes.ban_threshold;
--   points_deduction / time penalties are folded in by the points engine and
--   standings recompute.
-- ----------------------------------------------------------------------------
create table if not exists public.penalties (
  id            uuid         primary key default gen_random_uuid(),
  season_id     uuid         not null references public.seasons (id) on delete cascade,
  round_id      uuid         references public.rounds (id) on delete set null,
  incident_id   uuid         references public.incidents (id) on delete set null,
  driver_id     uuid         not null references public.drivers (id),
  entry_id      uuid         references public.entries (id) on delete set null,
  type          penalty_type not null,
  value         int          not null default 0,             -- seconds (time), places (grid), points (deduction)
  penalty_points int         not null default 0,             -- licence points toward ban threshold
  reason        text         not null,
  issued_by     uuid         references auth.users (id) on delete set null,
  created_at    timestamptz  not null default now()
);

comment on table public.penalties is 'Steward sanctions; consumed by the points engine and standings recompute.';

create index if not exists penalties_season_driver_idx on public.penalties (season_id, driver_id);

-- ----------------------------------------------------------------------------
-- Table: standings_cache
--   Computed-on-write championship tables (04-architecture.md §5). Recomputed
--   for the whole season inside the ingestion-apply / penalty transaction;
--   public standings pages are exactly one indexed read of this table.
--   `scope` distinguishes the driver table from the team table.
-- ----------------------------------------------------------------------------
create table if not exists public.standings_cache (
  season_id       uuid        not null references public.seasons (id) on delete cascade,
  class_id        uuid        references public.season_classes (id) on delete cascade,
  scope           text        not null default 'driver',     -- 'driver' | 'team'
  driver_id       uuid        references public.drivers (id) on delete cascade,
  team_id         uuid        references public.teams (id) on delete cascade,
  position        int         not null,
  points          int         not null default 0,
  wins            int         not null default 0,
  podiums         int         not null default 0,
  poles           int         not null default 0,
  fastest_laps    int         not null default 0,
  penalty_points  int         not null default 0,            -- current licence points (ban proximity UI)
  rounds_counted  int         not null default 0,
  computed_at     timestamptz not null default now(),
  -- one row per driver (or team) per season+class per scope; coalesce because
  -- class_id / the non-scoped id are null in single-class & driver/team rows.
  unique nulls not distinct (season_id, class_id, scope, driver_id, team_id)
);

comment on table public.standings_cache is 'Championship standings, recomputed on write. Public pages read only this.';

create index if not exists standings_cache_read_idx
  on public.standings_cache (season_id, class_id, scope, position);

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Policy model (per 04-architecture.md §3.1):
--   * PUBLIC READ  — the shareable product surfaces: leagues (public ones),
--     seasons, classes, teams, entries, rounds, sessions, results, standings,
--     penalties, tracks, sims, drivers (registry is public rosters).
--   * MEMBER WRITE — league staff (owner/admin) manage their league's rows;
--     stewards additionally decide incidents & issue penalties.
--   * SELF WRITE   — authenticated drivers create sign-ups & incident reports,
--     and edit their own driver profile.
--   * SERVICE ROLE — ingestion agent writes and standings recompute bypass RLS
--     (service key), same pattern as merch_orders / replays_cache today.
-- The full per-table policy set below is representative for the draft; expect
-- refinement (esp. unlisted-league visibility) during implementation review.
-- ============================================================================

alter table public.sims               enable row level security;
alter table public.tracks             enable row level security;
alter table public.drivers            enable row level security;
alter table public.driver_aliases     enable row level security;
alter table public.leagues            enable row level security;
alter table public.league_members     enable row level security;
alter table public.points_schemes     enable row level security;
alter table public.penalty_schemes    enable row level security;
alter table public.seasons            enable row level security;
alter table public.season_classes     enable row level security;
alter table public.teams              enable row level security;
alter table public.signups            enable row level security;
alter table public.entries            enable row level security;
alter table public.entry_drivers      enable row level security;
alter table public.rounds             enable row level security;
alter table public.result_ingestions  enable row level security;
alter table public.race_sessions      enable row level security;
alter table public.results            enable row level security;
alter table public.incidents          enable row level security;
alter table public.penalties          enable row level security;
alter table public.standings_cache    enable row level security;

-- Reference data: public read; writes via service role only.
drop policy if exists "Public can read sims" on public.sims;
create policy "Public can read sims"
  on public.sims for select to anon, authenticated using (true);

drop policy if exists "Public can read tracks" on public.tracks;
create policy "Public can read tracks"
  on public.tracks for select to anon, authenticated using (true);

-- Drivers: public rosters; a signed-in user edits the driver row they claimed.
drop policy if exists "Public can read drivers" on public.drivers;
create policy "Public can read drivers"
  on public.drivers for select to anon, authenticated using (true);

drop policy if exists "Users update own driver profile" on public.drivers;
create policy "Users update own driver profile"
  on public.drivers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Leagues: public ones are readable by all; unlisted ones by members only.
drop policy if exists "Public can read public leagues" on public.leagues;
create policy "Public can read public leagues"
  on public.leagues for select to anon, authenticated
  using (
    is_public
    or exists (
      select 1 from public.league_members m
      where m.league_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated can create leagues" on public.leagues;
create policy "Authenticated can create leagues"
  on public.leagues for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Staff update their league" on public.leagues;
create policy "Staff update their league"
  on public.leagues for update to authenticated
  using (public.is_league_staff(id)) with check (public.is_league_staff(id));

-- League members: members see their league's roster; staff manage it.
drop policy if exists "Members read league roster" on public.league_members;
create policy "Members read league roster"
  on public.league_members for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.league_members m
      where m.league_id = league_members.league_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Staff manage league roster" on public.league_members;
create policy "Staff manage league roster"
  on public.league_members for all to authenticated
  using (public.is_league_staff(league_id)) with check (public.is_league_staff(league_id));

-- Season-tree public reads (seasons, classes, teams, entries, entry line-ups,
-- rounds, sessions, results, penalties, standings): the shareable product.
drop policy if exists "Public can read seasons" on public.seasons;
create policy "Public can read seasons"
  on public.seasons for select to anon, authenticated using (true);

drop policy if exists "Public can read season classes" on public.season_classes;
create policy "Public can read season classes"
  on public.season_classes for select to anon, authenticated using (true);

drop policy if exists "Public can read teams" on public.teams;
create policy "Public can read teams"
  on public.teams for select to anon, authenticated using (true);

drop policy if exists "Public can read entries" on public.entries;
create policy "Public can read entries"
  on public.entries for select to anon, authenticated using (true);

drop policy if exists "Public can read entry drivers" on public.entry_drivers;
create policy "Public can read entry drivers"
  on public.entry_drivers for select to anon, authenticated using (true);

drop policy if exists "Public can read rounds" on public.rounds;
create policy "Public can read rounds"
  on public.rounds for select to anon, authenticated using (true);

drop policy if exists "Public can read race sessions" on public.race_sessions;
create policy "Public can read race sessions"
  on public.race_sessions for select to anon, authenticated using (true);

drop policy if exists "Public can read results" on public.results;
create policy "Public can read results"
  on public.results for select to anon, authenticated using (true);

drop policy if exists "Public can read penalties" on public.penalties;
create policy "Public can read penalties"
  on public.penalties for select to anon, authenticated using (true);

drop policy if exists "Public can read standings" on public.standings_cache;
create policy "Public can read standings"
  on public.standings_cache for select to anon, authenticated using (true);

-- Points/penalty schemes: presets (null league) and any league's schemes are
-- readable (standings pages explain the scoring); staff manage their own.
drop policy if exists "Public can read points schemes" on public.points_schemes;
create policy "Public can read points schemes"
  on public.points_schemes for select to anon, authenticated using (true);

drop policy if exists "Staff manage points schemes" on public.points_schemes;
create policy "Staff manage points schemes"
  on public.points_schemes for all to authenticated
  using (league_id is not null and public.is_league_staff(league_id))
  with check (league_id is not null and public.is_league_staff(league_id));

drop policy if exists "Public can read penalty schemes" on public.penalty_schemes;
create policy "Public can read penalty schemes"
  on public.penalty_schemes for select to anon, authenticated using (true);

drop policy if exists "Staff manage penalty schemes" on public.penalty_schemes;
create policy "Staff manage penalty schemes"
  on public.penalty_schemes for all to authenticated
  using (league_id is not null and public.is_league_staff(league_id))
  with check (league_id is not null and public.is_league_staff(league_id));

-- Staff write policies over the season tree. (Representative subset — the
-- same is_league_staff(...) pattern repeats for classes/teams/entries/rounds;
-- spelled out here for the tables with non-obvious league resolution.)
drop policy if exists "Staff manage seasons" on public.seasons;
create policy "Staff manage seasons"
  on public.seasons for all to authenticated
  using (public.is_league_staff(league_id)) with check (public.is_league_staff(league_id));

drop policy if exists "Staff manage rounds" on public.rounds;
create policy "Staff manage rounds"
  on public.rounds for all to authenticated
  using (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)))
  with check (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)));

-- Sign-ups: a driver files their own; staff read & decide their season's.
drop policy if exists "Drivers create own signup" on public.signups;
create policy "Drivers create own signup"
  on public.signups for insert to authenticated
  with check (
    exists (select 1 from public.drivers d where d.id = driver_id and d.user_id = auth.uid())
  );

drop policy if exists "Drivers read own signups" on public.signups;
create policy "Drivers read own signups"
  on public.signups for select to authenticated
  using (
    exists (select 1 from public.drivers d where d.id = driver_id and d.user_id = auth.uid())
    or public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id))
  );

drop policy if exists "Staff decide signups" on public.signups;
create policy "Staff decide signups"
  on public.signups for update to authenticated
  using (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)))
  with check (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)));

-- Incidents: any member of the league may report; involved parties + stewards
-- read; stewards decide. Reports are NOT public (protests stay in the office).
drop policy if exists "Drivers report incidents" on public.incidents;
create policy "Drivers report incidents"
  on public.incidents for insert to authenticated
  with check (
    exists (select 1 from public.drivers d where d.id = reported_by and d.user_id = auth.uid())
  );

drop policy if exists "Involved and stewards read incidents" on public.incidents;
create policy "Involved and stewards read incidents"
  on public.incidents for select to authenticated
  using (
    exists (
      select 1 from public.drivers d
      where d.user_id = auth.uid() and d.id in (reported_by, against_driver_id)
    )
    or public.is_league_steward((
      select s.league_id from public.rounds r
      join public.seasons s on s.id = r.season_id
      where r.id = round_id
    ))
  );

drop policy if exists "Stewards decide incidents" on public.incidents;
create policy "Stewards decide incidents"
  on public.incidents for update to authenticated
  using (public.is_league_steward((
    select s.league_id from public.rounds r
    join public.seasons s on s.id = r.season_id
    where r.id = round_id
  )));

-- Stewards issue penalties (public read is granted above).
drop policy if exists "Stewards issue penalties" on public.penalties;
create policy "Stewards issue penalties"
  on public.penalties for insert to authenticated
  with check (public.is_league_steward((select s.league_id from public.seasons s where s.id = season_id)));

-- Ingestions: staff upload + review their own; agent/service-role writes
-- bypass RLS. Raw payloads are never public.
drop policy if exists "Staff manage ingestions" on public.result_ingestions;
create policy "Staff manage ingestions"
  on public.result_ingestions for all to authenticated
  using (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)))
  with check (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)));

-- driver_aliases, race_sessions, results, standings_cache writes: performed by
-- the ingestion pipeline / points engine with the service-role key only (no
-- authenticated write policies on purpose — RLS-on + no policy = deny).
