/**
 * System › Settings — environment configuration status.
 *
 * v1.4 dedup: this page used to carry three tabs (Users / Audit /
 * Environment). Users moved to /system/users (UserManagement) and
 * Audit moved to /system/audit-logs (AuditLogs); both now have
 * dedicated pages. Settings is single-purpose now — env var
 * presence flags, with values intentionally never displayed.
 */
import { useQuery } from '@tanstack/react-query'
import { Check, X, ShieldCheck, Settings as SettingsIcon } from 'lucide-react'
import { getEnvStatus } from '../../api/endpoints'
import Card from '../../components/ui/Surface'
import KpiCard from '../../components/ui/KpiCard'

export default function Settings() {
  const { data: envStatus, isLoading } = useQuery({
    queryKey: ['envStatus'],
    queryFn: getEnvStatus,
    refetchInterval: 60_000,
  })

  const entries = envStatus ? Object.entries(envStatus) : []
  const present = entries.filter(([, ok]) => ok).length
  const missing = entries.filter(([, ok]) => !ok).length
  const total   = entries.length

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <SettingsIcon size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">System · Settings</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Environment-variable presence flags for{' '}
            <code className="font-mono">admin_api</code>. Admin users
            live at <a href="/system/users" className="text-accent hover:underline">/system/users</a>;
            audit log at <a href="/system/audit-logs" className="text-accent hover:underline">/system/audit-logs</a>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Tracked vars"
          value={isLoading ? '…' : total}
          icon={SettingsIcon}
        />
        <KpiCard
          label="Present"
          value={isLoading ? '…' : present}
          icon={Check}
          accent={total > 0 && missing === 0}
          trend={missing === 0 ? 'up' : 'neutral'}
        />
        <KpiCard
          label="Missing"
          value={isLoading ? '…' : missing}
          icon={X}
          accent={missing > 0}
          trend={missing > 0 ? 'down' : 'neutral'}
        />
      </div>

      <Card>
        <div className="flex items-center gap-2 text-xs text-g-muted mb-3">
          <ShieldCheck size={14} className="text-accent" />
          Values are never displayed — only presence is indicated.
        </div>
        {isLoading ? (
          <p className="text-xs text-g-dim py-4">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-g-dim py-4">No environment vars tracked.</p>
        ) : (
          <div className="space-y-2">
            {entries
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, ok]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-g-deep border border-g-border rounded-lg px-3 py-2"
                >
                  <span className="font-mono text-xs text-g-text">{key}</span>
                  {ok
                    ? <Check size={14} className="text-emerald-400" />
                    : <X size={14} className="text-red-400" />
                  }
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}
