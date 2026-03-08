'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Achievement } from '@/lib/types'

type Filter = 'All' | 'Unlocked' | 'Locked'

export default function AchievementsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('All')

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await api.get<Achievement[]>('/api/achievements')
      return data
    },
  })

  const unlocked = achievements.filter((a) => a.unlocked)
  const total    = achievements.length

  // SVG ring
  const R     = 22
  const circ  = 2 * Math.PI * R
  const pct   = total > 0 ? unlocked.length / total : 0
  const dash  = pct * circ

  const filtered = achievements.filter((a) => {
    if (filter === 'Unlocked') return a.unlocked
    if (filter === 'Locked')   return !a.unlocked
    return true
  })

  const formatDate = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-[10px] bg-surface border border-border flex items-center justify-center shadow-card flex-shrink-0"
          >
            <ArrowLeft size={14} className="text-dark" />
          </button>
          <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-tight">Achievements</h1>
        </div>

        {/* Progress card */}
        <div className="bg-dark rounded-card p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute w-[120px] h-[120px] rounded-full bg-accent/10 -top-8 -right-5 pointer-events-none" />

          {isLoading ? (
            <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
          ) : (
            <div className="relative w-14 h-14 flex-shrink-0 z-10">
              <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                <circle
                  cx="28" cy="28" r={R} fill="none" stroke="#ff6b4a" strokeWidth="7"
                  strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-syne text-[13px] font-extrabold text-white">
                {unlocked.length}/{total}
              </div>
            </div>
          )}

          <div className="relative z-10">
            <p className="font-syne text-[15px] font-extrabold text-white tracking-tight">
              {unlocked.length} Unlocked
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {total - unlocked.length} more to go · Keep pushing!
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {(['All', 'Unlocked', 'Locked'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-[5px] rounded-full font-syne text-[10px] font-bold tracking-[0.04em] border-[1.5px] transition-colors ${
                filter === f
                  ? 'bg-dark border-dark text-white'
                  : 'bg-surface border-border text-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-surface border border-border rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={`bg-surface border rounded-card p-3 flex flex-col gap-1.5 shadow-card relative overflow-hidden ${
                  a.unlocked
                    ? 'border-transparent bg-gradient-to-br from-white via-white to-accent-lt'
                    : 'border-border opacity-50 grayscale-[0.6]'
                }`}
              >
                {a.unlocked && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
                <span className="text-[24px]">{a.icon}</span>
                <p className="font-syne text-[11px] font-bold text-dark leading-tight">{a.name}</p>
                <p className="text-[10px] text-muted leading-snug">{a.description}</p>
                <p className={`font-syne text-[9px] font-bold ${a.unlocked ? 'text-accent' : 'text-muted'}`}>
                  {a.unlocked ? formatDate(a.dateUnlocked) : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
