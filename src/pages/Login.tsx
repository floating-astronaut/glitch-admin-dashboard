import { useState, useRef, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, AlertCircle } from 'lucide-react'
import { login } from '../api/endpoints'
import { useAuthStore } from '../stores/auth'

/**
 * Login — single-user admin console (v1.4 IA).
 *
 * The admin dashboard binds to admin@glitchexecutor.com as the sole
 * account; the email field is pre-filled and the form auto-focuses
 * the password input. If AuthGuard redirected the user here from a
 * deep link, we restore that path on successful sign-in via the
 * `from` location state.
 */
const ADMIN_EMAIL = 'admin@glitchexecutor.com'

interface LocationStateFrom {
  from?: { pathname?: string }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: storeLogin } = useAuthStore()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const from = (location.state as LocationStateFrom | null)?.from?.pathname
  const sessionExpired = Boolean(from)

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
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-g-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap size={28} className="text-accent" />
            <span className="text-xl font-bold text-white">GlitchExecutor</span>
          </div>
          <p className="text-g-muted text-sm">Admin Dashboard</p>
          <p className="text-g-dim text-[11px] mt-1">
            Single-user console · sign in as{' '}
            <code className="font-mono text-g-text">{ADMIN_EMAIL}</code>
          </p>
        </div>

        {sessionExpired && (
          <div className="flex items-start gap-2 text-yellow-300 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-4">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span>
              Session expired. Sign in again to return to{' '}
              <code className="font-mono">{from}</code>.
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-g-card border border-g-border rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-g-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-g-deep border border-g-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-g-dim focus:outline-none focus:border-accent/50 transition-colors"
              placeholder={ADMIN_EMAIL}
            />
          </div>

          <div>
            <label className="block text-xs text-g-muted mb-1.5">Password</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-g-deep border border-g-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-g-dim focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
