'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AnalyticsSummary, AnalyticsDailyEntry } from '@/lib/types'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsSummary>('/api/analytics/summary')
      return data
    },
  })
}

export function useAnalyticsDaily(days: 7 | 30 = 7) {
  return useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsDailyEntry[]>(
        `/api/analytics/daily?days=${days}`
      )
      return data
    },
  })
}
