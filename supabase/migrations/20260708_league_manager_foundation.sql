-- ============================================================================
-- League Manager — foundation schema (applied 2026-07-08)
-- ----------------------------------------------------------------------------
-- Promoted from docs/league-manager/05-data-model.sql (planning draft) with
-- implementation fixes:
--   * NEW is_league_member() SECURITY DEFINER helper — the draft's
--     league_members/leagues SELECT policies queried league_members inside
--     their own policy, which Postgres rejects as infinite RLS recursion.
--   * Staff-write policies spelled out for season_classes / teams / entries /
--     entry_drivers (the draft marked them "representative subset").
--   * "Creator adds self as owner" insert policy on league_members so the
--     create-league flow works under RLS without the service-role key.
--   * "Users create own driver profile" insert policy on drivers (first
--     sign-in provisioning).
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
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums — code-level contracts only; content-ish things (sims, classes,
-- penalty categories) are rows, not enums.
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
-- Table: sims — supported simulator titles; a lookup table so new titles are
-- an INSERT, not a migration. Capability flags mirror 03-sim-integrations.md.
-- ----------------------------------------------------------------------------
create table if not exists public.sims (
  id                  uuid primary key default gen_random_uuid(),
  slug                text        not null unique,
  name                text        not null,
  short_name          text        not null,
  has_results_export  boolean     not null default false,
  has_server_api      boolean     not null default false,
  results_format_note text,
  created_at          timestamptz not null default now()
);

comment on table public.sims is 'Supported simulator titles and their integration capabilities.';

-- ----------------------------------------------------------------------------
-- Table: tracks — per-sim track/layout registry.
-- ----------------------------------------------------------------------------
create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  sim_id      uuid        not null references public.sims (id) on delete cascade,
  slug        text        not null,
  name        text        not null,
  layout      text,
  country     text,
  length_m    int,
  created_at  timestamptz not null default now(),
  unique (sim_id, slug, layout)
);

comment on table public.tracks is 'Per-sim track/layout registry; slug matches the value used in server configs.';

create index if not exists tracks_sim_idx on public.tracks (sim_id);

-- ----------------------------------------------------------------------------
-- Table: drivers — the driver registry. Deliberately NOT 1:1 with auth
-- accounts; `user_id` links a driver to a Supabase Auth account once claimed.
-- ----------------------------------------------------------------------------
create table if not exists public.drivers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        unique references auth.users (id) on delete set null,
  display_name  text        not null,
  discord       text,
  country       text,
  platform_ids  jsonb       not null default '{}'::jsonb,
  avatar_url    text,
  open_to_offers boolean    not null default false,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.drivers is 'Driver registry; optionally claimed by an auth user. Created by sign-up, organiser, or ingestion.';

create index if not exists drivers_display_name_idx on public.drivers (lower(display_name));

-- ----------------------------------------------------------------------------
-- Table: driver_aliases — results name-matching memory, per sim.
-- ----------------------------------------------------------------------------
create table if not exists public.driver_aliases (
  id          uuid primary key default gen_random_uuid(),
  driver_id   uuid        not null references public.drivers (id) on delete cascade,
  sim_id      uuid        not null references public.sims (id) on delete cascade,
  alias       text        not null,
  created_at  timestamptz not null default now(),
  unique (sim_id, alias)
);

comment on table public.driver_aliases is 'Maps raw server-results names/ids to drivers, per sim. Written on confirmed matches.';

create index if not exists driver_aliases_driver_idx on public.driver_aliases (driver_id);

