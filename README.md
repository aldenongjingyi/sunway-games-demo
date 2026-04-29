# Sunway Games Demo

Interactive restaurant randomiser game demos for Sunway Malls. A collection of playful mini-games that help visitors decide where to eat.

## Games

| Game | Description | Tech |
|------|-------------|------|
| **MakanBox** | Pick a mystery lunchbox to reveal a restaurant | HTML/CSS/JS |
| **MakanGlobe** | Spin a 3D globe of restaurants | Three.js |
| **MakanSpace** | Intercept drifting cargo pods in space | Three.js |
| **MakanDice** | Roll a die with restaurant faces | Three.js |
| **MakanClaw** | Claw machine — grab a capsule to reveal a restaurant | Canvas 2D + GSAP |

## Project Structure

```
├── src/                    # Hub app (React + TypeScript + Tailwind)
│   ├── pages/HubPage.tsx   # Main hub page
│   ├── components/         # Header, GameCard, SearchBar, FilterBar
│   ├── games/games.config.ts  # Game registry (single source of truth)
│   └── types/game.ts       # GameEntry interface
├── public/
│   ├── games/              # Self-contained game HTML files
│   │   ├── makanbox.html
│   │   ├── makanglobe.html
│   │   ├── makanspace.html
│   │   ├── makandice.html
│   │   └── makanclaw.html
│   ├── games/data.js       # Shared data loader (loadFBShops + pickRandom)
│   ├── games/datas.json    # Restaurant data (6.2MB)
│   └── makan-theme.css     # Shared design tokens
├── makanclaw-prod/         # Production MakanClaw (see below)
├── vite.config.ts
└── package.json
```

## Running the Demo Hub

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deployment

```bash
npm run deploy     # Builds and deploys to GitHub Pages
```

## Production MakanClaw

The `makanclaw-prod/` directory contains a standalone production version of the MakanClaw game with multiple design variations and API integration. See [`makanclaw-prod/README.md`](makanclaw-prod/README.md) for details.
