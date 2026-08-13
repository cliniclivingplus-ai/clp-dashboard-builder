'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/auth/client'

const C = { green: '#538A22', ink: '#1A2417', muted: '#6b7280', line: '#ECEBE3', danger: '#B3261E' }
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 14, color: C.ink, boxSizing: 'border-box' as const, marginBottom: 16 }
const labelStyle = { display: 'block', fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }

// Landing page for the link a "forgot password" email sends. Supabase's
// browser client automatically picks up the recovery token from the URL
// on load and opens a temporary session just for setting a new password.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match — type it the same way twice.')
      return
    }
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('That reset link has expired or already been used — request a new one from the sign-in page.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F5', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '32px 28px', boxShadow: '0 2px 12px rgba(26,36,23,0.06)' }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: '0 0 6px' }}>Set a new password</h1>
        <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>Type it twice so we're sure it's right.</p>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>New password</label>
          <input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <label style={labelStyle}>Confirm new password</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />
          {error && <div style={{ background: '#FBEBE6', border: '1px solid #F3D6D6', borderRadius: 8, padding: '9px 12px', color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px 0', background: C.green, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  )
}
