import axios from 'axios'
import { useAuthStore } from '../stores/auth'

/**
 * API base URL.
 *
 * CF Pages SPA at dashboard.glitchexecutor.com talks to admin_api
 * cross-origin at admin-api.glitchexecutor.com (nginx → docker-bound
 * 127.0.0.1:5004). Auth is JWT bearer in a header, not a cookie, so
 * no withCredentials needed.
 *
 * Override via NEXT_PUBLIC_API_BASE at build time for staging /
 * port-forward dev. (v1 used VITE_API_BASE — renamed in the
 * v2 swap to bundui kit.)
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '')
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
      // window is undefined during Next.js SSR; gate the redirect.
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
