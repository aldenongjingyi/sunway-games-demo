/**
 * MakanBox thumbnail — SVG illustration derived directly from the game's visual design.
 *
 * ─── Color tokens ────────────────────────────────────────────────────────────
 * Update these constants if the MakanBox game changes its colours or design,
 * and the thumbnail will update automatically on next build.
 */
const C = {
  // Shared background — matches makanbox.html body gradient exactly
  bgInner:     '#1e6b32',
  bgMid:       '#14492a',
  bgOuter:     '#0d2e1a',
  // Playing card back — matches .card-back background-color
  cardBack:    '#b71c1c',
  // Playing card front — matches .card-front background
  cardFront:   '#ffffff',
  // Card logo fallback circle — matches .card-logo-fallback gradient
  logoFrom:    '#e74c3c',
  logoDark:    '#c0392b',
  // Card back inner-border — matches .card-back::before border colour
  backBorder:  'rgba(255,255,255,0.5)',
  // Card back crosshatch — matches .card-back::before background-image opacity
  crosshatch:  'rgba(255,255,255,0.09)',
  // Card back "?" overlay — matches .card-back::after colour
  questionMk:  'rgba(255,255,255,0.22)',
} as const

// Fan pivot — below the viewport so cards arc naturally upward
const PIVOT = { x: 160, y: 255 }

// Base card dimensions and position (at rotation 0)
const CARD = { w: 52, h: 73, x: 134, y: 52, rx: 5 }

// Angles for 5 cards (left → right); last one is face-up
const ANGLES = [-24, -12, 0, 12, 24] as const

export default function MakanBoxThumbnail() {
  return (
    <svg
      viewBox="0 0 320 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        {/* ── Backgrounds ── */}
        <radialGradient id="mb-bg" cx="50%" cy="55%" r="70%">
          <stop offset="0%"   stopColor={C.bgInner} />
          <stop offset="60%"  stopColor={C.bgMid} />
          <stop offset="100%" stopColor={C.bgOuter} />
        </radialGradient>

        {/* ── Card back crosshatch (replicates the CSS repeating-linear-gradient) ── */}
        <pattern id="mb-cross" width="8" height="8" patternUnits="userSpaceOnUse">
          {/* 45° stripe */}
          <line x1="-1" y1="9"  x2="9" y2="-1" stroke={C.crosshatch} strokeWidth="4" />
          {/* -45° stripe */}
          <line x1="-1" y1="-1" x2="9" y2="9"  stroke={C.crosshatch} strokeWidth="4" />
        </pattern>

        {/* ── Card logo circle gradient (replicates .card-logo-fallback) ── */}
        <linearGradient id="mb-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.logoFrom} />
          <stop offset="100%" stopColor={C.logoDark} />
        </linearGradient>

        {/* ── Card front shine ── */}
        <linearGradient id="mb-shine" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0"   />
        </linearGradient>

        {/* ── Drop shadow ── */}
        <filter id="mb-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="2" dy="3" stdDeviation="4"
            floodColor="#000" floodOpacity="0.45" />
        </filter>

        {/* ── Reveal glow (face-up card halo) ── */}
        <filter id="mb-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width="320" height="160" fill="url(#mb-bg)" />

      {/* ── Felt texture — faint diagonal lines matching the game's ambience ── */}
      <g opacity="0.04">
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i}
            x1={i * 18 - 60} y1="0"
            x2={i * 18 + 50} y2="160"
            stroke="white" strokeWidth="1"
          />
        ))}
      </g>

      {/* ── Face-down cards (rendered back to front) ── */}
      {ANGLES.slice(0, 4).map((angle, i) => (
        <g key={i}
          transform={`rotate(${angle}, ${PIVOT.x}, ${PIVOT.y})`}
          filter="url(#mb-shadow)"
        >
          {/* Card base — dark red */}
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h}
            rx={CARD.rx} fill={C.cardBack} />

          {/* Inner border (replicates ::before border) */}
          <rect
            x={CARD.x + 5} y={CARD.y + 5}
            width={CARD.w - 10} height={CARD.h - 10}
            rx="3" fill="none"
            stroke={C.backBorder} strokeWidth="1.5"
          />

          {/* Crosshatch overlay (replicates ::before background-image) */}
          <rect x={CARD.x + 5} y={CARD.y + 5}
            width={CARD.w - 10} height={CARD.h - 10}
            rx="3" fill="url(#mb-cross)"
          />

          {/* "?" centre (replicates ::after content:'?') */}
          <text
            x={CARD.x + CARD.w / 2}
            y={CARD.y + CARD.h / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="26" fontWeight="700"
            fill={C.questionMk}
            fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          >?</text>

          {/* Shine */}
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h}
            rx={CARD.rx} fill="url(#mb-shine)" />
        </g>
      ))}

      {/* ── Face-up card glow halo (rendered before the card so it sits behind) ── */}
      <g transform={`rotate(${ANGLES[4]}, ${PIVOT.x}, ${PIVOT.y})`}>
        <rect
          x={CARD.x - 7} y={CARD.y - 7}
          width={CARD.w + 14} height={CARD.h + 14}
          rx={CARD.rx + 4}
          fill={C.logoFrom} opacity="0.35"
          filter="url(#mb-glow)"
        />
      </g>

      {/* ── Face-up card (revealed) ── */}
      <g transform={`rotate(${ANGLES[4]}, ${PIVOT.x}, ${PIVOT.y})`}
        filter="url(#mb-shadow)"
      >
        {/* Card face — white */}
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h}
          rx={CARD.rx} fill={C.cardFront} />

        {/* Logo fallback circle — gradient circle (replicates .card-logo-fallback) */}
        <circle
          cx={CARD.x + CARD.w / 2}
          cy={CARD.y + CARD.h / 2 - 4}
          r={17}
          fill="url(#mb-logo)"
        />

        {/* Restaurant initial "M" inside the circle */}
        <text
          x={CARD.x + CARD.w / 2}
          y={CARD.y + CARD.h / 2 - 3}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="17" fontWeight="700" fill="white"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >M</text>

        {/* Venue name hint */}
        <text
          x={CARD.x + CARD.w / 2}
          y={CARD.y + CARD.h - 10}
          textAnchor="middle"
          fontSize="6.5" fontWeight="600" fill="#999"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          letterSpacing="0.5"
        >SUNWAY</text>

        {/* Top-left corner mark (replicates standard playing card corner) */}
        <text
          x={CARD.x + 5} y={CARD.y + 12}
          fontSize="9" fontWeight="700" fill={C.logoFrom}
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >M</text>

        {/* Shine overlay */}
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h}
          rx={CARD.rx} fill="url(#mb-shine)" />
      </g>

      {/* ── Floor reflection glow ── */}
      <ellipse cx="170" cy="155" rx="95" ry="9"
        fill={C.logoFrom} opacity="0.07" />
    </svg>
  )
}