-- ----------------------------------------------------------------------------
-- Table: leagues — a racing community. `featured` headlines Apex & Chill's own
-- leagues on the directory.
-- ----------------------------------------------------------------------------
create table if not exists public.leagues (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         text        not null,
  tagline      text,
  description  text,
  logo_url     text,
  banner_url   text,
  accent_color text        not null default '#e11d48',
  discord_url  text,
  is_public    boolean     not null default true,
  featured     boolean     not null default false,
  created_by   uuid        references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.leagues is 'A racing community. Everything below hangs off a league.';

create index if not exists leagues_featured_idx on public.leagues (featured) where featured;

-- ----------------------------------------------------------------------------
-- Table: league_members — role assignments per league; the RLS backbone.
-- ----------------------------------------------------------------------------
create table if not exists public.league_members (
  league_id   uuid        not null references public.leagues (id) on delete cascade,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  role        league_role not null default 'driver',
  created_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

comment on table public.league_members is 'Per-league roles (owner/admin/steward/driver); backs is_league_* RLS helpers.';

create index if not exists league_members_user_idx on public.league_members (user_id);

-- ----------------------------------------------------------------------------
-- Helpers: is_league_member / is_league_staff / is_league_steward
--   RLS predicates. SECURITY DEFINER so policies can call them without RLS
--   recursing into league_members (whose own policies would otherwise loop).
--   Defined after league_members because sql-language bodies are validated at
--   creation time.
-- ----------------------------------------------------------------------------
create or replace function public.is_league_member(p_league_id uuid)
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
  );
$$;

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
-- Table: points_schemes — reusable scoring rule sets. NULL league_id = global
-- preset. `positions_points` index 0 = P1 points.
-- ----------------------------------------------------------------------------
create table if not exists public.points_schemes (
  id                        uuid primary key default gen_random_uuid(),
  league_id                 uuid        references public.leagues (id) on delete cascade,
  name                      text        not null,
  positions_points          jsonb       not null default '[25,18,15,12,10,8,6,4,2,1]'::jsonb,
  pole_points               int         not null default 0,
  fastest_lap_points        int         not null default 0,
  fastest_lap_requires_top  int,
  dnf_scores                boolean     not null default false,
  drop_rounds               int         not null default 0,
  created_at                timestamptz not null default now()
);

comment on table public.points_schemes is 'Scoring rule sets; null league_id rows are global presets. Consumed by the points engine on ingestion.';

create index if not exists points_schemes_league_idx on public.points_schemes (league_id);

-- ----------------------------------------------------------------------------
-- Table: penalty_schemes — penalty-point rule sets + licence thresholds.
-- ----------------------------------------------------------------------------
create table if not exists public.penalty_schemes (
  id                   uuid primary key default gen_random_uuid(),
  league_id            uuid        references public.leagues (id) on delete cascade,
  name                 text        not null,
  rules                jsonb       not null default '[]'::jsonb,
  ban_threshold_points int,
  points_expire_after  int,
  created_at           timestamptz not null default now()
);

comment on table public.penalty_schemes is 'Penalty/licence-point rule sets; null league_id rows are global presets.';

create index if not exists penalty_schemes_league_idx on public.penalty_schemes (league_id);

-- ----------------------------------------------------------------------------
-- Table: seasons — a championship: one league, one sim, one scheme pair.
-- ----------------------------------------------------------------------------
create table if not exists public.seasons (
  id                 uuid primary key default gen_random_uuid(),
  league_id          uuid          not null references public.leagues (id) on delete cascade,
  sim_id             uuid          not null references public.sims (id),
  points_scheme_id   uuid          references public.points_schemes (id),
  penalty_scheme_id  uuid          references public.penalty_schemes (id),
  slug               text          not null,
  name               text          not null,
  status             season_status not null default 'draft',
  signup_opens_at    timestamptz,
  signup_closes_at   timestamptz,
  max_entries        int,
  signup_questions   jsonb         not null default '[]'::jsonb,
  teams_enabled      boolean       not null default true,
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now(),
  unique (league_id, slug)
);

comment on table public.seasons is 'A championship: one league, one sim, one points+penalty scheme pair.';

create index if not exists seasons_league_idx on public.seasons (league_id, status);

-- ----------------------------------------------------------------------------
-- Table: season_classes — car classes within a season (multiclass endurance).
-- ----------------------------------------------------------------------------
create table if not exists public.season_classes (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid        not null references public.seasons (id) on delete cascade,
  name        text        not null,
  color       text        not null default '#ffffff',
  car_models  jsonb       not null default '[]'::jsonb,
  sort_order  int         not null default 0,
  unique (season_id, name)
);

comment on table public.season_classes is 'Car classes within a season; standings and entries are scoped per class.';

create index if not exists season_classes_season_idx on public.season_classes (season_id);

-- ----------------------------------------------------------------------------
-- Table: teams — league-level teams; referenced by season entries.
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
-- Table: signups — a driver's application to a season.
-- ----------------------------------------------------------------------------
create table if not exists public.signups (
  id          uuid          primary key default gen_random_uuid(),
  season_id   uuid          not null references public.seasons (id) on delete cascade,
  driver_id   uuid          not null references public.drivers (id) on delete cascade,
  class_id    uuid          references public.season_classes (id) on delete set null,
  status      signup_status not null default 'pending',
  answers     jsonb         not null default '{}'::jsonb,
  message     text,
  decided_by  uuid          references auth.users (id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz   not null default now(),
  unique (season_id, driver_id)
);

comment on table public.signups is 'Season applications; accepted sign-ups become entries.';

create index if not exists signups_season_status_idx on public.signups (season_id, status);

-- ----------------------------------------------------------------------------
-- Table: entries — a confirmed grid slot (the CAR); drivers attach via
-- entry_drivers so endurance line-ups work like sprint seasons.
-- ----------------------------------------------------------------------------
create table if not exists public.entries (
  id          uuid        primary key default gen_random_uuid(),
  season_id   uuid        not null references public.seasons (id) on delete cascade,
  class_id    uuid        references public.season_classes (id) on delete set null,
  team_id     uuid        references public.teams (id) on delete set null,
  car_number  int,
  car_model   text,
  livery_url  text,
  withdrawn   boolean     not null default false,
  created_at  timestamptz not null default now(),
  unique (season_id, car_number)
);

comment on table public.entries is 'A grid slot (car) in a season; drivers attach via entry_drivers.';

create index if not exists entries_season_idx on public.entries (season_id, class_id);
create index if not exists entries_team_idx on public.entries (team_id);

-- ----------------------------------------------------------------------------
-- Table: entry_drivers — driver line-up per entry.
-- ----------------------------------------------------------------------------
create table if not exists public.entry_drivers (
  entry_id    uuid        not null references public.entries (id) on delete cascade,
  driver_id   uuid        not null references public.drivers (id) on delete cascade,
  role        text        not null default 'driver',
  created_at  timestamptz not null default now(),
  primary key (entry_id, driver_id)
);

comment on table public.entry_drivers is 'Driver line-up per entry (supports endurance multi-driver cars).';

create index if not exists entry_drivers_driver_idx on public.entry_drivers (driver_id);

-- ----------------------------------------------------------------------------
-- Table: rounds — a calendar event in a season. `server_config` feeds Phase 3
-- auto-provisioning.
-- ----------------------------------------------------------------------------
create table if not exists public.rounds (
  id             uuid         primary key default gen_random_uuid(),
  season_id      uuid         not null references public.seasons (id) on delete cascade,
  track_id       uuid         references public.tracks (id) on delete set null,
  round_no       int          not null,
  name           text,
  starts_at      timestamptz,
  status         round_status not null default 'scheduled',
  server_config  jsonb        not null default '{}'::jsonb,
  created_at     timestamptz  not null default now(),
  unique (season_id, round_no)
);

comment on table public.rounds is 'Season calendar entries; server_config feeds later auto-provisioning.';

create index if not exists rounds_season_idx on public.rounds (season_id, round_no);
create index if not exists rounds_starts_at_idx on public.rounds (starts_at);

-- ----------------------------------------------------------------------------
-- Table: result_ingestions — immutable raw results payloads. Stored verbatim
-- BEFORE parsing: audit trail + free re-processing.
-- ----------------------------------------------------------------------------
create table if not exists public.result_ingestions (
  id           uuid             primary key default gen_random_uuid(),
  season_id    uuid             not null references public.seasons (id) on delete cascade,
  round_id     uuid             references public.rounds (id) on delete set null,
  sim_id       uuid             not null references public.sims (id),
  source       text             not null default 'upload',
  file_name    text,
  raw          jsonb            not null,
  payload_hash text             not null unique,
  status       ingestion_status not null default 'received',
  error        text,
  uploaded_by  uuid             references auth.users (id) on delete set null,
  created_at   timestamptz      not null default now(),
  applied_at   timestamptz
);

comment on table public.result_ingestions is 'Raw server results JSON, immutable. Parsed into race_sessions/results by per-sim adapters.';

create index if not exists result_ingestions_season_idx on public.result_ingestions (season_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Table: race_sessions — what actually ran within a round.
-- ----------------------------------------------------------------------------
create table if not exists public.race_sessions (
  id            uuid         primary key default gen_random_uuid(),
  round_id      uuid         not null references public.rounds (id) on delete cascade,
  ingestion_id  uuid         references public.result_ingestions (id) on delete set null,
  type          session_type not null,
  started_at    timestamptz,
  duration_s    int,
  weather       jsonb,
  created_at    timestamptz  not null default now()
);

comment on table public.race_sessions is 'Sessions that ran within a round; parent of results rows.';

create index if not exists race_sessions_round_idx on public.race_sessions (round_id, type);

-- ----------------------------------------------------------------------------
-- Table: results — normalised per-driver classification. `points` written by
-- the points engine on apply, never computed on read.
-- ----------------------------------------------------------------------------
create table if not exists public.results (
  id             uuid          primary key default gen_random_uuid(),
  session_id     uuid          not null references public.race_sessions (id) on delete cascade,
  entry_id       uuid          references public.entries (id) on delete set null,
  driver_id      uuid          not null references public.drivers (id),
  position       int           not null,
  grid_position  int,
  laps           int           not null default 0,
  total_time_ms  bigint,
  gap_ms         bigint,
  best_lap_ms    int,
  status         result_status not null default 'finished',
  fastest_lap    boolean       not null default false,
  pole           boolean       not null default false,
  points         int           not null default 0,
  created_at     timestamptz   not null default now(),
  unique (session_id, driver_id)
);

comment on table public.results is 'Normalised session classification; points written by the engine on ingestion apply.';

create index if not exists results_session_position_idx on public.results (session_id, position);
create index if not exists results_driver_idx on public.results (driver_id);

-- ----------------------------------------------------------------------------
-- Table: incidents — incident reports feeding the steward workflow.
-- ----------------------------------------------------------------------------
create table if not exists public.incidents (
  id                  uuid            primary key default gen_random_uuid(),
  round_id            uuid            not null references public.rounds (id) on delete cascade,
  session_id          uuid            references public.race_sessions (id) on delete set null,
  reported_by         uuid            references public.drivers (id) on delete set null,
  against_driver_id   uuid            references public.drivers (id) on delete set null,
  lap                 int,
  description         text            not null,
  evidence_url        text,
  status              incident_status not null default 'open',
  steward_notes       text,
  decided_by          uuid            references auth.users (id) on delete set null,
  decided_at          timestamptz,
  created_at          timestamptz     not null default now()
);

comment on table public.incidents is 'Incident reports; the steward queue. Decisions may issue penalties.';

create index if not exists incidents_round_status_idx on public.incidents (round_id, status);

-- ----------------------------------------------------------------------------
-- Table: penalties — sanctions issued by stewards.
-- ----------------------------------------------------------------------------
create table if not exists public.penalties (
  id            uuid         primary key default gen_random_uuid(),
  season_id     uuid         not null references public.seasons (id) on delete cascade,
  round_id      uuid         references public.rounds (id) on delete set null,
  incident_id   uuid         references public.incidents (id) on delete set null,
  driver_id     uuid         not null references public.drivers (id),
  entry_id      uuid         references public.entries (id) on delete set null,
  type          penalty_type not null,
  value         int          not null default 0,
  penalty_points int         not null default 0,
  reason        text         not null,
  issued_by     uuid         references auth.users (id) on delete set null,
  created_at    timestamptz  not null default now()
);

comment on table public.penalties is 'Steward sanctions; consumed by the points engine and standings recompute.';

create index if not exists penalties_season_driver_idx on public.penalties (season_id, driver_id);

-- ----------------------------------------------------------------------------
-- Table: standings_cache — computed-on-write championship tables. Public
-- standings pages are exactly one indexed read of this table.
-- ----------------------------------------------------------------------------
create table if not exists public.standings_cache (
  season_id       uuid        not null references public.seasons (id) on delete cascade,
  class_id        uuid        references public.season_classes (id) on delete cascade,
  scope           text        not null default 'driver',
  driver_id       uuid        references public.drivers (id) on delete cascade,
  team_id         uuid        references public.teams (id) on delete cascade,
  position        int         not null,
  points          int         not null default 0,
  wins            int         not null default 0,
  podiums         int         not null default 0,
  poles           int         not null default 0,
  fastest_laps    int         not null default 0,
  penalty_points  int         not null default 0,
  rounds_counted  int         not null default 0,
  computed_at     timestamptz not null default now(),
  unique nulls not distinct (season_id, class_id, scope, driver_id, team_id)
);

comment on table public.standings_cache is 'Championship standings, recomputed on write. Public pages read only this.';

create index if not exists standings_cache_read_idx
  on public.standings_cache (season_id, class_id, scope, position);

-- ============================================================================
-- Row Level Security
--   PUBLIC READ  — the shareable product surfaces.
--   MEMBER WRITE — league staff manage their league; stewards decide.
--   SELF WRITE   — drivers create sign-ups/reports and edit their own profile.
--   SERVICE ROLE — ingestion pipeline + standings recompute bypass RLS.
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
alter table public.season_classes    enable row level security;
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

-- Drivers: public rosters; users create + edit the driver row they claimed.
drop policy if exists "Public can read drivers" on public.drivers;
create policy "Public can read drivers"
  on public.drivers for select to anon, authenticated using (true);

drop policy if exists "Users create own driver profile" on public.drivers;
create policy "Users create own driver profile"
  on public.drivers for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own driver profile" on public.drivers;
create policy "Users update own driver profile"
  on public.drivers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Leagues: public ones readable by all; unlisted ones by members only.
-- (is_league_member is SECURITY DEFINER — no RLS recursion.)
drop policy if exists "Public can read public leagues" on public.leagues;
create policy "Public can read public leagues"
  on public.leagues for select to anon, authenticated
  using (is_public or public.is_league_member(id));

drop policy if exists "Authenticated can create leagues" on public.leagues;
create policy "Authenticated can create leagues"
  on public.leagues for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Staff update their league" on public.leagues;
create policy "Staff update their league"
  on public.leagues for update to authenticated
  using (public.is_league_staff(id)) with check (public.is_league_staff(id));

-- League members: members see their league's roster; staff manage it; the
-- league creator seats themselves as owner (create-league flow under RLS).
drop policy if exists "Members read league roster" on public.league_members;
create policy "Members read league roster"
  on public.league_members for select to authenticated
  using (user_id = auth.uid() or public.is_league_member(league_id));

drop policy if exists "Creator adds self as owner" on public.league_members;
create policy "Creator adds self as owner"
  on public.league_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.leagues l
      where l.id = league_id and l.created_by = auth.uid()
    )
  );

drop policy if exists "Staff manage league roster" on public.league_members;
create policy "Staff manage league roster"
  on public.league_members for all to authenticated
  using (public.is_league_staff(league_id)) with check (public.is_league_staff(league_id));

-- Season-tree public reads: the shareable product.
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

-- Points/penalty schemes: presets + any league's schemes readable; staff
-- manage their own (presets are service-role only).
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

-- Staff writes over the season tree.
drop policy if exists "Staff manage seasons" on public.seasons;
create policy "Staff manage seasons"
  on public.seasons for all to authenticated
  using (public.is_league_staff(league_id)) with check (public.is_league_staff(league_id));

drop policy if exists "Staff manage season classes" on public.season_classes;
create policy "Staff manage season classes"
  on public.season_classes for all to authenticated
  using (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)))
  with check (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)));

drop policy if exists "Staff manage teams" on public.teams;
create policy "Staff manage teams"
  on public.teams for all to authenticated
  using (public.is_league_staff(league_id)) with check (public.is_league_staff(league_id));

drop policy if exists "Staff manage entries" on public.entries;
create policy "Staff manage entries"
  on public.entries for all to authenticated
  using (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)))
  with check (public.is_league_staff((select s.league_id from public.seasons s where s.id = season_id)));

drop policy if exists "Staff manage entry drivers" on public.entry_drivers;
create policy "Staff manage entry drivers"
  on public.entry_drivers for all to authenticated
  using (public.is_league_staff((
    select s.league_id from public.entries e
    join public.seasons s on s.id = e.season_id
    where e.id = entry_id
  )))
  with check (public.is_league_staff((
    select s.league_id from public.entries e
    join public.seasons s on s.id = e.season_id
    where e.id = entry_id
  )));

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

-- Incidents: drivers report; involved parties + stewards read; stewards
-- decide. Reports are NOT public.
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

-- Stewards issue penalties (public read granted above).
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
-- the ingestion pipeline / points engine with the service-role key only
-- (RLS-on + no authenticated write policy = deny by default).
