/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional override for the admin_api base URL. Defaults to
   * https://admin-api.glitchexecutor.com — the nginx vhost that fronts
   * the FastAPI service on this host. Set to e.g.
   * http://localhost:5004 for local dev against a port-forwarded API.
   */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
