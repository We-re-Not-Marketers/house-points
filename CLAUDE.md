# D2M House Points: instructions for Claude

This repo turns `houses.json` into a 1920x1080 MP4 via `index.html` + `render.mjs`. Pushing to `main` triggers the GitHub Action, which renders and publishes the MP4 as the latest release.

## If someone asks to update the points
1. Edit ONLY the `points` (and optionally `label`) fields in `houses.json`. Points are **running totals**, not deltas. If the person gives a delta ("House Two +30"), add it to the current value and say the new total back to them before committing.
2. Never rename houses, reorder them, or change colors unless explicitly asked.
3. Commit with a message like `Points: After Day 2 (150 / 120 / 160 / 95)` and push to `main`.
4. Tell them the video will be ready in ~3 min at `https://github.com/OWNER/REPO/releases/latest/download/house-points.mp4`.

## If someone asks to change the animation (`index.html`)
The renderer drives time itself, frame by frame. The animation MUST keep this contract or the render breaks:
- **Read everything from `houses.json`** via `fetch('houses.json')`. No hardcoded names or totals.
- **Fixed length**, no clicks, hover, or scroll. Total length = `durationSeconds` in `houses.json`. Everything should be settled ~1s before the end.
- **Animate with CSS animations/transitions, the Web Animations API, or `requestAnimationFrame` / `setTimeout` timed off `performance.now()`.** All of these are seeked deterministically. Do NOT use video elements, GIFs, Lottie with its own clock, or `<canvas>` libraries that keep an internal wall-clock.
- **Page is exactly 1920x1080**, `overflow:hidden`.
- **Assets self-contained**: images/fonts in `assets/` or Google Fonts. No other external URLs.
- Set `window.__ready = true` once data is loaded and the timeline has started.
- Test before pushing: `npm install && npm run render`, then check `out/house-points.mp4`.
