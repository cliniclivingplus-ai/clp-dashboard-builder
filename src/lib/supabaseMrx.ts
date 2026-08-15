import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Scoped to the `mrx` schema (MicrobiomeRX's migrated tables — patients,
// reports, etc., unprefixed there). Deliberately a separate client from the
// default `public`-scoped supabaseAdmin: `public` has its own real
// `patients`/`reports` tables (CLP Compass's own data), so a single client
// can't safely serve both.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseMrx: SupabaseClient<any, any, any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseMrx(): SupabaseClient<any, any, any> {
  if (!_supabaseMrx) {
    _supabaseMrx = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      { db: { schema: 'mrx' } }
    )
  }
  return _supabaseMrx
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseMrx = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabaseMrx() as unknown as Record<string | symbol, unknown>)[prop],
})
