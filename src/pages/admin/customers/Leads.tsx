import Card from '../../../components/ui/Surface'
import EmptyState from '../../../components/ui/EmptyState'

export default function CustomersLeads() {
  return (
    <Card>
      <EmptyState
        title="Vibe Kit leads — coming next"
        description="The Leads tab pulls from Google Sheets (kit-leads tab) merged with the Resend kit-leads audience. The payment-server endpoint is stubbed; populating + wiring lands in the follow-up session."
      />
    </Card>
  )
}
