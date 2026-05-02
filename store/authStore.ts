'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'

interface AuthState {
  user:       User | null
  isLoading:  boolean
  setUser:    (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout:     () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:      null,
      isLoading: true,
      setUser:    (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout:     () => set({ user: null }),
    }),
    {
      name: 'smashit-auth',
      // Only persist identity fields (name, email, _id) so the app can render
      // the user's name/greeting instantly on refresh. Dynamic values like
      // points and streak are intentionally excluded — they come from the
      // server query and should never show a stale cached number.
      partialize: (state) => ({
        user: state.user
          ? {
              _id:       state.user._id,
              name:      state.user.name,
              email:     state.user.email,
              // Zero-out dynamic fields — they'll be populated by the /me fetch
              points:        0,
              currentStreak: 0,
              bestStreak:    0,
              createdAt:     state.user.createdAt,
            }
          : null,
      }),
    }
  )
)
