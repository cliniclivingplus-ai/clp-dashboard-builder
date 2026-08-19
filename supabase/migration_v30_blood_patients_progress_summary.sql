-- v30: cache column for a patient's cross-report progress summary
-- (blood.patients), same caching pattern as blood.reports.recommendations.

alter table blood.patients add column if not exists progress_summary text;
