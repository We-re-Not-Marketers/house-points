// Renders index.html to a 1920x1080 H.264 MP4, frame by frame.
// Time is driven, not recorded: Playwright's fake clock steps JS timers / rAF / performance.now,
// and every Web Animation (CSS animations + transitions) is seeked to the same instant.
// Result: no dropped frames or stutter, even on a slow CI runner.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('.');
const FPS = 30;
const OUT = process.argv[2] || 'out/house-points.mp4';
const FRAMES_DIR = 'out/frames';
const data = JSON.parse(await readFile('houses.json', 'utf8'));
const DURATION = (data.durationSeconds || 10) * 1000;

const TYPES = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname === '/' ? '/index.html' : new URL(req.url, 'http://x').pathname));
  try { res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(await readFile(path)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

await rm(FRAMES_DIR, { recursive: true, force: true });
await mkdir(FRAMES_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.clock.install({ time: 0 });
await page.clock.pauseAt(1000);
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Optional handshake: if the page sets window.__ready, wait for it (data fetched, timeline started).
await page.waitForFunction(() => window.__ready !== false, null, { timeout: 10000 }).catch(() => {});

const total = Math.round(DURATION / 1000 * FPS);
const step = 1000 / FPS;
for (let i = 0; i < total; i++) {
  const t = i * step;
  if (i > 0) await page.clock.runFor(step);
  await page.evaluate(t => {
    // Seek every CSS animation/transition to its own local time. Animations seen for the first time
    // are "born" now, so transitions triggered mid-timeline start from 0 instead of jumping ahead.
    const born = (window.__born ||= new WeakMap());
    for (const a of document.getAnimations()) {
      if (!born.has(a)) born.set(a, t);
      a.pause();
      a.currentTime = t - born.get(a);
    }
  }, t);
  await page.screenshot({ path: `${FRAMES_DIR}/${String(i).padStart(5, '0')}.png` });
  if (i % FPS === 0) process.stdout.write(`frame ${i}/${total}\r`);
}
await browser.close();
server.close();

await mkdir(join(OUT, '..'), { recursive: true });
await new Promise((ok, fail) => {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${FRAMES_DIR}/%05d.png`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  ff.on('exit', code => code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)));
});
await rm(FRAMES_DIR, { recursive: true, force: true });
console.log(`\nRendered ${total} frames -> ${OUT}`);
