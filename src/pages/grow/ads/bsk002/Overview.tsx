import { Megaphone } from 'lucide-react'
import Card from '../../../../components/ui/Surface'
import EmptyState from '../../../../components/ui/EmptyState'

export default function AdsBsk002Overview() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs text-g-muted leading-relaxed">
          BSK-002 is the active Phase-1 commercial wedge: an Ads Agent for
          Shopify D2C India brands. Public landing + lead capture ships out of{' '}
          <code className="text-g-text">glitch-grow-ads-agent-private</code>{' '}
          (see <code className="text-g-text">GROW-WEDGE-1</code>); customers
          will surface here once the per-brand operator backend lands. This
          page is the preview shell so the per-agent IA is in place before
          deployments arrive.
        </p>
      </Card>

      <Card>
        <EmptyState
          icon={Megaphone}
          title="No live campaigns yet"
          description="Campaign spend, ROAS, and CAC will surface here once the first BSK-002 deployment is onboarded and the ads-agent operator API lands."
        />
      </Card>
    </div>
  )
}
