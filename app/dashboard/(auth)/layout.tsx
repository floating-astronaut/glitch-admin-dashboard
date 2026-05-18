import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import AuthGuard from "@/components/auth/AuthGuard";

// Static export: no server-side cookie reads. The kit used `cookies()`
// to avoid theme flash on first paint; with `output: 'export'` we
// accept a brief flash and let ActiveThemeProvider (client component,
// localStorage-backed) settle the theme on hydration. Sidebar
// defaultOpen falls back to true.

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
          "--content-padding": "calc(var(--spacing) * 4)",
          "--content-margin": "calc(var(--spacing) * 1.5)",
          "--content-full-height":
            "calc(100vh - var(--header-height) - (var(--content-padding) * 2) - (var(--content-margin) * 2))"
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="bg-muted/40 flex flex-1 flex-col">
          <div className="@container/main p-(--content-padding) xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
