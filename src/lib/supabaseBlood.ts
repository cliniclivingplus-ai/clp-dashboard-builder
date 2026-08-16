import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Scoped to the `blood` schema (Blood Panel Analyzer's own tables —
// patients, reports, marker_guidance, unprefixed there). Deliberately a
// separate client from the default `public`-scoped supabaseAdmin, and from
// supabaseMrx: `public` has its own real `patients`/`reports` tables (CLP
// Compass's own data), so a single client can't safely serve all three.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseBlood: SupabaseClient<any, any, any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseBlood(): SupabaseClient<any, any, any> {
  if (!_supabaseBlood) {
    _supabaseBlood = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      { db: { schema: 'blood' } }
    )
  }
  return _supabaseBlood
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseBlood = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabaseBlood() as unknown as Record<string | symbol, unknown>)[prop],
})
