-- v31: require a real, clinic-assigned unique Clinic ID on every blood
-- patient, so two patients who happen to share a name can never have
-- their reports mismatched (upload now targets an explicit patient_id,
-- never a typed/matched name — see app/api/parse-report/route.ts).
--
-- Deletes the existing test-only patients first (coach confirmed these
-- are throwaway test data from building this feature, not real patients)
-- since they have no clinic_id and the column is now required + unique.
-- Their reports cascade-delete via the existing patient_id FK.

delete from blood.patients;

alter table blood.patients add column if not exists clinic_id text;
alter table blood.patients alter column clinic_id set not null;
alter table blood.patients add constraint blood_patients_clinic_id_unique unique (clinic_id);
