/**
 * /dashboard/login — single-user admin console sign-in.
 *
 * Single-user model (admin@glitchexecutor.com): email pre-fills, the
 * password input auto-focuses on mount. AuthGuard puts `?from=…` in
 * the query when it redirects here from a deep link — we honour that
 * on successful sign-in. Mirrors the v1 SPA's Login.tsx.
 */
'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { login } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/stores/auth'

const ADMIN_EMAIL = 'admin@glitchexecutor.com'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const sessionExpired = Boolean(from)

  const storeLogin = useAuthStore((s) => s.login)
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      storeLogin(res.access_token, res.user)
      const target = from && from !== '/dashboard/login' ? decodeURIComponent(from) : '/dashboard/sales'
      router.replace(target)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      setError(msg ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-foreground mb-3 inline-flex items-center gap-2">
            <Zap className="text-primary size-6" />
            <span className="text-xl font-semibold">GlitchExecutor</span>
          </div>
          <p className="text-muted-foreground text-sm">Admin Console</p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            Single-user console · sign in as{' '}
            <code className="font-mono">{ADMIN_EMAIL}</code>
          </p>
        </div>

        {sessionExpired && (
          <div className="border-warning/30 bg-warning/10 text-warning-foreground flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertCircle className="mt-0.5 size-3 shrink-0" />
            <span>
              Session expired. Sign in again to return to{' '}
              <code className="font-mono">{from}</code>.
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Bearer JWT against admin-api.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder={ADMIN_EMAIL}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <AlertCircle className="size-3" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
