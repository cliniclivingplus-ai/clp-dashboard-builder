-- Adds a Clinic ID to mrx.patients, mirroring blood.patients' clinic_id
-- (migration_v31). Unlike blood, MicrobiomeRX already has real production
-- data (203 reports, doctor-generated prescriptions) — nothing is deleted
-- here. The column is nullable: existing patients/reports predate this
-- field and have none, and mrx.reports.patient_id is null on every
-- existing row anyway (reports only ever carried a free-text patient
-- name). Going forward, MicrobiomeRX's upload flow will collect a Clinic
-- ID, find-or-create the matching mrx.patients row by it, and set
-- reports.patient_id correctly — this column is what makes that possible,
-- and what lets CLP Compass auto-link a patient by matching
-- patients.clinic_patient_id against this column instead of requiring a
-- manual name search every time.
alter table mrx.patients add column if not exists clinic_id text;
create unique index if not exists mrx_patients_clinic_id_unique on mrx.patients (clinic_id) where clinic_id is not null;

-- reports.patient_id is null on every existing row (reports only ever
-- carried a free-text patient name) — add a matching nullable clinic_id
-- here too so the upload flow can set it directly on the report at
-- upload time without requiring the patients-row lookup to succeed first.
alter table mrx.reports add column if not exists clinic_id text;
