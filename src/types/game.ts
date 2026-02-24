import type { ComponentType } from 'react'

export interface GameEntry {
  /** Unique kebab-case identifier, e.g. "food-card" */
  id: string
  /** Display name shown on the card */
  title: string
  /** One-sentence description shown on the card */
  description: string
  /** Broad category, e.g. "Randomiser", "Puzzle", "Strategy" */
  category: string
  /** Descriptive tags, e.g. ["casual", "food", "3D"] */
  tags: string[]
  /** Optional gameplay stat flags shown as badges */
  stats: {
    multiplayer?: boolean
    ai?: boolean
    prototype?: boolean
  }
  /** Path relative to public root, e.g. "thumbnails/food-card.png". Falls back to letter placeholder. */
  thumbnail?: string
  /**
   * React SVG component rendered as the card thumbnail.
   * Takes priority over `thumbnail`. Update the component to auto-refresh the hub card.
   */
  thumbnailComponent?: ComponentType
  /** URL opened in a new tab when the card is clicked. Use "games/<file>.html" for local games. */
  url: string
}
