import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'
import Sparkline from './Sparkline'

interface Props {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  accent?: boolean
  trend?: 'up' | 'down' | 'neutral'
  delta?: number          // signed pct, e.g. 4.2 or -1.8
  spark?: number[]        // recent series for inline sparkline
  loading?: boolean
}

function fmtDelta(d: number) {
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(1)}%`
}

export default function KpiCard({
  label, value, sub, icon: Icon, accent, trend, delta, spark, loading,
}: Props) {
  const deltaTrend: 'up' | 'down' | 'neutral' | undefined =
    trend ?? (delta == null ? undefined : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral')

  const sparkColor =
    deltaTrend === 'down' ? '#f87171' :
    deltaTrend === 'neutral' ? '#6e7681' :
    '#00ff88'

  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col gap-3 bg-g-card relative overflow-hidden',
      accent ? 'border-accent/30' : 'border-g-border',
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-g-muted font-medium uppercase tracking-wider">{label}</span>
        {Icon && (
          <span className={clsx(
            'p-1.5 rounded-lg',
            accent ? 'bg-accent/10 text-accent' : 'bg-white/5 text-g-muted'
          )}>
            <Icon size={14} />
          </span>
        )}
      </div>

      <div>
        <div className={clsx(
          'text-2xl font-bold',
          accent ? 'text-accent' : 'text-white',
          loading && 'opacity-40',
        )}>
          {loading ? '…' : value}
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs">
          {delta != null && !loading && (
            <span className={clsx(
              'font-mono',
              deltaTrend === 'up' ? 'text-green-400' :
              deltaTrend === 'down' ? 'text-red-400' :
              'text-g-muted'
            )}>
              {fmtDelta(delta)}
            </span>
          )}
          {sub && (
            <span className={clsx(
              deltaTrend === 'up' && delta == null ? 'text-green-400' :
              deltaTrend === 'down' && delta == null ? 'text-red-400' :
              'text-g-muted'
            )}>
              {sub}
            </span>
          )}
        </div>
      </div>

      {spark && spark.length > 1 && (
        <div className="-mx-4 -mb-4 mt-1 opacity-80">
          <Sparkline data={spark} color={sparkColor} height={36} />
        </div>
      )}
    </div>
  )
}
