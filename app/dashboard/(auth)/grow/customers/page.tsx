/**
 * /dashboard/grow/customers — Buyers tab (default landing).
 *
 * Wired to admin_api GET /api/customers/buyers via lib/api/grow.ts.
 * Filters: free-text email, SKU, provider. Row click pushes
 * ?paymentId=… into the URL which BuyerDetailSheet picks up — deep
 * links to a specific buyer are shareable.
 */
'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { customersBuyers, type Buyer, type BuyerProvider } from '@/lib/api/grow'
import BuyerDetailSheet from '@/components/customers/buyer-detail-sheet'

const SKUS = ['', 'BSK-002', 'BSK-003', 'BSK-004', 'BSK-005', 'BSK-006', 'BSK-007', 'BSK-ALL']
const PROVIDERS: ReadonlyArray<'' | BuyerProvider> = ['', 'stripe', 'razorpay']

function fmtMoney(minor: number, currency: 'USD' | 'INR') {
  const major = minor / 100
  const symbol = currency === 'INR' ? '₹' : '$'
  return `${symbol}${major.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function fulfillmentBadge(b: Buyer) {
  if (b.refunded_at) return <Badge variant="destructive">refunded</Badge>
  if (b.fulfilled_at)
    return <Badge className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-400">fulfilled</Badge>
  return <Badge variant="secondary">pending</Badge>
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<BuyersSkeleton />}>
      <BuyersTable />
    </Suspense>
  )
}

function BuyersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sku = searchParams.get('sku') ?? ''
  const provider = (searchParams.get('provider') ?? '') as '' | BuyerProvider
  const email = searchParams.get('email') ?? ''
  const paymentId = searchParams.get('paymentId')

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  const q = useQuery({
    queryKey: ['buyers', { sku, provider, email }],
    queryFn: () =>
      customersBuyers({
        sku: sku || undefined,
        provider: (provider || undefined) as BuyerProvider | undefined,
        email: email || undefined,
        limit: 200,
      }),
  })

  const buyers = q.data?.buyers ?? []
  const count = q.data?.count ?? 0

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-3">
          <Input
            placeholder="email contains…"
            value={email}
            onChange={(e) => setParam('email', e.target.value)}
            className="w-[220px]"
          />
          <Select value={sku || 'all'} onValueChange={(v) => setParam('sku', v === 'all' ? null : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All SKUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SKUs</SelectItem>
              {SKUS.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={provider || 'all'} onValueChange={(v) => setParam('provider', v === 'all' ? null : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {PROVIDERS.filter(Boolean).map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground ml-auto font-mono text-[11px]">
            {q.isLoading ? '…' : `${count} buyer${count === 1 ? '' : 's'}`}
          </span>
        </CardContent>
      </Card>

      {q.isError ? (
        <Card>
          <CardContent className="text-destructive py-6 text-xs">
            Couldn&apos;t load buyers. <code className="font-mono">/api/customers/buyers</code> returned an error.
          </CardContent>
        </Card>
      ) : q.isLoading ? (
        <BuyersSkeleton />
      ) : buyers.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-xs">
            No buyers match these filters.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Captured</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Codeberg</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((b) => (
                <TableRow
                  key={b.id}
                  onClick={() => setParam('paymentId', b.payment_id)}
                  className={cn('hover:bg-accent cursor-pointer')}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {b.created_at ? (
                      <span title={b.created_at}>
                        {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="font-mono text-[10px]">{b.sku}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs uppercase">{b.provider}</TableCell>
                  <TableCell className="font-mono text-xs">{fmtMoney(b.amount_minor, b.currency)}</TableCell>
                  <TableCell className="text-xs">
                    {b.buyer_name || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{b.email}</TableCell>
                  <TableCell className="text-xs">
                    {b.github_username ? (
                      <span className="text-muted-foreground font-mono">@{b.github_username}</span>
                    ) : (
                      <span className="text-muted-foreground">not linked</span>
                    )}
                  </TableCell>
                  <TableCell>{fulfillmentBadge(b)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <BuyerDetailSheet paymentId={paymentId} onClose={() => setParam('paymentId', null)} />
    </div>
  )
}

function BuyersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
