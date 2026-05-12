import { FileClock } from 'lucide-react'
import Card from '../../components/ui/Card'
import Section from '../../components/ui/Section'
import EmptyState from '../../components/ui/EmptyState'

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <FileClock size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Audit Logs</h1>
          <p className="text-xs text-g-muted mt-0.5">
            Append-only record of administrative actions: logins, permission
            changes, manual overrides, control-plane decisions, and approvals.
          </p>
        </div>
      </div>

      <Section title="Recent Events">
        <Card>
          <EmptyState
            title="Audit log stream not wired yet"
            description="When the admin_api emits structured audit events into the dedicated table, they will stream here with actor, target, action, and outcome."
          />
        </Card>
      </Section>
    </div>
  )
}
