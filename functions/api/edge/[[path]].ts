/**
 * CF Pages Function — proxy /api/edge/* on the admin dashboard to
 * glitch-edge-api at https://edge-app.glitchexecutor.com/api/*.
 *
 * Why a proxy (and not a direct fetch from the browser):
 *   edge-api's CORS allowlist is locked to edge.glitchexecutor.com +
 *   edge-app.glitchexecutor.com (see glitch-edge-api/src/glitch_edge_api/
 *   main.py). Browser requests from dashboard.glitchexecutor.com would
 *   be blocked. Editing the edge-api CORS list is out of scope for
 *   ADMIN-1e (cross-repo). Proxying same-origin via Pages Functions
 *   sidesteps CORS entirely.
 *
 * Scope: read-only operational visibility — healthz / readyz today.
 * Authed routes (/v1/me, /v1/bets, /v1/strategies, ...) are not
 * usable from here because the admin dashboard's JWT is issued by
 * admin-api, not edge-api. Those surface when an admin/operator API
 * lands upstream (out of scope for ADMIN-1e).
 */
interface Env {}

const UPSTREAM = 'https://edge-app.glitchexecutor.com/api'

export const onRequest: PagesFunction<Env> = async ({ request, params }) => {
  const segments = params.path
  const tail = Array.isArray(segments) ? segments.join('/') : (segments ?? '')
  const url = new URL(request.url)
  const target = `${UPSTREAM}/${tail}${url.search}`

  const init: RequestInit = {
    method: request.method,
    headers: stripHopByHop(request.headers),
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  }

  const upstream = await fetch(target, init)
  const headers = new Headers(upstream.headers)
  headers.delete('access-control-allow-origin')
  headers.delete('access-control-allow-credentials')
  return new Response(upstream.body, { status: upstream.status, headers })
}

function stripHopByHop(h: Headers): Headers {
  const out = new Headers(h)
  for (const k of ['host', 'connection', 'content-length', 'cf-connecting-ip', 'cf-ipcountry']) {
    out.delete(k)
  }
  return out
}
