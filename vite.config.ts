import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { execSync } from 'node:child_process'

// Build-info injection — surfaced on System › Settings so the operator
// can confirm at 3 AM "am I on the latest build?" without fetching the
// HTML head. Best-effort: git lookups silently fall back to 'unknown'
// when the build host has no git (e.g. inside the CF Pages container).
function gitShort(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}
function gitBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(gitShort()),
    __BUILD_BRANCH__: JSON.stringify(gitBranch()),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
