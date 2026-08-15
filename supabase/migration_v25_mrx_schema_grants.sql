-- v25: grant the Postgres roles Supabase/PostgREST use access to the new
-- `mrx` schema. Creating a schema doesn't auto-grant like `public` does
-- (that grant happens once, at project creation) — without this, every
-- query against `mrx` fails with "permission denied for schema mrx" even
-- with the service role key, and even after `mrx` is added to Exposed
-- schemas in the dashboard.

grant usage on schema mrx to postgres, anon, authenticated, service_role;

grant all on all tables in schema mrx to postgres, service_role;
grant select on all tables in schema mrx to anon, authenticated;

grant all on all sequences in schema mrx to postgres, service_role;
grant usage on all sequences in schema mrx to anon, authenticated;

-- So any future table added to `mrx` gets the same grants automatically.
alter default privileges in schema mrx grant all on tables to postgres, service_role;
alter default privileges in schema mrx grant select on tables to anon, authenticated;
alter default privileges in schema mrx grant all on sequences to postgres, service_role;
alter default privileges in schema mrx grant usage on sequences to anon, authenticated;
