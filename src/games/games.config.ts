import type { GameEntry } from '../types/game'
import MakanBoxThumbnail from '../components/thumbnails/MakanBoxThumbnail'
import MakanGlobeThumbnail from '../components/thumbnails/MakanGlobeThumbnail'
import MakanSpaceThumbnail from '../components/thumbnails/MakanSpaceThumbnail'

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
export const GAMES: GameEntry[] = [
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
    id: 'coming-soon',
    title: 'Coming Soon',
    description: 'A new demo game is currently in development. Check back soon!',
    category: 'Prototype',
    tags: ['prototype'],
    stats: { prototype: true },
    url: '#',
  },
]
