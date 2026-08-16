-- v26: schema for the new standalone "Blood Panel Analyzer" tool, mirroring
-- how MicrobiomeRX's own tables live in their own `mrx` schema in this same
-- shared Supabase project (see migration_v22/v24). Blood Panel Analyzer's
-- own app queries these unprefixed (`patients`, `reports`, ...) via a
-- client scoped to `db: { schema: 'blood' }` — same pattern as MicrobiomeRX.
--
-- After running this, go to:
--   Supabase Dashboard -> Project Settings -> API -> Data API Settings
--   -> "Exposed schemas" -> add `blood` (only `public` is exposed by default).
-- Without that step, PostgREST/the Supabase client can't see anything in
-- the new schema even though the SQL below succeeds.

create schema if not exists blood;

create table if not exists blood.patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid,
  name text not null,
  age_sex text,
  notes text,
  created_at timestamptz default now()
);

-- A blood report's marker vocabulary is unbounded (any lab, any panel), so
-- unlike MicrobiomeRX's fixed BugSpeaks species/pathogen lists, the full
-- extracted result set lives as one jsonb array here rather than as
-- separate normalized rows per marker type.
create table if not exists blood.reports (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid,
  patient_id uuid references blood.patients(id) on delete cascade,
  pdf_filename text,
  pdf_path text,                    -- storage path in the blood-reports bucket
  raw_text text,                    -- extracted text (PDF text layer or OCR)
  markers jsonb,                    -- [{test_name, result, unit, ref_range, flag, abnormal}]
  recommendations jsonb,            -- cached output of /api/recommendations
  rules_version text default 'v1.0.0',
  created_at timestamptz default now()
);

-- The curated, deterministic trigger table (equivalent of mrx.supplement_stack)
-- — an abnormal marker only ever gets a specific recommendation if it matches
-- a row here by name/synonym; anything unmatched falls back to a generic
-- "flag for clinical review" note rather than a fabricated one. Seeded with
-- the markers actually present across the coach's 5 sample reports; meant
-- to grow over time as more report types are seen.
create table if not exists blood.marker_guidance (
  id uuid primary key default gen_random_uuid(),
  marker_name text not null,
  synonyms text[] not null default '{}',   -- cross-lab name variants, e.g. Hb / HGB / Haemoglobin
  direction text not null check (direction in ('low', 'high')),
  condition_label text not null,
  explanation text not null,
  recommended_actions text not null,
  rationale_prompt_template text,
  created_at timestamptz default now()
);

alter table blood.patients enable row level security;
create policy "allow_all_blood_patients" on blood.patients for all using (true) with check (true);
alter table blood.reports enable row level security;
create policy "allow_all_blood_reports" on blood.reports for all using (true) with check (true);
alter table blood.marker_guidance enable row level security;
create policy "allow_all_blood_marker_guidance" on blood.marker_guidance for all using (true) with check (true);

-- Bridge table lives in `public` (CDB's own concern), same pattern as
-- mrx_patient_links: one CLP Compass patient links to at most one Blood
-- Panel Analyzer patient at a time.
create table if not exists public.blood_patient_links (
  id uuid primary key default gen_random_uuid(),
  clp_patient_id uuid not null references public.patients(id) on delete cascade,
  blood_patient_id uuid not null references blood.patients(id) on delete cascade,
  linked_at timestamptz default now(),
  linked_by text,
  unique (clp_patient_id, blood_patient_id)
);
alter table public.blood_patient_links enable row level security;
create policy "allow_all_blood_patient_links" on public.blood_patient_links for all using (true) with check (true);

-- Storage bucket for the original uploaded reports, mirrors mrx-reports.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blood-reports',
  'blood-reports',
  false,
  15728640,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
