'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Check, X, ChevronRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import type { FriendUser, PopulatedFriendship } from '@/lib/types'

interface SearchUser {
  _id:           string
  name:          string
  email:         string
  points:        number
  currentStreak: number
}

function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get<PopulatedFriendship[]>('/api/friends')
      return data
    },
  })
}

function usePending() {
  return useQuery({
    queryKey: ['friends', 'pending'],
    queryFn: async () => {
      const { data } = await api.get<PopulatedFriendship[]>('/api/friends/pending')
      return data
    },
  })
}

function useSearch(q: string) {
  return useQuery({
    queryKey: ['friends', 'search', q],
    queryFn: async () => {
      const { data } = await api.get<SearchUser[]>(`/api/friends/search?q=${encodeURIComponent(q)}`)
      return data
    },
    enabled: q.trim().length >= 2,
  })
}

export default function FriendsPage() {
  const router      = useRouter()
  const qc          = useQueryClient()
  const user        = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')

  const { data: friends  = [] } = useFriends()
  const { data: pending  = [] } = usePending()
  const { data: results  = [] } = useSearch(search)

  const sendRequest = useMutation({
    mutationFn: (targetUserId: string) =>
      api.post('/api/friends/request', { targetUserId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  })

  const acceptRequest = useMutation({
    mutationFn: (id: string) => api.patch(`/api/friends/${id}/accept`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] })
      qc.invalidateQueries({ queryKey: ['friends', 'pending'] })
    },
  })

  const declineRequest = useMutation({
    mutationFn: (id: string) => api.delete(`/api/friends/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends', 'pending'] }),
  })

  // Extract friend (not-me) from populated friendship
  const friendUsers: (FriendUser & { friendshipId: string })[] = friends.map((f) => {
    const friend = f.userId._id.toString() === user?._id ? f.friendId : f.userId
    return { ...friend, friendshipId: f._id }
  })

  const showSearch = search.trim().length >= 2

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-normal">Friends</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users to add…"
            className="w-full pl-9 pr-4 py-[11px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Search results */}
        {showSearch && (
          <div className="flex flex-col gap-2">
            <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
              Results
            </span>
            {results.length === 0 ? (
              <p className="text-[13px] text-muted text-center py-4">No users found</p>
            ) : (
              results.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-2.5 bg-surface border border-border rounded-card p-[11px_13px] shadow-card"
                >
                  <div className="w-[38px] h-[38px] rounded-full bg-bg border-[1.5px] border-border flex items-center justify-center text-lg flex-shrink-0">
                    😎
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-dark truncate">{u.name}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {u.points} pts · {u.currentStreak > 0 ? `🔥 ${u.currentStreak}d streak` : 'No streak'}
                    </p>
                  </div>
                  <button
                    onClick={() => sendRequest.mutate(u._id)}
                    disabled={sendRequest.isPending}
                    className="flex items-center gap-1 px-3 py-[6px] rounded-full bg-dark text-white font-syne text-[10px] font-bold active:opacity-80 disabled:opacity-50"
                  >
                    <UserPlus size={11} />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {!showSearch && (
          <>
            {/* Pending requests */}
            {pending.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
                  Pending · {pending.length}
                </span>
                {pending.map((req) => {
                  const sender = req.userId
                  return (
                    <div
                      key={req._id}
                      className="flex items-center gap-2.5 bg-surface border border-border rounded-card p-[12px_13px] shadow-card"
                    >
                      <div className="w-[38px] h-[38px] rounded-full bg-bg border-[1.5px] border-border flex items-center justify-center text-lg flex-shrink-0">
                        🧑
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-dark truncate">{sender.name}</p>
                        <p className="text-[10px] text-muted mt-0.5">Sent you a request</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => acceptRequest.mutate(req._id)}
                          className="px-3 py-[6px] rounded-full bg-dark text-white font-syne text-[10px] font-bold active:opacity-80"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest.mutate(req._id)}
                          className="px-3 py-[6px] rounded-full border border-border text-muted font-syne text-[10px] font-bold active:opacity-80"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Friends list */}
            <div className="flex flex-col gap-2">
              <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
                Friends · {friendUsers.length}
              </span>

              {friendUsers.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <span className="text-3xl">👥</span>
                  <p className="text-[14px] font-semibold text-dark">No friends yet</p>
                  <p className="text-[12px] text-muted text-center">Search above to find people to add</p>
                </div>
              ) : (
                friendUsers
                  .sort((a, b) => b.points - a.points)
                  .map((f) => (
                    <div
                      key={f._id}
                      onClick={() => router.push(`/friends/${f._id}?fid=${f.friendshipId}`)}
                      className="flex items-center gap-2.5 bg-surface border border-border rounded-card p-[11px_13px] shadow-card cursor-pointer active:opacity-80 transition-opacity"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-[38px] h-[38px] rounded-full bg-bg border-[1.5px] border-border flex items-center justify-center text-lg">
                          😎
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-dark truncate">{f.name}</p>
                        <p className="text-[10px] text-muted mt-0.5">
                          {f.currentStreak > 0 ? `🔥 ${f.currentStreak} streak · ` : ''}
                          {f.points} pts
                        </p>
                      </div>
                      <span className="font-syne text-[13px] font-extrabold text-dark flex-shrink-0">{f.points}</span>
                      <ChevronRight size={14} className="text-border flex-shrink-0" />
                    </div>
                  ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
