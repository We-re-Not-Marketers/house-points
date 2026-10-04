# D2M House Points

Update the house totals, get a fresh 16:9 MP4 for the room screen. About 3 minutes end to end.

## Update the points (event staff)

Staff only ever use **https://house-points-mu.vercel.app** (works on a phone). Staff code: ask Eric or Gab.

1. Enter the staff code (remembered on that phone after the first time).
2. The current totals are pre-filled. Change them (type, or use the -5 / +5 buttons), add a caption, press **Make the video**.
3. Keep the page open about 3 minutes. The video appears with **Download MP4** and **Copy video link**.

Every render stays in this repo's Releases with its totals, so a typo is fixed by submitting again with the right numbers.

## How it works

`app/` is the Vercel site (Vercel project `house-points`, root directory `app`). Its API routes hold a GitHub token (env `GITHUB_TOKEN`, fine-grained: this repo only, Actions write + Contents read) and trigger `.github/workflows/render.yml`, which writes `houses.json`, renders `index.html` frame by frame to MP4, and publishes a release. Env: `GITHUB_TOKEN`, `STAFF_CODE`, `REPO`.

## Update the animation (Eric)

Edit `index.html` (or ask Claude to, see `CLAUDE.md`) and push to `main`. A render runs automatically.

Preview locally: `npx serve .` then open the URL, or render the real thing with `npm install && npm run render`.
