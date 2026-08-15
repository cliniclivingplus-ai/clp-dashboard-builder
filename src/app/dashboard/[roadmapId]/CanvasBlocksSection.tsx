'use client'

// Read-only rendering of a roadmap's "Custom blocks" section (editing
// happens in DashboardClient.tsx) — shared by every patient-facing
// template so custom blocks show up regardless of which one is selected.
// Renders nothing when there are none, so roadmaps that never used this
// feature are completely unaffected.
import { BlockRenderer, computeCanvasHeight, type RecipeLookup, type ImageLookup } from '@/lib/blocks/BlockRenderer'
import { ScaledCanvasView } from '@/lib/blocks/ScaledCanvasView'
import type { ChecklistPageBlock } from '@/lib/blocks/types'

export function CanvasBlocksSection({ blocks, recipesById, imagesById }: {
  blocks: ChecklistPageBlock[]
  recipesById: Record<string, RecipeLookup>
  imagesById: Record<string, ImageLookup>
}) {
  if (!blocks || blocks.length === 0) return null
  return (
    <div style={{ padding: '8px 0 32px' }}>
      <ScaledCanvasView canvasHeight={computeCanvasHeight(blocks)}>
        <BlockRenderer blocks={blocks} recipesById={recipesById} imagesById={imagesById} layoutMode="canvas" />
      </ScaledCanvasView>
    </div>
  )
}
