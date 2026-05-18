/**
 * NavUser — sidebar footer row, single-user dashboard.
 *
 * Reads the signed-in admin from useAuthStore (persist key `glitch-admin-auth`).
 * The kit's pravatar/Upgrade/Account/Billing/Notifications menu items are
 * stripped — this is a single-tenant operator console; the only mutation in
 * the dropdown is Log out, which clears the auth store and bounces to
 * /dashboard/login.
 */
'use client'

import { useRouter } from 'next/navigation'

import {
  Avatar, AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar'
import { LogOutIcon } from 'lucide-react'
import { DotsVerticalIcon } from '@radix-ui/react-icons'

import { useAuthStore } from '@/lib/stores/auth'

function initials(email: string): string {
  const local = (email.split('@')[0] || 'a').replace(/[^a-z0-9]/gi, '')
  return (local.slice(0, 2) || 'a').toUpperCase()
}

export function NavUser() {
  const { isMobile } = useSidebar()
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="rounded-full">
                <AvatarFallback className="rounded-lg">{initials(email)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{email}</span>
                <span className="text-muted-foreground truncate text-xs">{role}</span>
              </div>
              <DotsVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
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
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
