/**
 * AuthGuard — client-side gate around the (auth) Next.js route group.
 *
 * Reads the bearer JWT from our Zustand auth store (persisted to
 * localStorage under 'glitch-admin-auth'). If absent, redirects to
 * /dashboard/login with the current path as `from` so a successful
 * sign-in can restore the deep link. Mirrors the AuthGuard pattern
 * from the v1 SPA.
 *
 * Rendered inside (auth)/layout.tsx around {children}. The layout
 * itself stays a Server Component (cookies + theme); only this
 * wrapper is "use client".
 */
'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) {
      const from = encodeURIComponent(pathname ?? '/dashboard')
      router.replace(`/dashboard/login?from=${from}`)
    }
  }, [token, pathname, router])

  if (!token) return null
  return <>{children}</>
}
