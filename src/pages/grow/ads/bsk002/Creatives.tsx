import { Film } from 'lucide-react'
import Card from '../../../../components/ui/Surface'
import EmptyState from '../../../../components/ui/EmptyState'

export default function AdsBsk002Creatives() {
  return (
    <Card>
      <EmptyState
        icon={Film}
        title="No creatives generated yet"
        description="Generated ad variants (image / video / copy) and the winning combinations from creative tests will live here. Sourced from the ads-agent generation pipeline."
      />
    </Card>
  )
}
