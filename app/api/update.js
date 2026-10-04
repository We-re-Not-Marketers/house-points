// POST /api/update {code, label, points:[4 ints]} -> triggers the render workflow.
import { gh, checkCode, fail } from './_gh.js';

const INPUTS = ['swiftclaw', 'muleheart', 'roadwright', 'deckbane']; // same order as houses.json

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'POST only');
  const { code, label, points } = req.body || {};
  if (!checkCode(code)) return fail(res, 401, 'Wrong staff code');
  if (!Array.isArray(points) || points.length !== 4 || !points.every(p => Number.isInteger(p) && p >= 0 && p < 1e6))
    return fail(res, 400, 'Each house needs a whole number total');
  const caption = String(label || '').trim().slice(0, 40) || 'Live standings';
  const inputs = { label: caption };
  INPUTS.forEach((k, i) => (inputs[k] = String(points[i])));
  try {
    await gh('/actions/workflows/render.yml/dispatches', { method: 'POST', body: JSON.stringify({ ref: 'main', inputs }) });
    res.status(202).json({ ok: true, startedAt: new Date().toISOString() });
  } catch (e) { fail(res, 502, e.message); }
}
