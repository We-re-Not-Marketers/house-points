// GET /api/video?tag=points-...&dl=1 -> the MP4 from that release (private repo, so we proxy it).
// Public on purpose: a video link can be pasted anywhere. Supports Range so iPhone Safari plays it.
import { gh, fail } from './_gh.js';

export default async function handler(req, res) {
  const tag = String(req.query.tag || '');
  if (!/^points-\d{8}-\d{6}$/.test(tag)) return fail(res, 400, 'Bad tag');
  try {
    const rel = await gh(`/releases/tags/${tag}`).then(r => r.json());
    const asset = rel.assets?.find(a => a.name.endsWith('.mp4'));
    if (!asset) return fail(res, 404, 'No video on that release');
    const buf = Buffer.from(await (await gh(asset.url, { headers: { accept: 'application/octet-stream' } })).arrayBuffer());
    res.setHeader('content-type', 'video/mp4');
    res.setHeader('accept-ranges', 'bytes');
    res.setHeader('cache-control', 'public, max-age=31536000, immutable');
    if (req.query.dl) res.setHeader('content-disposition', `attachment; filename="house-cup-${tag.slice(7)}.mp4"`);
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const start = m[1] ? +m[1] : buf.length - +m[2];
      const end = m[1] && m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
      res.status(206).setHeader('content-range', `bytes ${start}-${end}/${buf.length}`);
      res.setHeader('content-length', end - start + 1);
      return res.end(buf.subarray(start, end + 1));
    }
    res.setHeader('content-length', buf.length);
    res.status(200).end(buf);
  } catch (e) { fail(res, 502, e.message); }
}
