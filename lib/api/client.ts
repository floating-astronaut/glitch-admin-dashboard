import axios from 'axios'
import { useAuthStore } from '../stores/auth'

/**
 * API base URL.
 *
 * Old setup (pre-CF Pages): dashboard SPA + admin_api both lived behind
 * one nginx vhost (dashboard.glitchexecutor.com), so baseURL was '' and
 * everything was same-origin.
 *
 * Now (CF Pages): SPA is served from Cloudflare's edge at
 * dashboard.glitchexecutor.com but admin_api still runs on this server,
 * so the SPA talks to it cross-origin at admin-api.glitchexecutor.com
 * (nginx vhost → docker-bound 127.0.0.1:5004). Auth is JWT bearer in a
 * header, not a cookie, so no withCredentials needed.
 *
 * Override via VITE_API_BASE at build time if you need a different
 * upstream (e.g. local dev pointing at staging admin_api).
 */
export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '')
  || 'https://admin-api.glitchexecutor.com'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
