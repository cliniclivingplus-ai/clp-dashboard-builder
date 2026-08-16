import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { supabaseBlood } from '@/lib/supabaseBlood'

// A CLP Compass patient links to at most one Blood Panel Analyzer patient
// record — that app already handles multiple reports per patient over time
// under the same patients row, so there's no need for more than one link
// here. blood_patient_links lives in `public` (CDB's own bridge table); the
// Blood Panel Analyzer patient/report data it points to lives in the
// `blood` schema, a separate client — so linked patient details are
// fetched as a second query rather than a PostgREST embed, since
// `patients` exists (as a different, unrelated table) in `public` too and
// an embed hint can't safely disambiguate across schemas. Exact mirror of
// mrx-link/route.ts.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: link, error } = await supabaseAdmin
    .from('blood_patient_links')
    .select('id, blood_patient_id, linked_at')
    .eq('clp_patient_id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!link) return NextResponse.json({ linked: null })

  const { data: patient } = await supabaseBlood
    .from('patients')
    .select('id, name, age_sex, notes')
    .eq('id', link.blood_patient_id)
    .maybeSingle()
  const { count } = await supabaseBlood
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', link.blood_patient_id)

  return NextResponse.json({ linked: { linkId: link.id, linkedAt: link.linked_at, patient, reportCount: count ?? 0 } })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const bloodPatientId = body.blood_patient_id
  if (typeof bloodPatientId !== 'string' || !bloodPatientId) return NextResponse.json({ error: 'blood_patient_id is required' }, { status: 400 })

  // Replace-style: a patient links to one Blood Panel Analyzer record at a
  // time, so clear any existing link for this patient before setting the new one.
  await supabaseAdmin.from('blood_patient_links').delete().eq('clp_patient_id', id)
  const { data, error } = await supabaseAdmin
    .from('blood_patient_links')
    .insert({ clp_patient_id: id, blood_patient_id: bloodPatientId })
    .select('id, blood_patient_id, linked_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: patient } = await supabaseBlood
    .from('patients')
    .select('id, name, age_sex, notes')
    .eq('id', bloodPatientId)
    .maybeSingle()
  const { count } = await supabaseBlood
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', bloodPatientId)

  return NextResponse.json({ linked: { linkId: data.id, linkedAt: data.linked_at, patient, reportCount: count ?? 0 } })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('blood_patient_links').delete().eq('clp_patient_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unlinked: true })
}
