-- ============================================================================
-- League Manager — reference data seed (applied 2026-07-08)
-- ----------------------------------------------------------------------------
-- Sims and global scheme presets (league_id NULL = preset every league can
-- pick). Idempotent: sims upsert on slug; presets insert-if-absent by name.
-- Capability flags and notes follow docs/league-manager/03-sim-integrations.md.
-- ============================================================================

insert into public.sims (slug, name, short_name, has_results_export, has_server_api, results_format_note)
values
  ('ac',     'Assetto Corsa',              'AC',     true,  false, 'Self-hosted dedicated server writes JSON results; see 03-sim-integrations.md §AC.'),
  ('acc',    'Assetto Corsa Competizione', 'ACC',    true,  false, 'Self-hosted dedicated server writes results JSON per session; see 03-sim-integrations.md §ACC.'),
  ('ac-evo', 'Assetto Corsa EVO',          'AC Evo', true,  false, 'Dedicated servers since v0.6 (Apr 2026); formats still stabilising.'),
  ('lmu',    'Le Mans Ultimate',           'LMU',    true,  false, 'No self-hosting — results XML downloaded from RaceControl hosted servers.'),
  ('f1-25',  'F1 25',                      'F1 25',  false, false, 'No dedicated servers; results via UDP capture agent (Phase 3).'),
  ('gt7',    'Gran Turismo 7',             'GT7',    false, false, 'Closed platform; manual results entry.')
on conflict (slug) do update
  set name = excluded.name,
      short_name = excluded.short_name,
      has_results_export = excluded.has_results_export,
      has_server_api = excluded.has_server_api,
      results_format_note = excluded.results_format_note;

-- Global points-scheme presets (index 0 of positions_points = P1).
insert into public.points_schemes
  (league_id, name, positions_points, pole_points, fastest_lap_points, fastest_lap_requires_top, dnf_scores, drop_rounds)
select null, v.name, v.positions_points::jsonb, v.pole_points, v.fl_points, v.fl_top, false, 0
from (values
  ('F1 Standard (25–1 + FL)', '[25,18,15,12,10,8,6,4,2,1]', 0, 1, 10),
  ('F1 Classic (10–1)',       '[10,8,6,5,4,3,2,1]',         0, 0, null::int),
  ('Linear Top 20',           '[20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]', 0, 0, null::int)
) as v(name, positions_points, pole_points, fl_points, fl_top)
where not exists (
  select 1 from public.points_schemes p
  where p.league_id is null and p.name = v.name
);

-- Global penalty-scheme preset: standard licence-points model.
insert into public.penalty_schemes (league_id, name, rules, ban_threshold_points, points_expire_after)
select null,
       'Standard Licence (12-point ban)',
       '[
          { "category": "Avoidable contact",                "penaltyPoints": 2, "timeSeconds": 5 },
          { "category": "Unsafe rejoin",                    "penaltyPoints": 2, "timeSeconds": 5 },
          { "category": "Track limits abuse",               "penaltyPoints": 1 },
          { "category": "Blocking / erratic defending",     "penaltyPoints": 1 },
          { "category": "Ignoring blue flags",              "penaltyPoints": 1 },
          { "category": "Dangerous driving (severe)",       "penaltyPoints": 4, "timeSeconds": 30 }
        ]'::jsonb,
       12,
       null
where not exists (
  select 1 from public.penalty_schemes p
  where p.league_id is null and p.name = 'Standard Licence (12-point ban)'
);
