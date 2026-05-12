import { CheckCircle2, Circle, AlertCircle, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import type { BuyerDetailResponse, SinkState } from '../../api/grow'

const ROWS: { key: keyof BuyerDetailResponse['sinks']; label: string; detail: (s: SinkState) => React.ReactNode }[] = [
  { key: 'payment_captured', label: 'Payment captured',
    detail: s => s.at ? new Date(s.at).toLocaleString() : '—' },
  { key: 'ledger_write',     label: 'Postgres ledger write',
    detail: s => s.at ? new Date(s.at).toLocaleString() : '—' },
  { key: 'welcome_email',    label: 'Welcome email sent',
    detail: s => s.message_id
      ? <span className="font-mono text-[10px] text-g-muted">{String(s.message_id).slice(0, 18)}…</span>
      : 'pending' },
  { key: 'codeberg_invite',  label: 'Codeberg collaborator invite',
    detail: s => Array.isArray(s.repos) && s.repos.length > 0
      ? <span className="text-xs text-g-muted">{s.repos.length} repo(s)</span>
      : <span className="text-g-dim text-xs">live-poll pending</span> },
  { key: 'discord_role',     label: 'Discord role granted',
    detail: s => s.linked ? 'linked' : <span className="text-g-dim text-xs">not linked</span> },
  { key: 'capi_meta',        label: 'Meta CAPI Purchase event',
    detail: s => s.event_id
      ? <span className="font-mono text-[10px] text-g-muted">event_id={String(s.event_id).slice(0, 12)}…</span>
      : '—' },
  { key: 'capi_tiktok',      label: 'TikTok CAPI Purchase event',
    detail: s => s.event_id
      ? <span className="font-mono text-[10px] text-g-muted">event_id={String(s.event_id).slice(0, 12)}…</span>
      : '—' },
]

function statusIcon(status: SinkState['status']) {
  if (status === 'ok') return <CheckCircle2 size={14} className="text-green-400" />
  if (status === 'failed') return <AlertCircle size={14} className="text-red-400" />
  if (status === 'stub') return <Circle size={14} className="text-blue-400" />
  return <Circle size={14} className="text-g-dim" />
}

interface Props {
  sinks: BuyerDetailResponse['sinks']
  refunded?: boolean
}

export default function FulfillmentTimeline({ sinks, refunded }: Props) {
  return (
    <ol className="space-y-2">
      {ROWS.map(({ key, label, detail }) => {
        const s = sinks[key]
        return (
          <li
            key={key}
            className={clsx(
              'flex items-start gap-3 rounded-lg border bg-g-card px-3 py-2.5',
              'border-g-border',
              refunded && 'opacity-60'
            )}
          >
            <div className="pt-0.5">{statusIcon(s.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={clsx('text-sm', refunded ? 'line-through text-g-muted' : 'text-white')}>
                  {label}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-g-dim">{s.status}</span>
              </div>
              <div className="text-xs text-g-muted mt-0.5">{detail(s)}</div>
            </div>
            {key.startsWith('capi_') && s.event_id && (
              <span className="text-g-dim mt-0.5 shrink-0" title="External Events Manager link TBD">
                <ExternalLink size={12} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
