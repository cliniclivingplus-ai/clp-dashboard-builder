import { createBrowserClient } from '@supabase/ssr'

// Cookie-based Supabase Auth client for client components (the login
// form's signInWithPassword / signOut calls) — session lives in cookies
// so both this and the server client (src/lib/auth/server.ts) see the
// same logged-in state.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
