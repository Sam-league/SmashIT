'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Show cached data instantly, refetch in background after 30s.
            // This is the "stale-while-revalidate" pattern — no blank screens,
            // no stale data hanging around for minutes.
            staleTime:             30 * 1000,       // 30 seconds
            gcTime:                5 * 60 * 1000,   // keep cache 5 min for background refetch
            retry:                 1,
            refetchOnWindowFocus:  true,            // refresh when user returns to tab
            refetchOnReconnect:    true,            // refresh when network comes back
            refetchOnMount:        true,            // always refetch stale data on mount
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
