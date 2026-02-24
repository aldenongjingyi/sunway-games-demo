/**
 * MakanGlobe thumbnail — SVG illustration derived directly from the game's visual design.
 *
 * ─── Color tokens ────────────────────────────────────────────────────────────
 * Update these constants if the MakanGlobe game changes its colours or design,
 * and the thumbnail will update automatically on next build.
 */
const C = {
  // Shared background — matches makanglobe.html body gradient exactly
  bgInner:       '#1e6b32',
  bgMid:         '#14492a',
  bgOuter:       '#0d2e1a',
  // Globe surface (slightly deeper green so faces pop)
  globeInner:    '#1a5c30',
  globeOuter:    '#092015',
  // Tile face — matches .face { background: #fff }
  tileFace:      '#ffffff',
  // Selected tile ring — matches .face.selected box-shadow colour
  tileSelected:  '#e74c3c',
  // Spin button — matches #spin-btn { background: #e74c3c }
  spinBtn:       '#e74c3c',
  spinBtnDark:   '#c0392b',
  // Grid lines inside globe
  gridLine:      'rgba(255,255,255,0.10)',
  // Globe rim highlight
  rimHighlight:  'rgba(255,255,255,0.14)',
} as const

// Globe geometry
const G = { cx: 152, cy: 75, r: 56 }

// Tile dimensions — scaled from the game's 110×85px faces
const T = { w: 23, h: 15, rx: 2.5 }

// Build a 3-row × 4-col tile grid on the globe's front hemisphere.
// Rows slightly scale + shift to give a subtle sphere-curve illusion.
type Tile = { x: number; y: number; w: number; h: number; selected: boolean }

function buildTiles(): Tile[] {
  const rows = [
    { dy: -21, cols: 3, scale: 0.80 }, // top row — smaller, fewer tiles
    { dy:   0, cols: 5, scale: 1.00 }, // equator — full size
    { dy:  21, cols: 3, scale: 0.80 }, // bottom row — smaller, fewer tiles
  ]
  const tiles: Tile[] = []
  rows.forEach(({ dy, cols, scale }) => {
    const tw = T.w * scale
    const th = T.h * scale
    const span = (cols - 1) * (tw + 5)
    for (let c = 0; c < cols; c++) {
      const x = G.cx - span / 2 + c * (tw + 5)
      const y = G.cy + dy - th / 2
      // The centre tile of the equator row is the selected (red-highlighted) face
      const selected = dy === 0 && c === Math.floor(cols / 2)
      tiles.push({ x, y, w: tw, h: th, selected })
    }
  })
  return tiles
}

const TILES = buildTiles()

