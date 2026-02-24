---
name: "Update Game Thumbnails"
description: Sync game card thumbnail SVG components with the latest colours and design from the actual game files
category: Maintenance
tags: [thumbnails, ui, games]
---

Update the SVG thumbnail components for one or all games so the hub cards reflect the current look of each game.

**Input**: Optionally name a game (`makanbox`, `makanglobe`). If omitted, update all games.

---

## Architecture

Each game card in the hub shows an SVG thumbnail rendered by a React component, not a static image. This means:

- Colour changes → edit the `const C = { ... }` block at the top of the component
- Layout/structural changes → edit the SVG body below `const C`

**File locations:**

| Game | Game HTML | Thumbnail Component |
|---|---|---|
| MakanBox | `public/games/makanbox.html` | `src/components/thumbnails/MakanBoxThumbnail.tsx` |
| MakanGlobe | `public/games/makanglobe.html` | `src/components/thumbnails/MakanGlobeThumbnail.tsx` |

The `const C` block in each component has inline comments that map each token to the exact CSS selector and property it was derived from. Use those comments as your guide when re-reading the game HTML.

---

## Steps

### 1. Identify which games to update

If the user named a game, update only that one. Otherwise update all games.

### 2. For each game to update:

**a. Read the game HTML file**

Read the full `<style>` block from the game HTML. Focus on:
- `body` background gradient
- `.card-back` / `.face` background colour
- `.card-back::before` border and pattern colours
- `.card-back::after` text colour
- `.card-front` / `.face` background
- `.card-logo-fallback` / `.face-logo-fallback` gradient colours
- Any button backgrounds (`.card` revealed button, `#spin-btn`, etc.)
- `box-shadow` colours on selected/active elements
- Any other visually prominent colours

**b. Read the current thumbnail component**

Read the thumbnail `.tsx` file. The `const C` block at the top maps each token to a CSS comment. Compare every token in `const C` against the values you just read from the game HTML.

**c. Update `const C` if any values have changed**

Only update values that actually differ. Do not change anything that already matches.

**d. Check for structural changes**

After updating colours, consider whether the SVG body still accurately represents the game visually:
- If the game added new UI elements (a new button, a score display, a different card layout), update the SVG body to include them
- If the game removed elements, remove the corresponding SVG from the component
- If the game's overall layout changed significantly, rebuild the relevant SVG sections

When making structural changes, keep the same `const C` pattern — any new hardcoded colours must be added as named tokens in `const C` with a comment identifying the source CSS selector.

### 3. Verify build

After all edits, run:
```bash
npm run build
```

Fix any TypeScript errors before finishing.

### 4. Report what changed

Show a summary:
- Which files were edited
- Which `const C` tokens changed (old value → new value)
- Any structural changes made
- If nothing changed, confirm the thumbnails are already in sync

---

## Adding a thumbnail for a new game

If a game in `src/games/games.config.ts` has no `thumbnailComponent` yet:

1. Create `src/components/thumbnails/<GameName>Thumbnail.tsx`
2. Model it after an existing thumbnail component — use `const C` for all colours, derive values from the game HTML
3. Import it in `src/games/games.config.ts` and add `thumbnailComponent: <GameName>Thumbnail` to the registry entry
4. Run `npm run build` to verify

---

## Guardrails

- Never hardcode colour hex values directly in the SVG body — always put them in `const C` with a comment
- Do not change colours that haven't changed in the game HTML
- Keep the SVG `viewBox="0 0 320 160"` and `style={{ display: 'block', width: '100%', height: '100%' }}` unchanged — these control how the thumbnail fits the card
- All SVG `id` attributes must keep their existing prefix (`mb-` for MakanBox, `mg-` for MakanGlobe) to avoid DOM collisions when both are on screen
- After any structural changes, visually describe what the updated thumbnail looks like so the user can verify it matches the game
