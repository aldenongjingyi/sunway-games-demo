import { useState } from 'react'
import type { GameEntry } from '../types/game'

const STAT_CONFIG = {
  multiplayer: {
    label: 'Multiplayer',
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  ai: {
    label: 'AI',
    className:
      'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  prototype: {
    label: 'Prototype',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
} as const

type StatKey = keyof typeof STAT_CONFIG

export default function GameCard({ game }: { game: GameEntry }) {
  const [imgError, setImgError] = useState(false)

  const activeStats = (Object.keys(STAT_CONFIG) as StatKey[]).filter(
    k => game.stats[k]
  )

  const isPlaceholder = game.url === '#'

  // Resolve URL relative to Vite base (handles GitHub Pages sub-path)
  const resolvedUrl = isPlaceholder
    ? '#'
    : game.url.startsWith('http')
    ? game.url
    : `${import.meta.env.BASE_URL}${game.url}`

  const showThumbnail = game.thumbnail && !imgError

  return (
    <a
      href={resolvedUrl}
      target={isPlaceholder ? undefined : '_blank'}
      rel="noopener noreferrer"
      onClick={isPlaceholder ? e => e.preventDefault() : undefined}
      className={[
        'group flex flex-col rounded-card border overflow-hidden',
        'border-slate-200 dark:border-slate-800',
        'bg-white dark:bg-slate-900',
        'shadow-card',
        'transition-all duration-300 ease-apple',
        isPlaceholder
          ? 'opacity-60 cursor-default'
          : 'hover:shadow-card-hover hover:scale-[1.03] hover:-translate-y-0.5 cursor-pointer',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
        {game.thumbnailComponent ? (
          // SVG React component — auto-updates when the component changes
          <game.thumbnailComponent />
        ) : showThumbnail ? (
          <img
            src={`${import.meta.env.BASE_URL}${game.thumbnail}`}
            alt={game.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl font-bold text-slate-300 dark:text-slate-600 select-none">
            {game.title[0]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Title + category */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-white text-base leading-snug">
            {game.title}
          </h2>
          <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {game.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
          {game.description}
        </p>

        {/* Stats badges */}
        {activeStats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {activeStats.map(stat => (
              <span
                key={stat}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STAT_CONFIG[stat].className}`}
              >
                {STAT_CONFIG[stat].label}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
