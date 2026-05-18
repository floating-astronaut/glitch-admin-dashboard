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

// Build-info constants injected by vite.config.ts via `define`.
// Surfaced on /system/settings so the operator can confirm which
// build is live without fetching index.html or hitting the box.
declare const __BUILD_TIMESTAMP__: string
declare const __BUILD_SHA__: string
declare const __BUILD_BRANCH__: string
