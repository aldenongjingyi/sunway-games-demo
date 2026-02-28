/**
 * MakanSpace thumbnail — Borderlands-style asteroid scene.
 *
 * Flat cel-shaded blobs with hard black outlines, flat highlight/shadow lobes,
 * and black-outlined craters. No gradients, no glow, no labels.
 * Matches the game's Borderlands art direction.
 */

// Space background
const BG = {
  inner: '#1e0a40',
  mid:   '#0a0522',
  outer: '#050210',
}

// Three asteroid colours (from PALETTE indices 0, 1, 4)
const A = {
  purple: { c: '#C45AFF', cd: '#8f22d4' },
  orange: { c: '#FF7B42', cd: '#cc4a15' },
  gold:   { c: '#F5CB45', cd: '#c49a00' },
}

function seededStars(count: number): { x: number; y: number; r: number; a: number }[] {
  const stars: { x: number; y: number; r: number; a: number }[] = []
  let seed = 77
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }
  for (let i = 0; i < count; i++) {
    stars.push({ x: rand() * 320, y: rand() * 160, r: 0.4 + rand() * 1.2, a: 0.25 + rand() * 0.65 })
  }
  return stars
}

const STARS = seededStars(60)

export default function MakanSpaceThumbnail() {
  return (
    <svg
      viewBox="0 0 320 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ms2-bg" cx="30%" cy="38%" r="75%">
          <stop offset="0%"   stopColor={BG.inner} />
          <stop offset="55%"  stopColor={BG.mid}   />
          <stop offset="100%" stopColor={BG.outer}  />
        </radialGradient>
        <radialGradient id="ms2-nb1" cx="20%" cy="65%" r="50%">
          <stop offset="0%"   stopColor="rgba(120,60,220,0.28)" />
          <stop offset="100%" stopColor="transparent"            />
        </radialGradient>
        <radialGradient id="ms2-nb2" cx="78%" cy="30%" r="45%">
          <stop offset="0%"   stopColor="rgba(91,168,255,0.16)" />
          <stop offset="100%" stopColor="transparent"           />
        </radialGradient>
      </defs>

      {/* ── Background ── */}
      <rect width="320" height="160" fill="url(#ms2-bg)" />
      <rect width="320" height="160" fill="url(#ms2-nb1)" />
      <rect width="320" height="160" fill="url(#ms2-nb2)" />

      {/* ── Stars ── */}
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.a} />
      ))}

      {/* ════════════════════════════════════════════════════
          Asteroid A — large purple, centre-front
          Borderlands: flat fill + thick black outline + flat cel-shading
      ════════════════════════════════════════════════════ */}

      {/* Body */}
      <ellipse cx="164" cy="90" rx="44" ry="38"
        fill={A.purple.c} stroke="#000" strokeWidth="3.5" />
      {/* Flat highlight lobe — top-left, no gradient */}
      <ellipse cx="148" cy="74" rx="22" ry="17"
        fill="rgba(255,255,255,0.22)" />
      {/* Flat shadow lobe — bottom-right, no gradient */}
      <ellipse cx="181" cy="106" rx="20" ry="15"
        fill="rgba(0,0,0,0.22)" />
      {/* Crater 1 */}
      <ellipse cx="150" cy="90" rx="10" ry="8"
        fill={A.purple.cd} stroke="#000" strokeWidth="1.5" />
      {/* Crater 2 */}
      <ellipse cx="176" cy="80" rx="6" ry="5"
        fill={A.purple.cd} stroke="#000" strokeWidth="1.5" />
      {/* Crater 3 */}
      <ellipse cx="172" cy="103" rx="4" ry="3.5"
        fill={A.purple.cd} stroke="#000" strokeWidth="1.2" />

      {/* ════════════════════════════════════════════════════
          Asteroid B — small orange, upper-left
      ════════════════════════════════════════════════════ */}

      <ellipse cx="62" cy="50" rx="26" ry="22"
        fill={A.orange.c} stroke="#000" strokeWidth="3" />
      <ellipse cx="50" cy="40" rx="12" ry="9"
        fill="rgba(255,255,255,0.22)" />
      <ellipse cx="74" cy="60" rx="11" ry="8"
        fill="rgba(0,0,0,0.22)" />
      <ellipse cx="56" cy="51" rx="7" ry="5.5"
        fill={A.orange.cd} stroke="#000" strokeWidth="1.5" />
      <ellipse cx="72" cy="44" rx="4" ry="3"
        fill={A.orange.cd} stroke="#000" strokeWidth="1.2" />

      {/* ════════════════════════════════════════════════════
          Asteroid C — medium gold, lower-right
      ════════════════════════════════════════════════════ */}

      <ellipse cx="264" cy="106" rx="34" ry="30"
        fill={A.gold.c} stroke="#000" strokeWidth="3.5" />
      <ellipse cx="250" cy="93" rx="16" ry="13"
        fill="rgba(255,255,255,0.22)" />
      <ellipse cx="278" cy="119" rx="15" ry="12"
        fill="rgba(0,0,0,0.22)" />
      <ellipse cx="256" cy="107" rx="8" ry="7"
        fill={A.gold.cd} stroke="#000" strokeWidth="1.5" />
      <ellipse cx="274" cy="98" rx="5" ry="4"
        fill={A.gold.cd} stroke="#000" strokeWidth="1.2" />
      <ellipse cx="275" cy="116" rx="3.5" ry="3"
        fill={A.gold.cd} stroke="#000" strokeWidth="1.2" />
    </svg>
  )
}
