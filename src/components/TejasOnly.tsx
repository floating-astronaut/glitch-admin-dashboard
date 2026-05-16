/**
 * TejasOnly — route guard for surfaces locked to one operator email.
 *
 * The "Trade · Engine (personal)" section in AppSidebar (Bots /
 * Signals / Trades / Oracle / News) exposes proprietary engine
 * internals that aren't meant to be shared with future operators.
 * Wrap each Route element in <TejasOnly> so direct URL access also
 * 403s (sidebar already hides the links via gateEmail filter).
 *
 * Keep OPERATOR_EMAIL in lockstep with the same constant in
 * AppSidebar.tsx — if the address rotates, change both.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

const OPERATOR_EMAIL = 'tejaskagrawalgwl@gmail.com'

export function TejasOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const loc = useLocation()
  const email = (user?.email ?? '').toLowerCase()
  if (email !== OPERATOR_EMAIL) {
    // Soft redirect to dashboard home rather than a 404; less jarring
    // for an admin who clicked a deep link they don't have access to.
    return <Navigate to="/" replace state={{ from: loc.pathname }} />
  }
  return <>{children}</>
}
