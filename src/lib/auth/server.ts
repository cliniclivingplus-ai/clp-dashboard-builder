import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cookie-based Supabase Auth client for server components, route handlers,
// and middleware — separate from src/lib/supabase.ts's plain anon/admin
// clients (which have no session/cookie awareness and keep serving all the
// existing data-fetching code unchanged).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component that can't set cookies — fine,
            // middleware's own response-cookie handling covers session refresh.
          }
        },
      },
    }
  )
}
