// GET /api/state -> current houses.json (names + running totals) to prefill the form.
import { gh, checkCode, fail } from './_gh.js';

export default async function handler(req, res) {
  if (!checkCode(req.query.code)) return fail(res, 401, 'Wrong staff code');
  try {
    const r = await gh('/contents/houses.json?ref=main', { headers: { accept: 'application/vnd.github.raw' } });
    res.setHeader('cache-control', 'no-store');
    res.status(200).json(await r.json());
  } catch (e) { fail(res, 502, e.message); }
}
