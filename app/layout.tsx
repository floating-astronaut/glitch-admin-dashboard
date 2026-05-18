import React from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/active-theme";
import { DEFAULT_THEME } from "@/lib/themes";

// Static export: no server-side cookie reads. Theme preferences are
// applied client-side by ActiveThemeProvider (localStorage-backed),
// with a brief unstyled flash on first paint — the unavoidable
// trade-off for fully-static deploy.

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <ActiveThemeProvider initialTheme={DEFAULT_THEME}>
            {children}
            <NextTopLoader color="var(--primary)" showSpinner={false} height={2} shadow-sm="none" />
            {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
