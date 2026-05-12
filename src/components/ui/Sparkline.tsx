import { ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Props {
  data: number[]
  color?: string
  height?: number
  fill?: boolean
}

export default function Sparkline({ data, color = '#00ff88', height = 32, fill = true }: Props) {
  if (!data || data.length === 0) {
    return <div style={{ height }} className="w-full" />
  }
  const points = data.map((v, i) => ({ i, v }))
  const id = `spark-${color.replace('#', '')}`
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={fill ? `url(#${id})` : 'none'}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
