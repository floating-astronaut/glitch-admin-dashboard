/**
 * Edge vertical API — talks to glitch-edge-api via the CF Pages
 * Function proxy at /api/edge/* (functions/api/edge/[[path]].ts).
 *
 * Today only the unauthed health endpoints are usable from the admin
 * dashboard. Per-user reads (/v1/me, /v1/bets, ...) require an edge-api
 * JWT that the admin dashboard does not hold; those wait for an
 * admin/operator API on edge-api (out of scope for ADMIN-1e).
 */
import axios from 'axios'

const edge = axios.create({
  baseURL: '/api/edge',
  timeout: 8000,
})

export interface EdgeHealth {
  ok: boolean
  service: string
  env: string
}

export interface EdgeReady {
  ok: boolean
  db: string
}

export const edgeHealthz = () =>
  edge.get<EdgeHealth>('/healthz').then(r => r.data)

export const edgeReadyz = () =>
  edge.get<EdgeReady>('/readyz').then(r => r.data)
