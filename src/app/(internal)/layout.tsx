import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/auth/server'
import SignOutButton from '@/components/SignOutButton'

// The CDB platform header — logo + who's signed in + sign out. Only ever
// rendered once middleware has already confirmed a real session exists
// (this whole group is gated), so there's no "logged out" state to handle
// here. Deliberately minimal: no Compass-specific nav here anymore — that
// lives one level deeper, in (compass)/layout.tsx, so it only shows up
// once you're actually inside CLP Compass.
export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <header
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(8px)',
          borderBottom: '1px solid #ECEBE3',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #538A22, #6DAA33)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              boxShadow: '0 2px 6px rgba(83,138,34,0.28)',
            }}
          >
            🧭
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1A2417', letterSpacing: '-0.01em' }}>CLP Dashboard Builder <span style={{ fontWeight: 500, opacity: 0.6 }}>(CDB)</span></div>
            <div style={{ fontSize: 11.5, color: '#8A9284' }}>Clinic Living Plus · Bangalore</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user?.email && <span style={{ fontSize: 12.5, color: '#8A9284' }}>{user.email}</span>}
          <SignOutButton />
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 60px)', padding: '32px 24px 64px' }}>{children}</main>
    </>
  )
}
