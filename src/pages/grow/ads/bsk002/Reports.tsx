import { BarChart3 } from 'lucide-react'
import Card from '../../../../components/ui/Surface'
import EmptyState from '../../../../components/ui/EmptyState'

export default function AdsBsk002Reports() {
  return (
    <Card>
      <EmptyState
        icon={BarChart3}
        title="No performance data yet"
        description="Spend, ROAS, CAC, and per-creative performance will surface here once the first deployment runs paid traffic. Daily and weekly roll-ups by channel."
      />
    </Card>
  )
}
