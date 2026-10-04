// Shared GitHub helpers. The token lives only in Vercel env, never reaches the browser.
const REPO = process.env.REPO || 'We-re-Not-Marketers/house-points';
const API = `https://api.github.com/repos/${REPO}`;

export async function gh(path, init = {}) {
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...init.headers,
    },
  });
  if (!res.ok && res.status !== 302) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

export function checkCode(code) {
  return Boolean(process.env.STAFF_CODE) && String(code || '').trim().toLowerCase() === process.env.STAFF_CODE.toLowerCase();
}

export function fail(res, status, error) {
  res.status(status).json({ error });
}
