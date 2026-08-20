-- Archives a roadmap's content every time it's refreshed (a coach re-runs
-- Interpret against the same shareable link after a later session), so the
-- previous version isn't lost the moment new content overwrites it. The
-- live roadmap row and its link/id never change on a refresh — this table
-- only ever grows, one row per past version, coach-side only (never
-- rendered on the public patient dashboard link).
create table if not exists roadmap_versions (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references roadmaps(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  overview text,
  lifestyle_guidelines text,
  nutritionist_guidelines text,
  weekly_schedule jsonb,
  kb_sources jsonb,
  duration_months numeric,
  guide_overrides jsonb,
  archived_at timestamptz not null default now()
);

create index if not exists roadmap_versions_roadmap_id_idx on roadmap_versions (roadmap_id, archived_at desc);
