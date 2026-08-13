'use client'

// Renders an AI-generated (and coach-edited) consultation-checklist page —
// the block palette is fixed (see types.ts); this is the ONLY thing that
// ever turns block data into markup, so both the coach's editor and the
// patient's public page render identically from the same source.
import { CheckCircle2, Circle, ChefHat } from 'lucide-react'
import type { ChecklistPageBlock } from './types'
import { resolveBlockIcon } from './icons'
import { Card, PullQuote, PieChart, DEFAULT_ACCENT, DEFAULT_ACCENT_SOFT, DEFAULT_LINE } from './primitives'
import { renderMarkdownBold } from '@/lib/renderMarkdownBold'

type RecipeLookup = { id: string; name: string; image_url?: string | null; protein_label?: string | null }
type ImageLookup = { id: string; label: string; image_url: string }

export function BlockRenderer({
  blocks, recipesById, imagesById, checkedItems, onCheckItem, selectable, selectedBlockId, onSelectBlock,
}: {
  blocks: ChecklistPageBlock[]
  recipesById?: Record<string, RecipeLookup>
  imagesById?: Record<string, ImageLookup>
  checkedItems?: Record<string, boolean>
  onCheckItem?: (key: string, checked: boolean) => void
  selectable?: boolean
  selectedBlockId?: string | null
  onSelectBlock?: (id: string) => void
}) {
  return (
    <div>
      {blocks.map((block) => (
        <BlockCard key={block.id} block={block} selectable={selectable} selected={selectedBlockId === block.id} onClick={() => onSelectBlock?.(block.id)}>
          <BlockBody block={block} recipesById={recipesById ?? {}} imagesById={imagesById ?? {}} checkedItems={checkedItems ?? {}} onCheckItem={onCheckItem} />
        </BlockCard>
      ))}
    </div>
  )
}

function BlockCard({ block, selectable, selected, onClick, children }: { block: ChecklistPageBlock; selectable?: boolean; selected?: boolean; onClick?: () => void; children: React.ReactNode }) {
  if (block.type === 'hero') {
    return (
      <div onClick={selectable ? onClick : undefined} style={{
        textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: 16, borderRadius: 20,
        background: DEFAULT_ACCENT_SOFT, border: `1px solid ${selected ? DEFAULT_ACCENT : 'transparent'}`,
        cursor: selectable ? 'pointer' : 'default',
      }}>
        {children}
      </div>
    )
  }
  return (
    <Card onClick={selectable ? onClick : undefined} selected={selected}>
      {children}
    </Card>
  )
}

function BlockBody({ block, recipesById, imagesById, checkedItems, onCheckItem }: { block: ChecklistPageBlock; recipesById: Record<string, RecipeLookup>; imagesById: Record<string, ImageLookup>; checkedItems: Record<string, boolean>; onCheckItem?: (key: string, checked: boolean) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.1rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{block.title}</h1>
          {block.subtitle && <p style={{ fontSize: 14, color: '#4B5563', marginTop: 8 }}>{renderMarkdownBold(block.subtitle)}</p>}
        </>
      )

    case 'stat_row':
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: block.title ? 14 : 0 }}>
            {block.items.map((it, i) => {
              const Icon = resolveBlockIcon(it.icon)
              return (
                <div key={i} style={{ padding: 14, borderRadius: 12, background: DEFAULT_ACCENT_SOFT }}>
                  <Icon size={16} color={DEFAULT_ACCENT} />
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>{it.value}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{it.label}</div>
                </div>
              )
            })}
          </div>
        </>
      )

    case 'pull_quote':
      return block.attribution
        ? <PullQuote initials={block.attribution.charAt(0)} name={block.attribution} quote={block.text} quoteIsItalic />
        : <PullQuote showAvatar={false} quote={block.text} quoteIsItalic />

    case 'checklist':
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <ul style={{ listStyle: 'none', margin: block.title ? '14px 0 0' : 0, padding: 0 }}>
            {block.items.map((it, i) => {
              const key = `${block.id}:${i}`
              const checked = !!checkedItems[key]
              return (
                <li key={i} onClick={onCheckItem ? () => onCheckItem(key, !checked) : undefined}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, cursor: onCheckItem ? 'pointer' : 'default' }}>
                  {checked ? <CheckCircle2 size={17} color={DEFAULT_ACCENT} style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={17} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 14, color: checked ? '#6B7280' : '#111827', textDecoration: checked ? 'line-through' : 'none' }}>{renderMarkdownBold(it.text)}</span>
                </li>
              )
            })}
          </ul>
        </>
      )

    case 'icon_grid':
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: block.title ? 14 : 0 }}>
            {block.items.map((it, i) => {
              const Icon = resolveBlockIcon(it.icon)
              return (
                <div key={i} style={{ border: `1px solid ${DEFAULT_LINE}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: DEFAULT_ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={DEFAULT_ACCENT} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{it.topic}</div>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5, margin: 0 }}>{renderMarkdownBold(it.text)}</p>
                </div>
              )
            })}
          </div>
        </>
      )

    case 'recipe_gallery': {
      const recipes = block.recipe_ids.map((id) => recipesById[id]).filter((r): r is RecipeLookup => !!r)
      if (recipes.length === 0) return null
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: block.title ? 14 : 0 }}>
            {recipes.map((r) => (
              <div key={r.id} style={{ border: `1px solid ${DEFAULT_LINE}`, borderRadius: 12, overflow: 'hidden' }}>
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: 90, background: DEFAULT_ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={18} color={DEFAULT_ACCENT} /></div>
                )}
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.name}</div>
                  {r.protein_label && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{r.protein_label}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )
    }

    case 'image_gallery': {
      const images = block.image_ids.map((id) => imagesById[id]).filter((im): im is ImageLookup => !!im)
      if (images.length === 0) return null
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div style={{ display: 'grid', gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: block.title ? 14 : 0 }}>
            {images.map((im) => (
              <img key={im.id} src={im.image_url} alt={im.label} style={{ width: '100%', height: images.length === 1 ? 220 : 130, objectFit: 'cover', borderRadius: 12 }} />
            ))}
          </div>
        </>
      )
    }

    case 'chart':
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          {block.chartType === 'donut' ? (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginTop: block.title ? 14 : 0 }}>
              <PieChart data={block.data} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {block.data.map((d, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: '#374151' }}>{d.label}: <strong>{d.value}</strong></div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: block.title ? 14 : 0 }}>
              {(() => {
                const max = Math.max(...block.data.map((d) => d.value), 1)
                return block.data.map((d, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span>{d.label}</span><span style={{ fontWeight: 700 }}>{d.value}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: DEFAULT_ACCENT_SOFT }}>
                      <div style={{ height: 8, borderRadius: 4, background: DEFAULT_ACCENT, width: `${(d.value / max) * 100}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </>
      )

    case 'text_block':
      return (
        <>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: block.title ? '10px 0 0' : 0 }}>{renderMarkdownBold(block.text)}</p>
        </>
      )

    default:
      return null
  }
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#111827' }}>{children}</h2>
}
