/**
 * CreateAdminUserSheet — Sheet drawer for adding an admin/operator
 * account. Plain form, no react-hook-form. POST to admin_api via
 * createAdminUser; on success the parent invalidates the list query.
 */
'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { createAdminUser } from '@/lib/api/endpoints'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateAdminUserSheet({ open, onClose }: Props) {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: () => createAdminUser({ email, password, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setEmail('')
      setPassword('')
      setRole('admin')
      setError('')
      onClose()
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      setError(msg ?? 'Failed to create admin user')
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    mut.mutate()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base">New Admin User</SheetTitle>
          <SheetDescription className="text-[11px]">
            Create an operator account. Password is set now and can be rotated by the
            user post-signin. The single-user binding (admin@glitchexecutor.com) still
            stands at the SSO layer; this is mainly for emergency-access accounts.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@glitchexecutor.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="new-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin (full)</SelectItem>
                <SelectItem value="viewer">viewer (read-only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
              <AlertCircle className="size-3" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={mut.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!email || !password || mut.isPending}>
              <UserPlus className="size-3" />
              {mut.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
