'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useAnalyticsSummary } from '@/hooks/usePoints'
import api from '@/lib/api'
import type { Achievement, PopulatedFriendship } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const user   = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  const { data: summary } = useAnalyticsSummary()

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await api.get<Achievement[]>('/api/achievements')
      return data
    },
  })

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get<PopulatedFriendship[]>('/api/friends')
      return data
    },
  })

  const unlockedAchs  = achievements.filter((a) => a.unlocked)
  const rate          = summary?.completionRate ?? 0
  const streak        = user?.currentStreak ?? 0

  const menuItems = [
    {
      icon: '🏅', bg: 'bg-accent-lt',
      name: 'All Achievements',
      sub: `${unlockedAchs.length} unlocked · ${achievements.length - unlockedAchs.length} locked`,
      href: '/achievements',
    },
    {
      icon: '👥', bg: 'bg-[#eff6ff]',
      name: 'Friends',
      sub: `${friends.length} friends`,
      href: '/friends',
    },
    {
      icon: '📊', bg: 'bg-success-lt',
      name: 'Full Analytics',
      sub: 'View detailed stats',
      href: '/analytics',
    },
    {
      icon: '⚙️', bg: 'bg-[#f0f0f5]',
      name: 'Settings',
      sub: 'Notifications, account',
      href: '/settings',
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">

      {/* Hero */}
      <div className="bg-dark px-[18px] pt-4 pb-5 relative overflow-hidden flex-shrink-0">
        <div className="absolute w-[160px] h-[160px] rounded-full bg-accent/10 -top-12 -right-8 pointer-events-none" />

        {/* Top row */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="font-syne text-[13px] font-bold text-white/50 uppercase tracking-[0.08em]">
            My Profile
          </span>
          <button
            onClick={() => router.push('/settings')}
            className="w-[30px] h-[30px] rounded-[8px] bg-white/10 flex items-center justify-center text-[14px]"
          >
            ⚙️
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="w-[54px] h-[54px] rounded-full bg-white/10 border-[2.5px] border-accent flex items-center justify-center text-[26px] flex-shrink-0">
            🙋
          </div>
          <div>
            <h1 className="font-syne text-[18px] font-extrabold text-white tracking-normal leading-tight">
              {user?.name ?? '—'}
            </h1>
            <p className="text-[11px] text-white/40 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex bg-white/[0.06] rounded-[10px] overflow-hidden relative z-10">
          {[
            { val: user?.points ?? 0,    label: 'Points',  accent: true },
            { val: `🔥 ${streak}`,        label: 'Streak'               },
            { val: `${rate}%`,            label: 'Rate'                 },
            { val: friends.length,        label: 'Friends'              },
          ].map(({ val, label, accent }, i) => (
            <div
              key={label}
              className="flex-1 py-2.5 px-2 text-center border-r border-white/[0.08] last:border-r-0"
            >
              <p className={`font-syne text-[15px] font-extrabold leading-none ${accent ? 'text-accent' : 'text-white'}`}>
                {val}
              </p>
              <p className="text-[8px] text-white/30 font-semibold uppercase tracking-wider mt-[3px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[18px] pt-4 space-y-3.5 pb-24">

        {/* Achievements chips */}
        {achievements.length > 0 && (
          <div className="bg-surface border border-border rounded-card p-4 shadow-card">
            <p className="font-syne text-[11px] font-bold text-muted tracking-[0.12em] uppercase mb-3">
              🏅 Achievements · {unlockedAchs.length} unlocked
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`flex-shrink-0 bg-surface border border-border rounded-[10px] p-2.5 flex flex-col items-center gap-1 min-w-[60px] ${!a.unlocked ? 'opacity-40 grayscale' : ''}`}
                >
                  <span className="text-[20px]">{a.icon}</span>
                  <span className="font-syne text-[8px] font-bold text-muted uppercase tracking-[0.04em] text-center leading-tight">
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-2.5 p-[11px_12px] bg-surface border border-border rounded-[10px] shadow-card text-left active:opacity-80 transition-opacity"
            >
              <div className={`w-8 h-8 rounded-[9px] ${item.bg} flex items-center justify-center text-[15px] flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-dark">{item.name}</p>
                {item.sub && <p className="text-[10px] text-muted mt-px">{item.sub}</p>}
              </div>
              <ChevronRight size={14} className="text-border flex-shrink-0" />
            </button>
          ))}

          {/* Sign out */}
          <button
            onClick={logout}
            className="flex items-center gap-2.5 p-[11px_12px] bg-surface border border-border rounded-[10px] shadow-card text-left active:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#ffebee] flex items-center justify-center text-[15px] flex-shrink-0">
              🚪
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-error">Sign Out</p>
            </div>
            <ChevronRight size={14} className="text-border flex-shrink-0" />
          </button>
        </div>

      </div>
    </div>
  )
}
