import type { GameEntry } from '../types/game'
import MakanBoxThumbnail from '../components/thumbnails/MakanBoxThumbnail'
import MakanGlobeThumbnail from '../components/thumbnails/MakanGlobeThumbnail'
import MakanSpaceThumbnail from '../components/thumbnails/MakanSpaceThumbnail'
import MakanDiceThumbnail from '../components/thumbnails/MakanDiceThumbnail'
import MakanClawThumbnail from '../components/thumbnails/MakanClawThumbnail'

/**
 * Central game registry — the single source of truth for all game metadata.
 *
 * To add a new game:
 * 1. Add a new GameEntry object to this array.
 * 2. Place the game file in `public/games/<filename>.html` (if applicable).
 * 3. Optionally add a thumbnail at `public/thumbnails/<id>.png`.
 * 4. Run `npm run dev` — the card appears automatically.
 *
 * See AGENTS.md "## Adding a New Game" for the full guide.
 */
const exclude = (import.meta.env.VITE_EXCLUDE_GAMES ?? '').split(',').filter(Boolean)

export const GAMES: GameEntry[] = ([
  {
    id: 'makanbox',
    title: 'MakanBox',
    description:
      'Pick a mystery lunchbox from Sunway Pyramid — open it to reveal your restaurant surprise!',
    category: 'Randomiser',
    tags: ['casual', 'food'],
    stats: {},
    thumbnailComponent: MakanBoxThumbnail,
    url: 'games/makanbox.html',
  },
  {
    id: 'makanglobe',
    title: 'MakanGlobe',
    description:
      'Spin a 3D globe of food shops. Hold the button to build speed, release to discover your restaurant pick.',
    category: 'Randomiser',
    tags: ['casual', 'food', '3d'],
    stats: {},
    thumbnailComponent: MakanGlobeThumbnail,
    url: 'games/makanglobe.html',
  },
  {
    id: 'makanspace',
    title: 'MakanSpace',
    description:
      'Intercept drifting cargo pods in deep space — tap one to reveal your next restaurant!',
    category: 'Randomiser',
    tags: ['casual', 'food', 'space'],
    stats: {},
    thumbnailComponent: MakanSpaceThumbnail,
    url: 'games/makanspace.html',
  },
  {
    id: 'makandice',
    title: 'MakanDice',
    description:
      'Roll the die — each face hides a restaurant. Tap to tumble, land on a face, and eat there!',
    category: 'Randomiser',
    tags: ['casual', 'food', '3d'],
    stats: {},
    thumbnailComponent: MakanDiceThumbnail,
    url: 'games/makandice.html',
  },
  {
    id: 'makanclaw',
    title: 'MakanClaw',
    description:
      'Aim the claw, drop it into the capsule pit, and grab your next restaurant pick!',
    category: 'Randomiser',
    tags: ['casual', 'food', 'arcade'],
    stats: {},
    thumbnailComponent: MakanClawThumbnail,
    url: 'games/makanclaw.html',
  },
] as GameEntry[]).filter(g => !exclude.includes(g.id))
