/**
 * Zustand auth store — ported from the v1 SPA at src/stores/auth.ts.
 *
 * Single-user model (admin@glitchexecutor.com): the SSO-side enforces
 * who can authenticate; the dashboard just persists the bearer JWT +
 * the user shape that admin_api's /auth/login returns.
 *
 * Persist key 'glitch-admin-auth' kept identical to the v1 store so
 * any sessions still active in a tab survive the v2 swap.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  email: string
  role: string
}

interface AuthState {
  token: string | null
  user: AdminUser | null
  login: (token: string, user: AdminUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'glitch-admin-auth' },
  ),
)
