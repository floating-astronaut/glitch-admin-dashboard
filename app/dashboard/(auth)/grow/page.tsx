/**
 * /dashboard/grow — Grow vertical overview.
 *
 * Surface-grid landing for the Grow business: Customers (live),
 * Users (preview), Billing (preview). Operator menu under Grow.
 */
'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, CreditCard, MailQuestion, ShoppingCart, Sprout, Users,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { customersBuyers, customersLeads } from '@/lib/api/grow'

function SurfaceCard({
  headline, body, to, icon: Icon, preview,
}: {
  headline: string
  body: string
  to: string
  icon: LucideIcon
  preview?: boolean
}) {
  return (
    <Link
      href={to}
      className="border-border bg-card hover:border-primary/30 hover:bg-primary/5 group flex items-start justify-between gap-3 rounded-xl border p-4 transition-colors">
      <div className="min-w-0">
        <div className="text-muted-foreground/80 flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
          <Icon className="text-muted-foreground group-hover:text-primary size-3" />
          Grow
          {preview && <span className="text-muted-foreground/60 text-[9px]">· preview</span>}
        </div>
        <div className="text-foreground mt-1 text-sm font-semibold">{headline}</div>
        <p className="text-muted-foreground mt-1 text-xs">{body}</p>
      </div>
      <ArrowRight className="text-muted-foreground/60 group-hover:text-primary mt-1 size-4 shrink-0" />
    </Link>
  )
}

export default function GrowOverviewPage() {
  const buyersQ = useQuery({ queryKey: ['grow:buyers'], queryFn: () => customersBuyers({ limit: 1 }), refetchInterval: 60_000 })
  const leadsQ = useQuery({ queryKey: ['grow:leads'], queryFn: customersLeads, refetchInterval: 60_000 })

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <Sprout className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">Grow — Business</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Operator console for the Grow vertical: paid buyers,
            customer-user database, and Grow-side billing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <ShoppingCart className="size-3" />
              Paid buyers
            </div>
            <div className="text-foreground text-xl font-semibold tabular-nums">
              {buyersQ.isLoading ? <Skeleton className="h-6 w-16" /> : (buyersQ.data?.count ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <MailQuestion className="size-3" />
              Vibe Kit leads
            </div>
            <div className="text-foreground text-xl font-semibold tabular-nums">
              {leadsQ.isLoading ? <Skeleton className="h-6 w-16" /> : (leadsQ.data?.count ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <Users className="size-3" />
              Users
            </div>
            <div className="text-muted-foreground/70 text-[11px]">needs Grow operator API</div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="space-y-1.5 py-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <CreditCard className="size-3" />
              Billing
            </div>
            <div className="text-muted-foreground/70 text-[11px]">no paid Grow customers yet</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SurfaceCard
          headline="Customers"
          body="Paid buyers + Vibe Kit lead aggregate."
          to="/dashboard/grow/customers"
          icon={ShoppingCart}
        />
        <SurfaceCard
          headline="Users"
          body="Operator view of Grow's customer-user database."
          to="/dashboard/grow/users"
          icon={Users}
          preview
        />
        <SurfaceCard
          headline="Billing"
          body="Per-brand plans, agent usage, invoices."
          to="/dashboard/grow/billing"
          icon={CreditCard}
          preview
        />
      </div>
    </div>
  )
}
