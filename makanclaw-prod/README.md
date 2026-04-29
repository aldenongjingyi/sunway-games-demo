# MakanClaw — Production

A claw machine restaurant randomiser game for Sunway Pyramid. Players grab capsules to discover restaurants, with optional special voucher prizes.

## Design Variations

Three theme variants are included, switchable via the paint palette button in-app:

| Theme | File | Description |
|-------|------|-------------|
| **Sunway Pyramid** | `/ (Vite app)` | MakanWheel-inspired design — hand-drawn Bradley Hand font, warm cream background, step-based filters, Sunway branding |
| **Dark Arcade** | `/arcade.html` | Original arcade aesthetic — Orbitron font, dark plum background, neon orange/gold accents, glass overlays |
| **Light Arcade** | `/arcade2.html` | Arcade layout with Sunway Pyramid light colours — production target with API integration |

## Running

```bash
cd makanclaw-prod
npm install
npm run dev          # http://localhost:5174
```

All three themes are accessible from the dev server:
- `http://localhost:5174/` — Sunway Pyramid
- `http://localhost:5174/arcade.html` — Dark Arcade
- `http://localhost:5174/arcade2.html` — Light Arcade (production target)

## Building

```bash
npm run build        # Output in dist/
```

## Project Structure

```
makanclaw-prod/
├── index.html              # Sunway Pyramid theme entry
├── src/
│   ├── main.ts             # Boot + theme routing
│   ├── game.ts             # MakanClawGame class (physics, rendering, state)
│   ├── audio.ts            # Web Audio API sound effects
│   ├── confetti.ts         # Particle confetti system
│   ├── ambient.ts          # Floating background particles
│   ├── data.ts             # DataProvider interface + filters + shop helpers
│   ├── theme.ts            # ThemeConfig + DEFAULT_THEME + SUNWAY_PYRAMID_THEME
│   ├── types.ts            # Shop, Capsule, GameState types
│   └── styles/
│       └── main.css        # Sunway Pyramid theme CSS
├── public/
│   ├── arcade.html         # Dark Arcade (standalone, self-contained)
│   ├── arcade2.html        # Light Arcade (standalone, production target)
│   ├── data.js             # Shop data loader
│   ├── datas.json          # Restaurant data
│   ├── fonts/              # Bradley Hand, Futura fonts
│   └── images/             # MakanWheel assets, icons, backgrounds
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## API Integration

The Light Arcade (`arcade2.html`) has a stubbed API layer ready for backend integration:

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/filters-data` | Returns dietary, cuisine, food category filter options |
| `GET` | `/shops` | Returns ball list (normal/special) with shop + voucher data |
| `POST` | `/redeem` | Redeems a voucher with phone number |

### Connecting Real APIs

1. Set `API_BASE` in the `GameAPI` object (near top of `<script>` in `arcade2.html`)
2. Replace stub function bodies with `fetch()` calls
3. Map response JSON to the existing structure

### Data Flow

```
Filters (UI) -> GET /shops (with filter params)
             -> API returns: [{ id, type: normal|special, shop, voucher }]
             -> Game renders capsules (red = normal, gold = special)
             -> Player grabs capsule
             -> Normal: show shop name + Play Again
             -> Special: show shop + voucher + phone input + Redeem Now
                -> POST /redeem (phone, voucher_id)
                -> Success: confirmation message
                -> Error: dialog with OK / Play Again options
```

### Architecture

All business logic lives on the backend. The game is a dumb client:

| Concern | Owner |
|---------|-------|
| Shop/ball list, filtering | Backend |
| Special ball assignment | Backend (CMS config) |
| Voucher selection + weightage | Backend (CMS config) |
| Ball count (total/special/normal) | Backend (CMS config) |
| Redemption validation | Backend |
| Claw physics + aim | Game (client) |
| 3rd attempt guaranteed catch | Game (client) |
| Visual rendering + animations | Game (client) |

## Theme Switching

Theme selection is persisted in `localStorage` (`makanclaw-theme`). Switching themes navigates to the corresponding HTML file — each is fully self-contained with its own CSS, JS, and assets.
