import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Mail, GitBranch, Receipt, MessageSquare, RotateCcw,
} from 'lucide-react'
import {
  customersBuyer, customersRefund, customersResendWelcome,
  customersReinviteCodeberg, customersAddNote,
} from '../../../api/grow'
import Card from '../../../components/ui/Surface'
import Section from '../../../components/ui/Section'
import StatusBadge from '../../../components/ui/StatusBadge'
import Skeleton from '../../../components/ui/SkeletonBlock'
import ErrorState from '../../../components/ui/ErrorState'
import FulfillmentTimeline from '../../../components/customers/FulfillmentTimeline'
import { useState } from 'react'

function fmtMoney(minor: number, currency: 'USD' | 'INR') {
  const major = minor / 100
  const symbol = currency === 'INR' ? '₹' : '$'
  return `${symbol}${major.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export default function BuyerDetail() {
  const { paymentId = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', 'buyer', paymentId],
    queryFn: () => customersBuyer(paymentId),
    enabled: !!paymentId,
    refetchInterval: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['customers', 'buyer', paymentId] })

  const resendMut = useMutation({
    mutationFn: () => customersResendWelcome(paymentId),
    onSuccess: invalidate,
  })
  const reinviteMut = useMutation({
    mutationFn: (gh?: string) => customersReinviteCodeberg(paymentId, gh),
    onSuccess: invalidate,
  })
  const refundMut = useMutation({
    mutationFn: (reason: string) => customersRefund({ payment_id: paymentId, reason }),
    onSuccess: invalidate,
  })
  const noteMut = useMutation({
    mutationFn: (note: string) => customersAddNote(paymentId, note),
    onSuccess: invalidate,
  })

  const [noteDraft, setNoteDraft] = useState('')

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load buyer"
        description={`No record for payment_id "${paymentId}", or the customers proxy is unreachable.`}
        onRetry={() => refetch()}
      />
    )
  }

  const buyer = data?.buyer
  const sinks = data?.sinks
  const refunded = !!buyer?.refunded_at

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/customers')}
        className="flex items-center gap-1.5 text-xs text-g-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={12} /> Back to buyers
      </button>

      {/* Top card */}
      <Card>
        {isLoading || !buyer ? (
          <div className="space-y-2">
            <Skeleton height={14} width="40%" />
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="50%" />
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-white">{buyer.buyer_name || buyer.email}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
                  {buyer.sku}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-g-dim">
                  {buyer.provider}
                </span>
                {refunded && <StatusBadge value="offline" dot />}
                {data?.stub && (
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 py-0.5">
                    stub detail
                  </span>
                )}
              </div>
              <div className="text-xs text-g-muted font-mono">{buyer.email}</div>
              <div className="text-xs text-g-muted font-mono">payment_id: {buyer.payment_id}</div>
              {buyer.github_username && (
                <div className="text-xs text-g-muted font-mono">codeberg: @{buyer.github_username}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{fmtMoney(buyer.amount_minor, buyer.currency)}</div>
              <div className="text-[10px] text-g-dim">
                captured {buyer.created_at ? new Date(buyer.created_at).toLocaleString() : '—'}
              </div>
              {buyer.fulfilled_at && (
                <div className="text-[10px] text-g-dim">fulfilled {new Date(buyer.fulfilled_at).toLocaleString()}</div>
              )}
              {refunded && (
                <div className="text-[10px] text-red-300">refunded {new Date(buyer.refunded_at!).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Fulfillment timeline */}
        <Section title="Fulfillment timeline">
          {isLoading || !sinks ? (
            <Skeleton height={280} />
          ) : (
            <FulfillmentTimeline sinks={sinks} refunded={refunded} />
          )}
        </Section>

        {/* Action panel */}
        <Section title="Actions">
          <Card className="space-y-2">
            <ActionRow
              icon={Mail}
              label="Resend welcome email"
              busy={resendMut.isPending}
              done={resendMut.isSuccess}
              error={resendMut.isError}
              onClick={() => resendMut.mutate()}
            />
            <ActionRow
              icon={GitBranch}
              label="Re-fire Codeberg invite"
              busy={reinviteMut.isPending}
              done={reinviteMut.isSuccess}
              error={reinviteMut.isError}
              onClick={() => reinviteMut.mutate(undefined)}
            />
            <ActionRow
              icon={Receipt}
              label="Issue refund"
              busy={refundMut.isPending}
              done={refundMut.isSuccess}
              error={refundMut.isError}
              disabled={refunded}
              onClick={() => {
                if (!confirm('Issue a full refund? This marks the row refunded_at=now() and (eventually) calls the provider.')) return
                refundMut.mutate('admin-dashboard refund')
              }}
            />
            <ActionRow
              icon={RotateCcw}
              label="Mark manual fulfillment"
              disabled
              hint="for BSK-004 GitHub-suspension legacy"
            />
          </Card>

          <Card className="space-y-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <MessageSquare size={12} className="text-accent" /> Add note
            </div>
            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Free-form ops note — appended to notes.ops_notes[]"
              className="w-full bg-g-deep border border-g-border rounded-md px-2 py-1.5 text-xs text-white placeholder:text-g-dim outline-none focus:border-accent/40"
            />
            <button
              disabled={!noteDraft.trim() || noteMut.isPending}
              onClick={() => {
                noteMut.mutate(noteDraft.trim(), {
                  onSuccess: () => setNoteDraft(''),
                })
              }}
              className="w-full text-xs px-2 py-1.5 rounded-md border border-g-border text-g-text hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {noteMut.isPending ? 'Saving…' : 'Save note'}
            </button>
            {noteMut.isError && <p className="text-[10px] text-red-300">Save failed</p>}
            {noteMut.isSuccess && <p className="text-[10px] text-green-300">Saved</p>}
          </Card>
        </Section>
      </div>

      {/* Activity log */}
      <Section title="Activity">
        <Card>
          {data?.activity && data.activity.length > 0 ? (
            <ul className="text-xs text-g-muted space-y-1.5 font-mono">
              {data.activity.map((a, i) => (
                <li key={i}>
                  <span className="text-g-dim">{a.at}</span>{' · '}
                  <span className="text-accent">{a.kind}</span>
                  {a.detail && <> · {a.detail}</>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-g-muted">
              Activity log will populate once the payment-server detail endpoint
              merges webhook receipts, CAPI fires, and refund actions.
            </p>
          )}
        </Card>
      </Section>
    </div>
  )
}

function ActionRow({
  icon: Icon, label, busy, done, error, disabled, onClick, hint,
}: {
  icon: any; label: string; busy?: boolean; done?: boolean; error?: boolean;
  disabled?: boolean; onClick?: () => void; hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className="w-full flex items-center justify-between gap-3 text-left px-2 py-1.5 rounded-md border border-g-border hover:border-accent/40 hover:bg-accent/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <span className="flex items-center gap-2 text-xs text-g-text">
        <Icon size={14} className="text-g-muted" />
        {label}
        {hint && <span className="text-[10px] text-g-dim">({hint})</span>}
      </span>
      <span className="text-[10px] text-g-dim">
        {busy ? 'sending…' : error ? 'error' : done ? 'done' : ''}
      </span>
    </button>
  )
}
