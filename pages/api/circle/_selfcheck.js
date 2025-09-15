export default async function handler(_req, res) {
  try {
    const base = (process.env.CIRCLE_API_BASE || "https://api.circle.com/v1/w3s/").replace(/\/+$/,"/");

    const r = await fetch(base + "wallets", {
      headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY || ""}` }
    });

    res.status(r.ok ? 200 : r.status).json({
      ok: r.ok,
      upstreamStatus: r.status,
      json: (r.headers.get("content-type") || "").toLowerCase().includes("application/json"),
      hadApiKey: !!process.env.CIRCLE_API_KEY
    });
  } catch (e) {
    res.status(502).json({ ok:false, error: String(e?.message || e) });
  }
}
