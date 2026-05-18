/**
 * /dashboard/system/users — admin/operator users.
 *
 * v1.4 IA: this is the admin-user surface only. Customer-user
 * accounts belong to their owning vertical (Trade · Users etc.).
 *
 * Wired to admin_api /api/settings/* via lib/api/endpoints:
 *   GET   /api/settings/users          list admins
 *   POST  /api/settings/users          create (via Sheet drawer)
 *   PATCH /api/settings/users/:id      role + is_active toggles
 */
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Plus, RefreshCw, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { getAdminUsers, updateAdminUser } from '@/lib/api/endpoints'
import CreateAdminUserSheet from '@/components/users/create-admin-user-sheet'

interface AdminUser {
  id: number
  email: string
  role: string
  is_active: boolean
  created_at: string | null
  last_login: string | null
}

export default function AdminUsersPage() {
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const q = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
    refetchInterval: 60_000,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { role?: string; is_active?: boolean } }) =>
      updateAdminUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users = q.data ?? []

  return (
    <div className="space-y-4 p-(--content-padding)">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
          <ShieldCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-base font-semibold">User Management</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Admin/operator accounts and the platform audit trail. Customer users
            live under their owning vertical (Trade · Users, etc.).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => q.refetch()}>
          <RefreshCw className={cn('size-3', q.isRefetching && 'animate-spin')} /> Refresh
        </Button>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-3" /> New admin user
        </Button>
      </div>

      <Card>
        {q.isError ? (
          <CardContent className="text-destructive py-6 text-xs">
            Couldn&apos;t load admin users. <code className="font-mono">/api/settings/users</code> returned an error.
          </CardContent>
        ) : q.isLoading ? (
          <CardContent className="space-y-2 py-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent className="text-muted-foreground py-6 text-center text-xs">
            No admin users — the seed has not run yet, or the table is empty.
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-[160px]">Role</TableHead>
                <TableHead className="w-[100px]">Active</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="font-mono text-xs">{u.email}</span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => update.mutate({ id: u.id, data: { role: v } })}
                      disabled={update.isPending}>
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="viewer">viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.is_active}
                        onCheckedChange={(v) => update.mutate({ id: u.id, data: { is_active: v } })}
                        disabled={update.isPending}
                      />
                      {u.is_active ? (
                        <Badge variant="secondary" className="text-[10px]">active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">disabled</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {u.last_login ? (
                      <span title={u.last_login}>
                        {formatDistanceToNow(new Date(u.last_login), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {u.created_at ? (
                      <span title={u.created_at}>
                        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-3 text-[11px]">
          Single-user binding: SSO enforces that only <code className="font-mono">admin@glitchexecutor.com</code> can
          authenticate. Extra rows here are for emergency-access accounts —{' '}
          <code className="font-mono">disabled</code> toggle blocks login immediately; mutations land in the audit log
          at <a href="/dashboard/system/audit-logs" className="text-primary hover:underline">/system/audit-logs</a>.
        </CardContent>
      </Card>

      <CreateAdminUserSheet open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
