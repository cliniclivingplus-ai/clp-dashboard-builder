import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Access is restricted to real Clinic Living Plus staff — the only domain
// allowed to ever get an account created here. Enforced server-side (not
// just a client-side hint) since this is the one place an account can be
// created at all; there's no other signup path.
const ALLOWED_EMAIL_DOMAIN = 'cliniclivingplus.com'
const MIN_PASSWORD_LENGTH = 8

// First-time account setup — a coach's only path to getting an account,
// since there's no public signup and no admin invite flow. They give
// their @cliniclivingplus.com email and pick their own password (the
// client confirms it twice before ever sending it here). If that email
// already has an account, this never overwrites its password — that
// would be a account-takeover vector for anyone who just knows a
// coworker's email address; existing accounts can only change their
// password via the "forgot password" email-reset flow instead.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    return NextResponse.json({ error: `Only @${ALLOWED_EMAIL_DOMAIN} email addresses can sign up.` }, { status: 400 })
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 })
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) {
    // Supabase's own "already registered" error — surface a clear next step
    // rather than a raw error, without confirming/denying account existence
    // any more precisely than that.
    if (error.message?.toLowerCase().includes('already') || error.status === 422 || error.status === 400) {
      return NextResponse.json({ error: 'An account already exists for this email. Sign in instead, or use "Forgot password" to reset it.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
