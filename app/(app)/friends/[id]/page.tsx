'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import type { FriendUser } from '@/lib/types'

export default function FriendProfilePage() {
  const { id }       = useParams<{ id: string }>()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const fid          = searchParams.get('fid')
  const me           = useAuthStore((s) => s.user)
  const qc           = useQueryClient()

  const { data: friend, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<FriendUser>(`/api/users/${id}`)
      return data
    },
    enabled: !!id,
  })

  const removeFriend = useMutation({
    mutationFn: () => api.delete(`/api/friends/${fid}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] })
      router.push('/friends')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted text-[13px]">Loading…</p>
      </div>
    )
  }

  if (!friend) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted text-[13px]">User not found</p>
      </div>
    )
  }

  const myPts    = me?.points        ?? 0
  const myStreak = me?.currentStreak ?? 0
  const maxPts   = Math.max(friend.points, myPts, 1)
  const maxStreak = Math.max(friend.currentStreak, myStreak, 1)

  const comparisons = [
    {
      label: 'Points',
      them:  { val: friend.points,         pct: (friend.points         / maxPts)    * 100 },
      mine:  { val: myPts,                 pct: (myPts                 / maxPts)    * 100 },
    },
    {
      label: 'Streak',
      them:  { val: `${friend.currentStreak}d`, pct: (friend.currentStreak / maxStreak) * 100 },
      mine:  { val: `${myStreak}d`,             pct: (myStreak             / maxStreak) * 100 },
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">

      {/* Hero */}
      <div className="bg-dark px-5 pt-5 pb-7 relative overflow-hidden flex-shrink-0">
        <div className="absolute w-[180px] h-[180px] rounded-full bg-accent/10 -top-12 -right-8 pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            {fid && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${friend?.name} as a friend?`)) removeFriend.mutate()
                }}
                disabled={removeFriend.isPending}
                className="px-3 py-[5px] rounded-full bg-white/10 font-syne text-[10px] font-bold text-white disabled:opacity-50 active:opacity-70"
              >
                {removeFriend.isPending ? '…' : 'Remove'}
              </button>
            )}
            <button
              onClick={() => alert('Challenge feature coming soon!')}
              className="px-3 py-[5px] rounded-full bg-accent font-syne text-[10px] font-bold text-white shadow-accent"
            >
              Challenge 🔥
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="relative w-[60px] h-[60px] rounded-full bg-white/10 border-[2.5px] border-accent flex items-center justify-center text-3xl flex-shrink-0">
            😎
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-dark" />
          </div>
          <div>
            <h1 className="font-syne text-[20px] font-extrabold text-white tracking-normal leading-tight">
              {friend.name}
            </h1>
            <p className="text-[11px] text-white/40 mt-0.5">@{friend.name.toLowerCase().replace(/\s+/g, '')}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex mt-4 bg-white/[0.06] rounded-[10px] overflow-hidden relative z-10">
          {[
            { val: friend.points,              label: 'Points', accent: true },
            { val: `🔥 ${friend.currentStreak}`, label: 'Streak' },
            { val: `⭐ ${friend.bestStreak ?? 0}`, label: 'Best' },
          ].map(({ val, label, accent }, i) => (
            <div
              key={label}
              className={`flex-1 py-2.5 px-2 text-center border-r border-white/[0.08] last:border-r-0`}
            >
              <p className={`font-syne text-[16px] font-extrabold leading-none ${accent ? 'text-accent' : 'text-white'}`}>
                {val}
              </p>
              <p className="text-[8px] text-white/35 font-semibold uppercase tracking-wider mt-[3px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[18px] pt-4 space-y-3.5 pb-24">

        {/* vs You comparison */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-card">
          <p className="font-syne text-[12px] font-bold text-dark tracking-[0.04em] uppercase mb-3">
            📊 vs You
          </p>
          <div className="flex flex-col gap-2">
            {comparisons.map(({ label, them, mine }) => (
              <div key={label}>
                {/* Their bar */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-syne text-[10px] font-bold text-muted uppercase tracking-[0.05em] w-[52px] flex-shrink-0">
                    {friend.name.split(' ')[0]}
                  </span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-dark rounded-full" style={{ width: `${them.pct}%` }} />
                  </div>
                  <span className="font-syne text-[10px] font-extrabold text-dark w-8 text-right flex-shrink-0">
                    {them.val}
                  </span>
                </div>
                {/* Your bar */}
                <div className="flex items-center gap-2">
                  <span className="font-syne text-[10px] font-bold text-accent uppercase tracking-[0.05em] w-[52px] flex-shrink-0">
                    You
                  </span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${mine.pct}%` }} />
                  </div>
                  <span className="font-syne text-[10px] font-extrabold text-accent w-8 text-right flex-shrink-0">
                    {mine.val}
                  </span>
                </div>

                {label !== comparisons[comparisons.length - 1].label && (
                  <div className="h-px bg-border mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Their achievements (static — achievement API not yet built) */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-card">
          <p className="font-syne text-[12px] font-bold text-dark tracking-[0.04em] uppercase mb-3">
            🏅 Recent Achievements
          </p>
          {friend.currentStreak >= 7 || friend.points >= 100 ? (
            <div className="flex flex-col gap-2">
              {friend.currentStreak >= 7 && (
                <div className="flex items-center gap-2.5 border border-border rounded-card p-[10px_12px]">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-warn-lt flex items-center justify-center text-lg flex-shrink-0">🔥</div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-dark">7 Day Streak</p>
                    <p className="text-[10px] text-muted mt-0.5">Consistency champion</p>
                  </div>
                  <span className="font-syne text-[11px] font-bold text-accent">+50</span>
                </div>
              )}
              {friend.points >= 100 && (
                <div className="flex items-center gap-2.5 border border-border rounded-card p-[10px_12px]">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-success-lt flex items-center justify-center text-lg flex-shrink-0">⚡</div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-dark">100 Points</p>
                    <p className="text-[10px] text-muted mt-0.5">Points milestone</p>
                  </div>
                  <span className="font-syne text-[11px] font-bold text-accent">+25</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-muted text-center py-4">No achievements yet</p>
          )}
        </div>

      </div>
    </div>
  )
}
