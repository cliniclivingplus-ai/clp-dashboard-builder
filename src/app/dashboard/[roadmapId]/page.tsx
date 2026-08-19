import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { supabaseMrx } from '@/lib/supabaseMrx'
import { buildGuideData } from '@/lib/pdf/buildGuideData'
import { parsePrescriptionRow } from '@/lib/mrxPrescription'
import DashboardClient from './DashboardClient'
import AlmanacTemplate from './AlmanacTemplate'
import PulseTemplate from './PulseTemplate'
import OnyxTemplate from './OnyxTemplate'
import WeekTemplate from './WeekTemplate'
import VitalsTemplate from './VitalsTemplate'

export const revalidate = 0
export const dynamic = 'force-dynamic'

// Public, no-login page — same trust model as the PDF download link. A coach
// shares this URL directly with the patient (WhatsApp/email); the same link
// also works for the coach to review check-in history before a session.
export default async function PatientDashboardPage({ params }: { params: Promise<{ roadmapId: string }> }) {
  const { roadmapId } = await params

  const [{ data: roadmap, error }, { data: checkins }, { data: recipes }, { data: imageBank }] = await Promise.all([
    supabaseAdmin
      .from('roadmaps')
      .select('*, patients(full_name, gender, primary_concern, nutritionists(id, full_name, designation, bio, response_note, photo_url, email)), sessions(case_summary)')
      .eq('id', roadmapId)
      .single(),
    supabaseAdmin.from('roadmap_checkins').select('week_number, action_index, checkin_date').eq('roadmap_id', roadmapId),
    supabaseAdmin.from('recipe_bank').select('*'),
    supabaseAdmin.from('guide_images').select('id, label, tags, image_url'),
  ])

  if (error || !roadmap) notFound()

  // Only a coach-confirmed supplement list is ever shown to a patient — see
  // the review/confirm step in ReportsTab.tsx. Most recent one wins if a
  // patient has multiple confirmed reports with a supplement list.
  const { data: supplementReport } = await supabaseAdmin
    .from('patient_reports')
    .select('supplements')
    .eq('patient_id', roadmap.patient_id)
    .eq('supplements_confirmed', true)
    .not('supplements', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // A linked MicrobiomeRX patient's doctor-approved prescription (approved
  // via that app's own review/"Approve RX" step — same confirmed-only trust
  // model as the patient_reports source above) also belongs here, appended
  // after the patient_reports list rather than replacing it, since a
  // patient can have both a manually confirmed report and a linked gut-panel
  // prescription.
  const mrxSupplements: { name: string; dose: string; timing: string; duration: string; notes: string }[] = []
  try {
    const { data: mrxLink } = await supabaseAdmin
      .from('mrx_patient_links')
      .select('mrx_patient_id')
      .eq('clp_patient_id', roadmap.patient_id)
      .maybeSingle()
    if (mrxLink) {
      const { data: mrxPatient } = await supabaseMrx.from('patients').select('name').eq('id', mrxLink.mrx_patient_id).maybeSingle()
      if (mrxPatient) {
        const { data: mrxReports } = await supabaseMrx.from('reports').select('id').ilike('patient_name', mrxPatient.name)
        const reportIds = (mrxReports ?? []).map((r) => r.id)
        if (reportIds.length > 0) {
          const { data: rxRow } = await supabaseMrx
            .from('prescriptions')
            .select('approved_at, rx_data')
            .in('report_id', reportIds)
            .not('approved_at', 'is', null)
            .order('approved_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          const prescription = parsePrescriptionRow(rxRow)
          if (prescription) {
            for (const item of prescription.items) {
              // item.detail is free text from MicrobiomeRX's own review page,
              // usually "dose · timing · duration" but not guaranteed —
              // split what's there into the right columns, put everything
              // else in dose rather than dropping it.
              const parts = item.detail.split('·').map((p) => p.trim()).filter(Boolean)
              const [dose, timing, duration] = parts.length >= 3 ? parts : [item.detail, '', '']
              mrxSupplements.push({ name: item.name, dose, timing, duration, notes: item.doctorNote })
            }
          }
        }
      }
    }
  } catch { /* linking is optional — never block the dashboard on it */ }

  const guideData = buildGuideData(roadmap, imageBank ?? [], recipes ?? [], [...(supplementReport?.supplements ?? []), ...mrxSupplements])

  if (guideData.template === 'almanac') {
    return <AlmanacTemplate roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
  }
  if (guideData.template === 'pulse') {
    return <PulseTemplate roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
  }
  if (guideData.template === 'onyx') {
    return <OnyxTemplate roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
  }
  if (guideData.template === 'week') {
    return <WeekTemplate roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
  }
  if (guideData.template === 'vitals') {
    return <VitalsTemplate roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
  }
  return <DashboardClient roadmapId={roadmapId} data={guideData} initialCheckins={checkins ?? []} />
}
