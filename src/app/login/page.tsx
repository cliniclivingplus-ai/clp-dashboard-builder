'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/auth/client'

const C = { green: '#538A22', greenDeep: '#2F5214', ink: '#1A2417', muted: '#6b7280', line: '#ECEBE3', danger: '#B3261E', amberSoft: '#FFFBEB', amberLine: '#FDE68A', amberInk: '#92400E' }
const ALLOWED_DOMAIN = 'cliniclivingplus.com'

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 14, color: C.ink, boxSizing: 'border-box' as const, marginBottom: 16 }
const labelStyle = { display: 'block', fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }

type Mode = 'signin' | 'setup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.toLowerCase().trim().endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Only @${ALLOWED_DOMAIN} email addresses can sign up.`)
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match — type it the same way twice.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Could not create your account.')
        setLoading(false)
        return
      }
      // Account created and auto-confirmed — sign them straight in rather
      // than making them fill out the sign-in form a second time.
      const supabase = createSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        switchMode('signin')
        setNotice('Account created — sign in below.')
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Network error — try again.')
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.toLowerCase().trim().endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Only @${ALLOWED_DOMAIN} email addresses can have an account.`)
      return
    }
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset`,
    })
    setLoading(false)
    // Supabase deliberately doesn't reveal whether the email has an
    // account, to avoid leaking who's a real user — same neutral
    // message either way.
    setNotice('If an account exists for that email, a reset link is on its way.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F5', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '32px 28px', boxShadow: '0 2px 12px rgba(26,36,23,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #538A22, #6DAA33)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 6px rgba(83,138,34,0.28)' }}>🧭</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: C.ink }}>CLP Dashboard Builder <span style={{ fontWeight: 500, opacity: 0.6 }}>(CDB)</span></div>
            <div style={{ fontSize: 11.5, color: '#8A9284' }}>Clinic Living Plus · Bangalore</div>
          </div>
        </div>

        <div style={{ background: C.amberSoft, border: `1px solid ${C.amberLine}`, borderRadius: 9, padding: '9px 12px', fontSize: 12, color: C.amberInk, lineHeight: 1.5, marginBottom: 22 }}>
          Access is limited to Clinic Living Plus staff — only <strong>@{ALLOWED_DOMAIN}</strong> email addresses can sign in.
        </div>

        {mode === 'signin' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: '0 0 20px' }}>Sign in</h1>
            {notice && <div style={{ background: '#F2F9EC', border: '1px solid #C8E9A8', borderRadius: 8, padding: '9px 12px', color: C.greenDeep, fontSize: 13, marginBottom: 16 }}>{notice}</div>}
            <form onSubmit={handleSignIn}>
              <label style={labelStyle}>Email</label>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: C.green, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
              </div>
              {error && <div style={{ background: '#FBEBE6', border: '1px solid #F3D6D6', borderRadius: 8, padding: '9px 12px', color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '11px 0', background: C.green, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: C.muted }}>
              First time? <button type="button" onClick={() => switchMode('setup')} style={{ background: 'none', border: 'none', color: C.green, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12.5 }}>Set up your account</button>
            </div>
          </>
        )}

        {mode === 'setup' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: '0 0 6px' }}>Set up your account</h1>
            <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>Use your @{ALLOWED_DOMAIN} email and pick a password — type it twice so we're sure it's right.</p>
            <form onSubmit={handleSetup}>
              <label style={labelStyle}>Work email</label>
              <input type="email" required autoFocus placeholder={`you@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Confirm password</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />
              {error && <div style={{ background: '#FBEBE6', border: '1px solid #F3D6D6', borderRadius: 8, padding: '9px 12px', color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '11px 0', background: C.green, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: C.muted }}>
              Already have an account? <button type="button" onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', color: C.green, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12.5 }}>Sign in</button>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: '0 0 6px' }}>Reset your password</h1>
            <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>We'll email a reset link to your work address.</p>
            {notice ? (
              <div style={{ background: '#F2F9EC', border: '1px solid #C8E9A8', borderRadius: 8, padding: '10px 12px', color: C.greenDeep, fontSize: 13, marginBottom: 20 }}>{notice}</div>
            ) : (
              <form onSubmit={handleForgot}>
                <label style={labelStyle}>Work email</label>
                <input type="email" required autoFocus placeholder={`you@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />
                {error && <div style={{ background: '#FBEBE6', border: '1px solid #F3D6D6', borderRadius: 8, padding: '9px 12px', color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '11px 0', background: C.green, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: C.muted }}>
              <button type="button" onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', color: C.green, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12.5 }}>Back to sign in</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
