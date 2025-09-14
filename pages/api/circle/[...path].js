export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Debug
  console.log('Debug - req.query:', JSON.stringify(req.query));
  console.log('Debug - req.url:', req.url);

  const base = (process.env.CIRCLE_API_BASE || 'https://api.circle.com/v1/w3s/').replace(/\/+$/, '/') + '';

  // Prefer catch-all param; fallback to parsing the URL so /api/circle/wallets works
  const qp = req.query.path;
  let upstreamPath;
  if (Array.isArray(qp)) upstreamPath = qp.join('/');
  else if (typeof qp === 'string') upstreamPath = qp;
  else {
    const parts = req.url.split('/api/circle/');
    upstreamPath = parts[1] ? parts[1].split('?')[0] : '';
  }

  console.log('Debug - upstreamPath:', upstreamPath);
  if (!upstreamPath) {
    return res.status(400).json({ code: -1, message: 'Missing path', debug: { query: req.query, url: req.url } });
  }

  const url = base + upstreamPath;
  const method = req.method.toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CIRCLE_API_KEY || ''}`,
  };

  let body;
  if (!['GET','HEAD'].includes(method)) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  }

  let resp, text;
  try {
    resp = await fetch(url, { method, headers, body });
    text = await resp.text();
  } catch (e) {
    console.error('Proxy network error:', e?.message || e);
    return res.status(502).json({ code: -2, message: 'Upstream fetch error', error: String(e?.message || e) });
  }

  let data; try { data = JSON.parse(text); } catch { data = text; }
  console.log('Proxy request:', { url, method, status: resp.status, hadAuth: !!process.env.CIRCLE_API_KEY });
  res.status(resp.status).send(typeof data === 'string' ? data : JSON.stringify(data));
}
