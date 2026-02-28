/**
 * MakanBox thumbnail — warm bento lunchbox scene matching the game's design.
 *
 * Depicts three colourful lunchboxes with open lids on a warm cream background,
 * matching the palette and 3D box design used by the game.
 *
 * Update colour tokens below if the game's palette changes.
 */

// Warm background
const BG = {
  inner: '#fff5e8',
  mid:   '#fde8cf',
  outer: '#f5c89a',
}

// Three box colours (from game PALETTE indices 0, 1, 2)
const B = {
  orange: { c: '#FF6B35', cd: '#c94e1a', lid: '#ff8c5a', side: '#c94e1a' },
  coral:  { c: '#EF476F', cd: '#bf2950', lid: '#f56d8a', side: '#bf2950' },
  yellow: { c: '#FFD23F', cd: '#c49500', lid: '#ffe066', side: '#c49500' },
}

// Seeded stars → warm dots for background texture
function seededDots(count: number): { x: number; y: number; r: number; a: number }[] {
  const dots: { x: number; y: number; r: number; a: number }[] = []
  let seed = 42
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }
  for (let i = 0; i < count; i++) {
    dots.push({ x: rand() * 320, y: rand() * 160, r: 1.2 + rand() * 2.2, a: 0.06 + rand() * 0.10 })
  }
  return dots
}

const DOTS = seededDots(28)

export default function MakanBoxThumbnail() {
  return (
    <svg
      viewBox="0 0 320 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        {/* Warm cream background */}
        <radialGradient id="mbb-bg" cx="38%" cy="35%" r="72%">
          <stop offset="0%"   stopColor={BG.inner} />
          <stop offset="55%"  stopColor={BG.mid}   />
          <stop offset="100%" stopColor={BG.outer}  />
        </radialGradient>

        {/* Warm floor shadow */}
        <radialGradient id="mbb-floor" cx="50%" cy="100%" r="55%">
          <stop offset="0%"   stopColor="rgba(180,100,40,0.18)" />
          <stop offset="100%" stopColor="transparent"           />
        </radialGradient>

        {/* Drop shadow for boxes */}
        <filter id="mbb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="rgba(120,60,10,0.30)"/>
        </filter>
      </defs>

      {/* ── Warm background ── */}
      <rect width="320" height="160" fill="url(#mbb-bg)" />

      {/* ── Dot texture ── */}
      <g>
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r}
            fill="rgba(255,107,53,0.12)" opacity={d.a * 8} />
        ))}
      </g>

      {/* ── Floor gradient ── */}
      <rect width="320" height="160" fill="url(#mbb-floor)" />

      {/* ── Box A — orange, centre-front (open) ── */}
      <g filter="url(#mbb-shadow)">
        {/* Box body */}
        <rect x="122" y="96" width="76" height="46" rx="7"
          fill={B.orange.c} />
        {/* Box side (right) */}
        <polygon points="198,96 206,88 206,134 198,142"
          fill={B.orange.side} />
        {/* Box top (top face) */}
        <polygon points="122,96 130,88 206,88 198,96"
          fill={B.orange.lid} />
        {/* Inner shadow */}
        <rect x="122" y="96" width="76" height="16" rx="7"
          fill="rgba(0,0,0,0.10)" />
        {/* Question mark */}
        <text x="160" y="126" textAnchor="middle" dominantBaseline="middle"
          fontSize="26" fontWeight="900" fill="rgba(255,255,255,0.94)"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">?</text>
        {/* Lid — tilted open above box */}
        <g transform="translate(160,90) rotate(-32) translate(-38,-10)">
          <rect x="0" y="0" width="76" height="18" rx="7"
            fill={B.orange.lid} />
          <polygon points="76,0 84,-8 84,10 76,18"
            fill={B.orange.side} />
          <rect x="0" y="0" width="76" height="7" rx="7"
            fill="rgba(255,255,255,0.18)" />
        </g>
      </g>

      {/* ── Box B — coral, upper-left (open) ── */}
      <g filter="url(#mbb-shadow)">
        <rect x="30" y="76" width="52" height="34" rx="5"
          fill={B.coral.c} />
        <polygon points="82,76 88,70 88,110 82,110"
          fill={B.coral.side} />
        <polygon points="30,76 36,70 88,70 82,76"
          fill={B.coral.lid} />
        <rect x="30" y="76" width="52" height="12" rx="5"
          fill="rgba(0,0,0,0.09)" />
        <text x="56" y="97" textAnchor="middle" dominantBaseline="middle"
          fontSize="17" fontWeight="900" fill="rgba(255,255,255,0.92)"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">?</text>
        {/* Lid open */}
        <g transform="translate(56,68) rotate(-28) translate(-26,-7)">
          <rect x="0" y="0" width="52" height="13" rx="5"
            fill={B.coral.lid} />
          <polygon points="52,0 58,-6 58,7 52,13"
            fill={B.coral.side} />
          <rect x="0" y="0" width="52" height="5" rx="5"
            fill="rgba(255,255,255,0.18)" />
        </g>
      </g>

      {/* ── Box C — yellow, lower-right (open) ── */}
      <g filter="url(#mbb-shadow)">
        <rect x="226" y="90" width="62" height="42" rx="6"
          fill={B.yellow.c} />
        <polygon points="288,90 295,83 295,132 288,132"
          fill={B.yellow.side} />
        <polygon points="226,90 233,83 295,83 288,90"
          fill={B.yellow.lid} />
        <rect x="226" y="90" width="62" height="14" rx="6"
          fill="rgba(0,0,0,0.09)" />
        <text x="257" y="114" textAnchor="middle" dominantBaseline="middle"
          fontSize="20" fontWeight="900" fill="rgba(255,255,255,0.92)"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">?</text>
        {/* Lid open */}
        <g transform="translate(257,83) rotate(-30) translate(-31,-8)">
          <rect x="0" y="0" width="62" height="15" rx="6"
            fill={B.yellow.lid} />
          <polygon points="62,0 69,-7 69,8 62,15"
            fill={B.yellow.side} />
          <rect x="0" y="0" width="62" height="6" rx="6"
            fill="rgba(255,255,255,0.18)" />
        </g>
      </g>

      {/* ── Ambient warm glow at bottom ── */}
      <ellipse cx="160" cy="158" rx="130" ry="10"
        fill="rgba(255,107,53,0.10)" />
    </svg>
  )
}
