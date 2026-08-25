-- SCOPE-058: add the "vetted" state to the facilitator onboarding lifecycle.
--
-- The prior constraint (20260619060000_facilitators_published.sql) allowed
-- new/reviewed/published/rejected. The vetting workflow introduces an explicit
-- "vetted" state between pending (new) and published; "reviewed" is retained as
-- a legacy alias that the admin UI and publish gate treat as vetted.
--
-- Kept as a separate migration from 20260620090000 (the vetting columns) so the
-- constraint swap re-applies cleanly on the already-migrated remote database.

alter table public.facilitator_onboarding_responses
  drop constraint if exists facilitator_onboarding_responses_status_check;
alter table public.facilitator_onboarding_responses
  add constraint facilitator_onboarding_responses_status_check
    check (status in ('new', 'reviewed', 'vetted', 'published', 'rejected'));
