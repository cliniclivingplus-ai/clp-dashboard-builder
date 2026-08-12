import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'

// A CLP Compass patient links to at most one MicrobiomeRX patient record —
// MicrobiomeRX already handles multiple gut reports per patient over time
// under the same mrx_patients row, so there's no need for more than one
// link here. GET reports the current link (if any) plus a report count so
// a coach can tell at a glance there's real data behind it.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: link, error } = await supabaseAdmin
    .from('mrx_patient_links')
    .select('id, mrx_patient_id, linked_at, mrx_patients(id, name, age_sex, complaint, diet_type)')
    .eq('clp_patient_id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!link) return NextResponse.json({ linked: null })

  const { count } = await supabaseAdmin
    .from('mrx_reports')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', link.mrx_patient_id)

  return NextResponse.json({ linked: { linkId: link.id, linkedAt: link.linked_at, patient: link.mrx_patients, reportCount: count ?? 0 } })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const mrxPatientId = body.mrx_patient_id
  if (typeof mrxPatientId !== 'string' || !mrxPatientId) return NextResponse.json({ error: 'mrx_patient_id is required' }, { status: 400 })

  // Replace-style: a patient links to one MicrobiomeRX record at a time,
  // so clear any existing link for this patient before setting the new one.
  await supabaseAdmin.from('mrx_patient_links').delete().eq('clp_patient_id', id)
  const { data, error } = await supabaseAdmin
    .from('mrx_patient_links')
    .insert({ clp_patient_id: id, mrx_patient_id: mrxPatientId })
    .select('id, mrx_patient_id, linked_at, mrx_patients(id, name, age_sex, complaint, diet_type)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await supabaseAdmin
    .from('mrx_reports')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', mrxPatientId)

  return NextResponse.json({ linked: { linkId: data.id, linkedAt: data.linked_at, patient: data.mrx_patients, reportCount: count ?? 0 } })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('mrx_patient_links').delete().eq('clp_patient_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unlinked: true })
}
