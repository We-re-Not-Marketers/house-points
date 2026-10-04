# D2M House Points

Update the house totals, get a fresh 16:9 MP4 for the room screen. About 3 minutes end to end.

## Update the points (event staff)

1. Open this repo on GitHub, click the **Actions** tab.
2. Click **Update house points** in the left list, then **Run workflow** (right side).
3. Type the caption (e.g. `After Day 1`) and the **running total** for each house. Whole numbers only.
4. Click the green **Run workflow** button. Wait for the green check (about 3 min).
5. Download the video: **https://github.com/We-re-Not-Marketers/house-points/releases/latest/download/house-points.mp4**

That link always serves the newest render. Every past render stays in **Releases**, with the totals in its notes, so a mistake is easy to spot and redo: just run it again with the right numbers.

## Update the animation (Eric)

Edit `index.html` (or ask Claude to, see `CLAUDE.md`) and push to `main`. A render runs automatically.

Preview locally: `npx serve .` then open the URL, or render the real thing with `npm install && npm run render`.
