// The fixed block-type vocabulary for AI-generated consultation checklists
// (see src/app/api/checklists/route.ts and BlockRenderer.tsx). The AI never
// emits raw HTML/CSS — only data shaped like this, validated server-side
// against this exact list before it's ever stored or rendered.

export const BLOCK_TYPES = [
  'hero', 'stat_row', 'pull_quote', 'checklist', 'icon_grid',
  'recipe_gallery', 'image_gallery', 'chart', 'text_block',
] as const
export type BlockType = (typeof BLOCK_TYPES)[number]

// A small, fixed icon vocabulary — the AI references an icon by one of
// these string keys only, never arbitrary code. See icons.ts for the
// key -> lucide component mapping.
export const BLOCK_ICON_KEYS = [
  'moon', 'droplet', 'footprints', 'brain', 'utensils', 'smartphone', 'sun',
  'heart', 'star', 'target', 'flame', 'award', 'checkcircle', 'calendar', 'pill',
] as const
export type BlockIconKey = (typeof BLOCK_ICON_KEYS)[number]

export type HeroBlock = { id: string; type: 'hero'; title: string; subtitle?: string }
export type StatRowBlock = { id: string; type: 'stat_row'; title?: string; items: { label: string; value: string; icon?: BlockIconKey }[] }
export type PullQuoteBlock = { id: string; type: 'pull_quote'; text: string; attribution?: string }
export type ChecklistItem = { text: string }
export type ChecklistBlock = { id: string; type: 'checklist'; title?: string; items: ChecklistItem[] }
export type IconGridBlock = { id: string; type: 'icon_grid'; title?: string; items: { icon?: BlockIconKey; topic: string; text: string }[] }
export type RecipeGalleryBlock = { id: string; type: 'recipe_gallery'; title?: string; recipe_ids: string[] }
export type ImageGalleryBlock = { id: string; type: 'image_gallery'; title?: string; image_ids: string[] }
export type ChartBlock = { id: string; type: 'chart'; title?: string; chartType: 'bar' | 'donut'; data: { label: string; value: number }[] }
export type TextBlock = { id: string; type: 'text_block'; title?: string; text: string }

export type ChecklistPageBlock =
  | HeroBlock | StatRowBlock | PullQuoteBlock | ChecklistBlock | IconGridBlock
  | RecipeGalleryBlock | ImageGalleryBlock | ChartBlock | TextBlock

export type ConsultationChecklist = {
  id: string
  patient_id: string
  session_id: string | null
  title: string | null
  condition_goal: string
  recipe_ids: string[]
  image_ids: string[]
  blocks: ChecklistPageBlock[]
  checked_items: Record<string, boolean>
  kb_sources: { title: string; source_type: string }[]
  status: 'draft' | 'ready'
  created_at: string
  updated_at: string
}

// Strict runtime validation — every block the AI produces (at generation OR
// edit time) is checked against this before it's ever stored or rendered.
// An invalid block (unknown type, wrong shape, or a recipe/image id that
// wasn't actually in the coach's own picked set) is dropped rather than
// trusted — never crashes the page, never silently shows something the
// coach didn't actually provide.
export function validateBlock(raw: unknown, allowedRecipeIds: Set<string>, allowedImageIds: Set<string>): ChecklistPageBlock | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const id = typeof b.id === 'string' && b.id ? b.id : `blk_${Math.random().toString(36).slice(2, 10)}`
  const type = b.type
  if (typeof type !== 'string' || !(BLOCK_TYPES as readonly string[]).includes(type)) return null

  const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
  const strOpt = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  const iconOpt = (v: unknown): BlockIconKey | undefined => (typeof v === 'string' && (BLOCK_ICON_KEYS as readonly string[]).includes(v) ? (v as BlockIconKey) : undefined)

  switch (type as BlockType) {
    case 'hero': {
      const title = str(b.title)
      if (!title) return null
      return { id, type: 'hero', title, subtitle: strOpt(b.subtitle) }
    }
    case 'stat_row': {
      const items = Array.isArray(b.items) ? b.items : []
      const clean = items.map((it) => {
        const o = it as Record<string, unknown>
        const label = str(o.label)
        const value = str(o.value)
        if (!label || !value) return null
        return { label, value, icon: iconOpt(o.icon) }
      }).filter((x) => x !== null)
      if (clean.length === 0) return null
      return { id, type: 'stat_row', title: strOpt(b.title), items: clean }
    }
    case 'pull_quote': {
      const text = str(b.text)
      if (!text) return null
      return { id, type: 'pull_quote', text, attribution: strOpt(b.attribution) }
    }
    case 'checklist': {
      const items = Array.isArray(b.items) ? b.items : []
      const clean = items.map((it) => {
        const o = it as Record<string, unknown>
        const text = str(o.text)
        return text ? { text } : null
      }).filter((x): x is ChecklistItem => !!x)
      if (clean.length === 0) return null
      return { id, type: 'checklist', title: strOpt(b.title), items: clean }
    }
    case 'icon_grid': {
      const items = Array.isArray(b.items) ? b.items : []
      const clean = items.map((it) => {
        const o = it as Record<string, unknown>
        const topic = str(o.topic)
        const text = str(o.text)
        if (!topic || !text) return null
        return { topic, text, icon: iconOpt(o.icon) }
      }).filter((x) => x !== null)
      if (clean.length === 0) return null
      return { id, type: 'icon_grid', title: strOpt(b.title), items: clean }
    }
    case 'recipe_gallery': {
      const ids = Array.isArray(b.recipe_ids) ? b.recipe_ids.filter((x): x is string => typeof x === 'string' && allowedRecipeIds.has(x)) : []
      if (ids.length === 0) return null
      return { id, type: 'recipe_gallery', title: strOpt(b.title), recipe_ids: ids }
    }
    case 'image_gallery': {
      const ids = Array.isArray(b.image_ids) ? b.image_ids.filter((x): x is string => typeof x === 'string' && allowedImageIds.has(x)) : []
      if (ids.length === 0) return null
      return { id, type: 'image_gallery', title: strOpt(b.title), image_ids: ids }
    }
    case 'chart': {
      const chartType = b.chartType === 'donut' ? 'donut' : b.chartType === 'bar' ? 'bar' : null
      const data = Array.isArray(b.data) ? b.data : []
      const clean = data.map((d) => {
        const o = d as Record<string, unknown>
        const label = str(o.label)
        const value = typeof o.value === 'number' && isFinite(o.value) ? o.value : null
        if (!label || value == null) return null
        return { label, value }
      }).filter((x): x is { label: string; value: number } => !!x)
      if (!chartType || clean.length === 0) return null
      return { id, type: 'chart', title: strOpt(b.title), chartType, data: clean }
    }
    case 'text_block': {
      const text = str(b.text)
      if (!text) return null
      return { id, type: 'text_block', title: strOpt(b.title), text }
    }
    default:
      return null
  }
}
