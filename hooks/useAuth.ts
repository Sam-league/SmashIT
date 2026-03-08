'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { setAccessToken, removeAccessToken } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/lib/types'

export function useAuth() {
  const { user, setUser, setLoading, logout: storeLogout } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken')

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/api/users/me')
      setUser(data)
      return data
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<{ accessToken: string; user: User }>(
        '/api/auth/login',
        credentials
      )
      return data
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const { data } = await api.post<{ accessToken: string; user: User }>(
        '/api/auth/register',
        payload
      )
      return data
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/dashboard')
    },
  })

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      removeAccessToken()
      storeLogout()
      queryClient.clear()
      router.push('/login')
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login:    loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError:    loginMutation.error,
    registerError: registerMutation.error,
    isLoginPending:    loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  }
}
