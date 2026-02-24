import type { GameEntry } from '../types/game'
import MakanBoxThumbnail from '../components/thumbnails/MakanBoxThumbnail'
import MakanGlobeThumbnail from '../components/thumbnails/MakanGlobeThumbnail'

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
      'Deal a hand of random food shop cards from Sunway Pyramid. Tap a card to reveal your restaurant suggestion.',
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
    id: 'coming-soon',
    title: 'Coming Soon',
    description: 'A new demo game is currently in development. Check back soon!',
    category: 'Prototype',
    tags: ['prototype'],
    stats: { prototype: true },
    url: '#',
  },
]
