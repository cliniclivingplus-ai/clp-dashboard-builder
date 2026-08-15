-- v24: move MicrobiomeRX's migrated tables out of `public` into their own
-- `mrx` schema, unprefixed, so MicrobiomeRX's app code (which queries bare
-- names like `patients`, `reports`) can be pointed at this project without
-- colliding with CLP Compass's own same-named tables in `public`.
--
-- mrx_patient_links stays in `public` — it's CDB's own bridge table (used by
-- the patient-linking tab), not MicrobiomeRX's. Its FK to mrx.patients
-- remains valid across the schema boundary; nothing to do for it here.
--
-- After running this, go to:
--   Supabase Dashboard -> Project Settings -> API -> Data API Settings
--   -> "Exposed schemas" -> add `mrx` (only `public` is exposed by default).
-- Without that step, PostgREST/the Supabase client can't see anything in
-- the new schema even though the SQL below succeeds.

create schema if not exists mrx;

alter table public.mrx_doctors set schema mrx;
alter table mrx.mrx_doctors rename to doctors;

alter table public.mrx_aic_product_categories set schema mrx;
alter table mrx.mrx_aic_product_categories rename to aic_product_categories;

alter table public.mrx_aic_peptides set schema mrx;
alter table mrx.mrx_aic_peptides rename to aic_peptides;

alter table public.mrx_species_profiles set schema mrx;
alter table mrx.mrx_species_profiles rename to species_profiles;

alter table public.mrx_contraindications set schema mrx;
alter table mrx.mrx_contraindications rename to contraindications;

alter table public.mrx_marker_dictionary set schema mrx;
alter table mrx.mrx_marker_dictionary rename to marker_dictionary;

alter table public.mrx_reference_ranges set schema mrx;
alter table mrx.mrx_reference_ranges rename to reference_ranges;

alter table public.mrx_rules_versions set schema mrx;
alter table mrx.mrx_rules_versions rename to rules_versions;

alter table public.mrx_probiotic_matrix set schema mrx;
alter table mrx.mrx_probiotic_matrix rename to probiotic_matrix;

alter table public.mrx_dietary_protocols set schema mrx;
alter table mrx.mrx_dietary_protocols rename to dietary_protocols;

alter table public.mrx_therapy_protocols set schema mrx;
alter table mrx.mrx_therapy_protocols rename to therapy_protocols;

alter table public.mrx_marker_protocol_map set schema mrx;
alter table mrx.mrx_marker_protocol_map rename to marker_protocol_map;

alter table public.mrx_supplement_stack set schema mrx;
alter table mrx.mrx_supplement_stack rename to supplement_stack;

alter table public.mrx_knowledge_chunks set schema mrx;
alter table mrx.mrx_knowledge_chunks rename to knowledge_chunks;

alter table public.mrx_aic_products set schema mrx;
alter table mrx.mrx_aic_products rename to aic_products;

alter table public.mrx_aic_ingredients_full set schema mrx;
alter table mrx.mrx_aic_ingredients_full rename to aic_ingredients_full;

alter table public.mrx_aic_product_ingredients set schema mrx;
alter table mrx.mrx_aic_product_ingredients rename to aic_product_ingredients;

alter table public.mrx_aic_supplement_protocols set schema mrx;
alter table mrx.mrx_aic_supplement_protocols rename to aic_supplement_protocols;

alter table public.mrx_aic_protocol_steps set schema mrx;
alter table mrx.mrx_aic_protocol_steps rename to aic_protocol_steps;

alter table public.mrx_aic_protocol_steps_full set schema mrx;
alter table mrx.mrx_aic_protocol_steps_full rename to aic_protocol_steps_full;

alter table public.mrx_patients set schema mrx;
alter table mrx.mrx_patients rename to patients;

alter table public.mrx_reports set schema mrx;
alter table mrx.mrx_reports rename to reports;

alter table public.mrx_report_summaries set schema mrx;
alter table mrx.mrx_report_summaries rename to report_summaries;

alter table public.mrx_prescriptions set schema mrx;
alter table mrx.mrx_prescriptions rename to prescriptions;

alter table public.mrx_doctor_feedback set schema mrx;
alter table mrx.mrx_doctor_feedback rename to doctor_feedback;

-- mrx_patient_links intentionally left in public, unrenamed.
