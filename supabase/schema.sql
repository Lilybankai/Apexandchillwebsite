-- ============================================================================
-- Apex & Chill Racing — Supabase schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL editor (or via `supabase db push`) to provision
-- the tables the site uses. Everything here is optional for the site to render
-- (the API clients fall back to live provider APIs / sample data), but it
-- powers two things:
--   1. join_submissions  — persists "Join the League" form submissions.
--   2. race_standings     — an optional manual/cached standings store, mirroring
--                           the legacy WordPress wp_race_standings table, for
--                           seasons not (yet) served by SimGrid / Sim League Pro.
--
-- Design notes:
--   * gen_random_uuid() requires the pgcrypto extension (enabled by default on
--     Supabase).
--   * Row Level Security is ON. Anonymous users may INSERT join submissions
--     (the public form) but may NOT read them. Standings are publicly readable.
--     Privileged reads/writes use the service-role key, which bypasses RLS.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enum: league
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'league') then
    create type league as enum ('GT7', 'LMU');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- Table: join_submissions
--   Backs POST /api/join. One row per "Join the League" application.
-- ----------------------------------------------------------------------------
create table if not exists public.join_submissions (
  id              uuid primary key default gen_random_uuid(),
  league          league       not null,
  driver_name     text         not null,
  platform        text         not null,
  psn             text,
  gamertag        text,
  email           text         not null,
  discord         text         not null,
  car_class       text         not null,
  experience      text         not null,
  input_method    text         not null,
  eligibility_ack boolean      not null default false,
  message         text,
  status          text         not null default 'new',   -- new | reviewed | accepted | declined
  created_at      timestamptz  not null default now()
);

comment on table public.join_submissions is 'League join applications submitted via /api/join.';

create index if not exists join_submissions_created_at_idx
  on public.join_submissions (created_at desc);
create index if not exists join_submissions_league_idx
  on public.join_submissions (league);

alter table public.join_submissions enable row level security;

-- Anyone (anon) may submit an application...
drop policy if exists "Anon can insert join submissions" on public.join_submissions;
create policy "Anon can insert join submissions"
  on public.join_submissions
  for insert
  to anon
  with check (true);

-- ...but nobody reads them via the public API. Reads happen with the
-- service-role key (bypasses RLS) or from the Supabase dashboard. No SELECT
-- policy is granted to anon/authenticated on purpose.

-- ----------------------------------------------------------------------------
-- Table: race_standings
--   Optional manual/cached standings, mirroring legacy wp_race_standings with
--   an added `league` discriminator. Used when a season isn't served live.
-- ----------------------------------------------------------------------------
create table if not exists public.race_standings (
  id           uuid primary key default gen_random_uuid(),
  league       league       not null,
  season       int          not null default 3,
  position     int          not null default 0,
  driver_name  text         not null,
  team_name    text,
  team_color   text         not null default '#ffffff',
  points       int          not null default 0,
  wins         int          not null default 0,
  podiums      int          not null default 0,
  avg_quali    numeric(4,1) not null default 0,
  avg_finish   numeric(4,1) not null default 0,
  penalties    int          not null default 0,
  class        text         not null default 'Gr.3',
  updated_at   timestamptz  not null default now()
);

comment on table public.race_standings is 'Optional manual/cached championship standings per league & season.';

create index if not exists race_standings_league_season_idx
  on public.race_standings (league, season, position);

alter table public.race_standings enable row level security;

-- Standings are public read-only.
drop policy if exists "Public can read standings" on public.race_standings;
create policy "Public can read standings"
  on public.race_standings
  for select
  to anon, authenticated
  using (true);

-- Writes are performed with the service-role key only (no anon write policy).

-- ----------------------------------------------------------------------------
-- Table: replays_cache
--   Best-effort cache of the YouTube replays feed, so the replays page stays
--   fast and keeps working if the YouTube API is briefly unavailable or rate
--   limited. Written by lib/api/youtube.ts (service-role), read publicly.
-- ----------------------------------------------------------------------------
create table if not exists public.replays_cache (
  video_id     text primary key,
  title        text        not null,
  description  text,
  thumbnail    text,
  published_at timestamptz,
  url          text,
  view_count   int,
  duration     text,
  league       league,                       -- nullable; best-effort classification
  series       text,
  cached_at    timestamptz not null default now()
);

comment on table public.replays_cache is 'Cache of the YouTube replays feed, refreshed by the data layer.';

create index if not exists replays_cache_published_at_idx
  on public.replays_cache (published_at desc);

alter table public.replays_cache enable row level security;

drop policy if exists "Public can read replays cache" on public.replays_cache;
create policy "Public can read replays cache"
  on public.replays_cache
  for select
  to anon, authenticated
  using (true);

-- Cache writes/upserts use the service-role key only (no anon write policy).