export default function MakanGlobeThumbnail() {
  return (
    <svg
      viewBox="0 0 320 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        {/* ── Background ── */}
        <radialGradient id="mg-bg" cx="50%" cy="50%" r="65%">
          <stop offset="0%"   stopColor={C.bgInner} />
          <stop offset="60%"  stopColor={C.bgMid}   />
          <stop offset="100%" stopColor={C.bgOuter} />
        </radialGradient>

        {/* ── Globe surface gradient (lit from top-left like the game) ── */}
        <radialGradient id="mg-globe" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor={C.globeInner} />
          <stop offset="100%" stopColor={C.globeOuter} />
        </radialGradient>

        {/* ── Clip path — everything inside the globe circle ── */}
        <clipPath id="mg-clip">
          <circle cx={G.cx} cy={G.cy} r={G.r} />
        </clipPath>

        {/* ── Spin button gradient ── */}
        <linearGradient id="mg-btn" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={C.spinBtn}     />
          <stop offset="100%" stopColor={C.spinBtnDark} />
        </linearGradient>

        {/* ── Tile shine ── */}
        <linearGradient id="mg-tile-shine" x1="0%" y1="0%" x2="40%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.30" />
          <stop offset="100%" stopColor="white" stopOpacity="0"    />
        </linearGradient>

        {/* ── Drop shadow for tiles ── */}
        <filter id="mg-tile-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1.5"
            floodColor="#000" floodOpacity="0.28" />
        </filter>

        {/* ── Selected tile glow (replicates .face.selected box-shadow) ── */}
        <filter id="mg-sel-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Globe outer glow ── */}
        <filter id="mg-globe-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width="320" height="160" fill="url(#mg-bg)" />

      {/* ── Horizontal speed lines (spinning motion — flanking the globe) ── */}
      {[-14, -7, 0, 7, 14].map((offset, i) => {
        const opacity = 0.12 - Math.abs(offset) * 0.004
        return (
          <g key={i}>
            <line
              x1={10} y1={G.cy + offset}
              x2={G.cx - G.r - 8} y2={G.cy + offset * 0.6}
              stroke="white" strokeWidth={1.2 - Math.abs(offset) * 0.03}
              strokeLinecap="round" opacity={opacity}
            />
            <line
              x1={G.cx + G.r + 8} y1={G.cy + offset * 0.6}
              x2={300} y2={G.cy + offset}
              stroke="white" strokeWidth={1.2 - Math.abs(offset) * 0.03}
              strokeLinecap="round" opacity={opacity}
            />
          </g>
        )
      })}

      {/* ── Globe drop shadow ── */}
      <ellipse
        cx={G.cx} cy={G.cy + G.r + 7}
        rx={G.r * 0.82} ry={9}
        fill="#000" opacity="0.22"
      />

      {/* ── Globe body ── */}
      <circle
        cx={G.cx} cy={G.cy} r={G.r}
        fill="url(#mg-globe)"
        filter="url(#mg-globe-glow)"
      />

      {/* ── Globe contents (clipped to circle) ── */}
      <g clipPath="url(#mg-clip)">
        {/* Latitude lines — replicates the horizontal rows of the globe grid */}
        {[-21, 0, 21].map((dy, i) => {
          const rx = Math.sqrt(Math.max(0, G.r * G.r - dy * dy)) * 0.94
          return (
            <ellipse key={i}
              cx={G.cx} cy={G.cy + dy}
              rx={rx} ry={5.5}
              fill="none" stroke={C.gridLine} strokeWidth="0.8"
            />
          )
        })}

        {/* Longitude lines — replicates the vertical columns */}
        {[-35, -12, 12, 35].map((dx, i) => (
          <ellipse key={i}
            cx={G.cx + dx} cy={G.cy}
            rx={9} ry={G.r * 0.93}
            fill="none" stroke={C.gridLine} strokeWidth="0.8"
          />
        ))}

        {/* ── Tile faces ── */}
        {TILES.map((tile, i) => (
          <g key={i}>
            {/* Selected tile: outer red ring + glow (replicates .face.selected) */}
            {tile.selected && (
              <rect
                x={tile.x - 3} y={tile.y - 3}
                width={tile.w + 6} height={tile.h + 6}
                rx={T.rx + 2}
                fill={C.tileSelected} opacity="0.55"
                filter="url(#mg-sel-glow)"
              />
            )}

            {/* Tile face */}
            <rect
              x={tile.x} y={tile.y}
              width={tile.w} height={tile.h}
              rx={T.rx}
              fill={tile.selected ? C.tileSelected : C.tileFace}
              filter="url(#mg-tile-shadow)"
            />

            {/* Tile logo circle (replicates .face-logo-fallback inside each face) */}
            {!tile.selected && (
              <circle
                cx={tile.x + tile.w / 2}
                cy={tile.y + tile.h / 2 - 1}
                r={Math.min(tile.w, tile.h) * 0.26}
                fill={C.tileSelected} opacity="0.55"
              />
            )}

            {/* Shine */}
            <rect
              x={tile.x} y={tile.y}
              width={tile.w} height={tile.h}
              rx={T.rx} fill="url(#mg-tile-shine)"
            />
          </g>
        ))}
      </g>

      {/* ── Globe rim highlight (top-left arc) ── */}
      <circle
        cx={G.cx} cy={G.cy} r={G.r}
        fill="none"
        stroke={C.rimHighlight}
        strokeWidth="1.5"
      />
      <path
        d={`M ${G.cx - G.r * 0.55} ${G.cy - G.r * 0.82}
            A ${G.r} ${G.r} 0 0 1 ${G.cx + G.r * 0.18} ${G.cy - G.r}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── HOLD TO SPIN button (replicates #spin-btn from the game) ── */}
      <rect
        x={G.cx + G.r + 14} y={G.cy - 12}
        width={74} height={24}
        rx={12}
        fill="url(#mg-btn)"
      />
      <text
        x={G.cx + G.r + 14 + 37}
        y={G.cy + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="7.5" fontWeight="700" fill="white" letterSpacing="0.6"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
      >HOLD TO SPIN</text>

      {/* ── Floor glow ── */}
      <ellipse
        cx={G.cx} cy={G.cy + G.r + 5}
        rx={58} ry={8}
        fill={C.tileSelected} opacity="0.07"
      />
    </svg>
  )
}
