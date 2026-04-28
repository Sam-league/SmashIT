'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            5 * 60 * 1000,  // 5 min — avoid redundant refetches
            gcTime:               10 * 60 * 1000, // 10 min cache retention
            retry:                1,
            refetchOnWindowFocus: false,           // don't refetch on every tab switch
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
