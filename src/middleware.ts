import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Gates every CDB *page* behind a real login — except the truly public,
// no-login patient-facing pages (dashboard/checklist links a coach shares
// directly with a patient) and the API layer (hardening /api/* itself is
// explicitly out of scope for this pass — see the plan). Refreshes the
// Supabase session cookie on every matched request, same standard pattern
// Supabase's own Next.js App Router guide uses.
const PUBLIC_PATHS = [/^\/login/, /^\/dashboard\//, /^\/checklist\//, /^\/api\//, /^\/_next\//, /^\/favicon\.ico$/]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((re) => re.test(path))

  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
