export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const base = (process.env.CIRCLE_API_BASE || 'https://api.circle.com/v1/w3s/').replace(/\/+$/, '/') + '';
  const keySet = !!process.env.CIRCLE_API_KEY;

  // Default shape
  const result = {
    ok: false,
    proxy: 'ok',
    circleBase: base,
    hadApiKey: keySet,
    circleReachable: false,
    code: null,
    details: null,
  };

  try {
    // Minimal upstream ping — wallets listing is a safe GET
    const resp = await fetch(base + 'wallets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(keySet ? { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` } : {}),
      },
    });

    result.code = resp.status;
    const text = await resp.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }

    // Treat 200/401 as "reachable" (401 means routing works but credentials blocked)
    result.circleReachable = resp.status === 200 || resp.status === 401;
    result.details = typeof data === 'string' ? data.slice(0, 300) : data;

    // ok only when Circle is reachable AND we got 200
    result.ok = resp.status === 200;

    // Return with the same upstream code when possible (or 200 with ok=false)
    const status = [200,401,403,404,429,500].includes(resp.status) ? resp.status : 200;
    res.status(status).json(result);
  } catch (e) {
    result.details = String(e?.message || e);
    result.code = -1;
    res.status(502).json(result);
  }
}
