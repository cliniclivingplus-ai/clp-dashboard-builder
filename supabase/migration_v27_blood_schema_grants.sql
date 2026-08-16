-- v27: grant the Postgres roles Supabase/PostgREST use access to the new
-- `blood` schema. Creating a schema doesn't auto-grant like `public` does
-- (that grant happens once, at project creation) — without this, every
-- query against `blood` fails with "permission denied for schema blood"
-- even with the service role key, and even after `blood` is added to
-- Exposed schemas in the dashboard. Mirrors migration_v25_mrx_schema_grants.sql.

grant usage on schema blood to postgres, anon, authenticated, service_role;

grant all on all tables in schema blood to postgres, service_role;
grant select on all tables in schema blood to anon, authenticated;

grant all on all sequences in schema blood to postgres, service_role;
grant usage on all sequences in schema blood to anon, authenticated;

-- So any future table added to `blood` gets the same grants automatically.
alter default privileges in schema blood grant all on tables to postgres, service_role;
alter default privileges in schema blood grant select on tables to anon, authenticated;
alter default privileges in schema blood grant all on sequences to postgres, service_role;
alter default privileges in schema blood grant usage on sequences to anon, authenticated;
