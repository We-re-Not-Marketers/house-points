// GET /api/status?code=&since=ISO -> where the render triggered at `since` is: queued / rendering / done / failed.
import { gh, checkCode, fail } from './_gh.js';

export default async function handler(req, res) {
  if (!checkCode(req.query.code)) return fail(res, 401, 'Wrong staff code');
  res.setHeader('cache-control', 'no-store');
  const since = new Date(req.query.since || 0).getTime() - 5000; // small clock-skew allowance
  try {
    const [rel, runs] = await Promise.all([
      gh('/releases?per_page=5').then(r => r.json()),
      gh('/actions/workflows/render.yml/runs?event=workflow_dispatch&per_page=3').then(r => r.json()),
    ]);
    const latest = rel.find(r => r.assets?.length);
    const fresh = rel.find(r => r.assets?.length && new Date(r.created_at).getTime() >= since);
    if (fresh) return res.status(200).json({ state: 'done', video: pick(fresh) });
    const run = runs.workflow_runs?.find(r => new Date(r.created_at).getTime() >= since);
    if (run?.conclusion && run.conclusion !== 'success') return res.status(200).json({ state: 'failed' });
    const state = !run || run.status === 'queued' || run.status === 'pending' ? 'queued' : 'rendering';
    res.status(200).json({ state, latest: latest ? pick(latest) : null });
  } catch (e) { fail(res, 502, e.message); }
}

const pick = r => ({ tag: r.tag_name, title: r.name, notes: r.body, createdAt: r.created_at });
