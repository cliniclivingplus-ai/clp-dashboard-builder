'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Link2, Check, Sparkles, X, Send } from 'lucide-react'
import { BlockRenderer } from '@/lib/blocks/BlockRenderer'
import type { ChecklistPageBlock } from '@/lib/blocks/types'

const C = {
  green: '#538A22', ink: '#1A2417', muted: '#6b7280', faint: '#8A9284', line: '#ECEBE3', card: '#FFFFFF',
  accent: '#2563EB', accentSoft: '#EFF4FF',
}

type Recipe = { id: string; name: string; image_url?: string | null; protein_label?: string | null }
type GuideImage = { id: string; label: string; image_url: string }
type Checklist = { id: string; patient_id: string; title: string | null; condition_goal: string; blocks: ChecklistPageBlock[]; recipe_ids: string[]; image_ids: string[]; status: string }

// The coach's editor for an AI-designed consultation checklist — the AI
// chose the layout at generation time; editing here happens through the
// floating command box only (select a block, describe the change), never
// direct free-text field editing, per the coach's own request for this
// feature.
export default function ChecklistEditorPage() {
  const params = useParams()
  const patientId = params.id as string
  const checklistId = params.checklistId as string

  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [recipesById, setRecipesById] = useState<Record<string, Recipe>>({})
  const [imagesById, setImagesById] = useState<Record<string, GuideImage>>({})
  const [loading, setLoading] = useState(true)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [instruction, setInstruction] = useState('')
  const [applying, setApplying] = useState(false)
  const [editError, setEditError] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/checklists/${checklistId}`)
      .then((r) => r.json())
      .then(async (j: Checklist & { error?: string }) => {
        if (!alive || j.error) return
        setChecklist(j)
        const [recipes, images] = await Promise.all([
          j.recipe_ids.length ? fetch('/api/recipe-bank').then((r) => r.json()).catch(() => []) : Promise.resolve([]),
          j.image_ids.length ? fetch('/api/guide-images').then((r) => r.json()).catch(() => []) : Promise.resolve([]),
        ])
        if (!alive) return
        setRecipesById(Object.fromEntries((Array.isArray(recipes) ? recipes : []).filter((r: Recipe) => j.recipe_ids.includes(r.id)).map((r: Recipe) => [r.id, r])))
        setImagesById(Object.fromEntries((Array.isArray(images) ? images : []).filter((im: GuideImage) => j.image_ids.includes(im.id)).map((im: GuideImage) => [im.id, im])))
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [checklistId])

  useEffect(() => {
    if (selectedBlockId) inputRef.current?.focus()
  }, [selectedBlockId])

  async function applyEdit() {
    if (!selectedBlockId || !instruction.trim()) return
    setApplying(true)
    setEditError('')
    try {
      const res = await fetch(`/api/checklists/${checklistId}/edit-block`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_id: selectedBlockId, instruction: instruction.trim() }),
      })
      const j = await res.json()
      if (!res.ok) { setEditError(j.error || 'Could not apply that edit.'); return }
      setChecklist((prev) => prev ? { ...prev, blocks: prev.blocks.map((b) => (b.id === selectedBlockId ? j.block : b)) } : prev)
      setInstruction('')
    } catch { setEditError('Network error, try again.') }
    finally { setApplying(false) }
  }

  function copyLink() {
    const url = `${window.location.origin}/checklist/${checklistId}`
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (loading) return <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 0' }}><Loader2 size={22} style={{ animation: 'clpSpin 1s linear infinite' }} /><style>{`@keyframes clpSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style></div>
  if (!checklist) return <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 0', color: C.muted }}>Checklist not found.</div>

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 120 }}>
      <Link href={`/patients/${patientId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.faint, textDecoration: 'none', marginBottom: 18, fontWeight: 500 }}>
        <ArrowLeft size={14} /> Back to patient
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }}>{checklist.title || 'Consultation checklist'}</h1>
          <p style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Click any section below, then describe the change you want in the box that appears.</p>
        </div>
        <button onClick={copyLink}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          {copied ? <><Check size={13} color={C.green} /> Copied</> : <><Link2 size={13} /> Copy patient link</>}
        </button>
      </div>

      <BlockRenderer
        blocks={checklist.blocks}
        recipesById={recipesById}
        imagesById={imagesById}
        selectable
        selectedBlockId={selectedBlockId}
        onSelectBlock={(id) => { setSelectedBlockId(id === selectedBlockId ? null : id); setEditError('') }}
      />

      {selectedBlockId && (
        <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', width: 'min(560px, calc(100vw - 32px))', background: C.card, border: `1px solid ${C.accent}`, borderRadius: 16, padding: '14px 16px', boxShadow: '0 12px 32px rgba(17,24,39,0.18)', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={14} color={C.accent} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>Editing selected section</span>
            <button onClick={() => { setSelectedBlockId(null); setInstruction(''); setEditError('') }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.faint }}><X size={15} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !applying) applyEdit() }}
              placeholder='e.g. "make this shorter" or "turn this into a bar chart"'
              style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: 'border-box' }}
            />
            <button onClick={applyEdit} disabled={applying || !instruction.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, borderRadius: 9, border: 'none', background: C.accent, color: '#fff', cursor: applying ? 'not-allowed' : 'pointer', opacity: applying || !instruction.trim() ? 0.6 : 1 }}>
              {applying ? <Loader2 size={15} style={{ animation: 'clpSpin 1s linear infinite' }} /> : <Send size={15} />}
            </button>
          </div>
          {editError && <p style={{ fontSize: 12, color: '#B3261E', marginTop: 8, marginBottom: 0 }}>{editError}</p>}
        </div>
      )}
      <style>{`@keyframes clpSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
