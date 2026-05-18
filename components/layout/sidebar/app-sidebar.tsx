/**
 * AppSidebar — Glitch Admin Console v2 shell.
 *
 * The kit ships a multi-project picker in the header (E-commerce / Blog
 * Platform / +New Project) and an "Unlock Everything" upgrade card in the
 * footer. Both are template placeholders — this dashboard is single-tenant
 * and we own the kit license, so they're stripped.
 */
'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/layout/sidebar/nav-main'
import { NavUser } from '@/components/layout/sidebar/nav-user'
import { ScrollArea } from '@/components/ui/scroll-area'
import Logo from '@/components/layout/logo'
import { useIsTablet } from '@/hooks/use-mobile'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen, setOpenMobile, isMobile } = useSidebar()
  const isTablet = useIsTablet()

  useEffect(() => {
    if (isMobile) setOpenMobile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    setOpen(!isTablet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTablet])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0!" asChild>
              <a href="/dashboard/system/today" className="flex items-center gap-2">
                <Logo />
                <span className="text-foreground font-semibold">Glitch Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
