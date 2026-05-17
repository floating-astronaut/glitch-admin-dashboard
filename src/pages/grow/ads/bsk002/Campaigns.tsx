import { Layers } from 'lucide-react'
import Card from '../../../../components/ui/Surface'
import EmptyState from '../../../../components/ui/EmptyState'

export default function AdsBsk002Campaigns() {
  return (
    <Card>
      <EmptyState
        icon={Layers}
        title="No campaigns wired yet"
        description="Active and paused campaigns across Meta, Google, and TikTok will list here. Each row will link to its creative variants, audience, and spend curve."
      />
    </Card>
  )
}
