/**
 * QueryProvider — client-side React Query context for the v2 SPA.
 *
 * Wraps every domain page. Each page's data hooks use react-query
 * for caching + automatic revalidation against admin_api.
 *
 * Defaults tuned for an operator console (not user-facing): 30 s
 * stale, no refetch on window focus (otherwise refresh-by-mistake
 * happens too easily), one retry on failure.
 */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
