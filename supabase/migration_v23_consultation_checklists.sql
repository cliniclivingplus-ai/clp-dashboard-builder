-- Single-consultation "checklist" pages — AI decides the layout/sections
-- from a coach's condition/goal text plus picked recipes/images, scoped to
-- the next consultation only (no duration/month structure, unlike
-- roadmaps). See src/app/api/checklists/route.ts.
--
-- Run this once, manually, in the Supabase SQL editor for this project —
-- same convention as every other migration in this repo.

create table if not exists consultation_checklists (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  title text,
  condition_goal text not null,
  recipe_ids uuid[] not null default '{}',
  image_ids uuid[] not null default '{}',
  blocks jsonb not null default '[]',
  checked_items jsonb not null default '{}',
  kb_sources jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultation_checklists_patient_id_idx on consultation_checklists(patient_id);
