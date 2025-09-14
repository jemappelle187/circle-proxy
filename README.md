# Circle API Proxy

A Vercel-based proxy for Circle API requests with health monitoring.

## Smoke test

```bash
curl -s "https://circle-proxy.vercel.app/api/circle/_health" | jq .
```

## Environment Variables

- `CIRCLE_API_KEY`: Your Circle API key (set in Vercel)
- `CIRCLE_API_BASE`: Circle API base URL (defaults to https://api.circle.com/v1/w3s/)

## Endpoints

- `GET /api/circle/_health` - Health check endpoint
- `GET /api/circle/wallets` - Proxy to Circle wallets endpoint
- `GET /api/circle/walletSets` - Proxy to Circle wallet sets endpoint
- `GET /api/circle/[...path]` - Dynamic proxy for any Circle API endpoint

## Health Check Response

```json
{
  "ok": true,
  "proxy": "ok",
  "circleBase": "https://api.circle.com/v1/w3s/",
  "hadApiKey": true,
  "circleReachable": true,
  "code": 200,
  "details": { ... }
}
```

- `ok: true` - Everything working perfectly
- `code: 401` - Circle reachable but credentials issue
- `code: 502` - Network/connectivity issue
