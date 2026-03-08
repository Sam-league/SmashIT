'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get<LeaderboardEntry[]>('/api/leaderboard')
      return data
    },
  })

  // Podium: arrange as [2nd, 1st, 3rd]
  const podiumOrder = [leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean)
  const podiumH     = [40, 60, 28]

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        <div className="flex items-center justify-between">
          <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-tight">Leaderboard</h1>
          <span className="text-[11px] text-muted font-semibold">All Time</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface border border-border rounded-card animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-4xl">🏆</span>
            <p className="text-[14px] font-semibold text-dark">No rankings yet</p>
            <p className="text-[12px] text-muted text-center">Add friends to compete on the leaderboard</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="bg-dark rounded-card px-5 pt-5 pb-6 relative overflow-hidden">
              <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 -top-20 -right-10 pointer-events-none" />
              <p className="text-center font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-4">
                🏆 Top Performers
              </p>

              <div className="flex items-end justify-center gap-3">
                {podiumOrder.map((entry, pi) => {
                  if (!entry) return null
                  const isFirst = pi === 1
                  const isYou   = entry.userId.toString() === user?._id
                  return (
                    <div key={entry.userId.toString()} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`relative rounded-full flex items-center justify-center text-2xl bg-white/10 border-2 border-white/15 ${
                          isFirst
                            ? 'w-14 h-14 text-3xl border-accent shadow-[0_0_0_3px_rgba(255,107,74,0.25)]'
                            : 'w-11 h-11'
                        }`}
                      >
                        {isFirst && <span className="absolute -top-3.5 text-sm">👑</span>}
                        {isYou ? '🙋' : '😎'}
                      </div>
                      <span className="font-syne text-[11px] font-bold text-white">
                        {isYou ? 'You' : entry.name.split(' ')[0]}
                      </span>
                      <span className={`text-[10px] font-semibold ${isFirst ? 'text-accent' : 'text-white/50'}`}>
                        {entry.points}
                      </span>
                      <div
                        className={`w-14 rounded-t-[6px] ${isFirst ? 'bg-accent/20' : 'bg-white/[0.08]'}`}
                        style={{ height: `${podiumH[pi]}px` }}
                      />
                      <span className={`font-syne font-extrabold ${isFirst ? 'text-accent text-[13px]' : 'text-white/30 text-[11px]'}`}>
                        {entry.rank}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Full list */}
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry) => {
                const isYou  = entry.userId.toString() === user?._id
                const isTop3 = entry.rank <= 3
                return (
                  <div
                    key={entry.userId.toString()}
                    className={`flex items-center gap-2.5 rounded-card p-[11px_14px] border shadow-card ${
                      isYou ? 'bg-accent-lt border-accent' : 'bg-surface border-border'
                    }`}
                  >
                    <span
                      className={`font-syne text-[14px] font-extrabold w-[22px] text-center flex-shrink-0 ${
                        isYou ? 'text-accent' : isTop3 ? 'text-dark' : 'text-muted'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[17px] border-[1.5px] flex-shrink-0 ${
                        isYou ? 'bg-white border-accent' : 'bg-bg border-border'
                      }`}
                    >
                      {isYou ? '🙋' : '😎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold ${isYou ? 'text-accent' : 'text-dark'}`}>
                        {isYou ? 'You' : entry.name}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {entry.currentStreak > 0 ? `🔥 ${entry.currentStreak} day streak` : 'No streak'}
                      </p>
                    </div>
                    <span className={`font-syne text-[14px] font-extrabold ${isYou ? 'text-accent' : 'text-dark'}`}>
                      {entry.points}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
