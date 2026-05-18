/**
 * UserMenu — header right-edge avatar dropdown.
 *
 * Reads the signed-in admin from useAuthStore (persist key `glitch-admin-auth`).
 * Kit-shipped Upgrade-to-Pro / Account / Billing / Notifications / Credits
 * widget all stripped — this is a single-tenant operator console; only Log
 * out is wired (clears auth store, bounces to /dashboard/login).
 */
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useAuthStore } from '@/lib/stores/auth'

function initials(email: string): string {
  const local = (email.split('@')[0] || 'a').replace(/[^a-z0-9]/gi, '')
  return (local.slice(0, 2) || 'a').toUpperCase()
}

export default function UserMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const email = user?.email ?? 'admin@glitchexecutor.com'
  const role = user?.role ?? 'admin'

  function handleLogout() {
    logout()
    router.push('/dashboard/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback className="rounded-lg">{initials(email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarFallback className="rounded-lg">{initials(email)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{email}</span>
              <span className="text-muted-foreground truncate text-xs">{role}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
