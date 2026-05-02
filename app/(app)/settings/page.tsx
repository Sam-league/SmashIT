'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const [pushEnabled,        setPushEnabled]        = useState(true)
  const [achievementAlerts,  setAchievementAlerts]  = useState(true)
  const [friendActivity,     setFriendActivity]     = useState(false)

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-[34px] h-[18px] rounded-full relative transition-colors ${on ? 'bg-dark' : 'bg-border'}`}
    >
      <span
        className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full transition-all ${
          on ? 'right-[2px]' : 'left-[2px]'
        }`}
      />
    </button>
  )

  type SettingItem = { icon: string; bg: string; name: string; sub?: string; right: React.ReactNode; onClick?: () => void }
  type SettingGroup = { label: string; items: SettingItem[] }

  const groups: SettingGroup[] = [
    {
      label: 'Notifications',
      items: [
        {
          icon: '🔔', bg: 'bg-accent-lt',
          name: 'Push Notifications', sub: 'Task reminders & alerts',
          right: <Toggle on={pushEnabled} onToggle={() => setPushEnabled((v) => !v)} />,
        },
        {
          icon: '⏰', bg: 'bg-[#fff8ec]',
          name: 'Reminder Time', sub: 'Before task deadline',
          right: <span className="font-syne text-[11px] font-bold text-muted">30 min</span>,
        },
        {
          icon: '🏅', bg: 'bg-success-lt',
          name: 'Achievement Alerts', sub: 'When you unlock one',
          right: <Toggle on={achievementAlerts} onToggle={() => setAchievementAlerts((v) => !v)} />,
        },
        {
          icon: '👥', bg: 'bg-[#eff6ff]',
          name: 'Friend Activity', sub: 'Leaderboard changes',
          right: <Toggle on={friendActivity} onToggle={() => setFriendActivity((v) => !v)} />,
        },
      ],
    },
    {
      label: 'Account',
      items: [
        {
          icon: '👤', bg: 'bg-[#f5f0ff]',
          name: 'Edit Profile', sub: 'Name, photo, handle',
          right: <ChevronRight size={13} className="text-border" />,
          onClick: () => {},
        },
        {
          icon: '🔒', bg: 'bg-[#f0f0f5]',
          name: 'Change Password', sub: undefined,
          right: <ChevronRight size={13} className="text-border" />,
          onClick: () => {},
        },
      ],
    },
    {
      label: 'App',
      items: [
        {
          icon: '📱', bg: 'bg-bg',
          name: 'Install App', sub: 'Add to home screen',
          right: <ChevronRight size={13} className="text-border" />,
          onClick: () => {},
        },
        {
          icon: 'ℹ️', bg: 'bg-bg',
          name: 'App Version', sub: undefined,
          right: <span className="font-syne text-[11px] font-bold text-muted">v1.0.0</span>,
        },
      ],
    },
  ]

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-[10px] bg-surface border border-border flex items-center justify-center shadow-card flex-shrink-0"
          >
            <ArrowLeft size={14} className="text-dark" />
          </button>
          <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-normal">Settings</h1>
        </div>

        {/* Groups */}
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-muted pl-0.5">
              {group.label}
            </span>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  onClick={item.onClick}
                  className={`flex items-center gap-2.5 bg-surface border border-border rounded-[12px] p-[12px_13px] shadow-card ${item.onClick ? 'cursor-pointer active:opacity-80 transition-opacity' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-[9px] ${item.bg} flex items-center justify-center text-[15px] flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-dark">{item.name}</p>
                    {item.sub && <p className="text-[10px] text-muted mt-px">{item.sub}</p>}
                  </div>
                  <div className="flex-shrink-0">{item.right}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="flex flex-col gap-2">
          <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-muted pl-0.5">
            Account
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 bg-surface border border-border rounded-[12px] p-[12px_13px] shadow-card text-left active:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#ffebee] flex items-center justify-center flex-shrink-0">
              <LogOut size={15} className="text-error" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-error">Sign Out</p>
            </div>
            <ChevronRight size={13} className="text-[#ef9a9a]" />
          </button>
        </div>

      </div>
    </div>
  )
}
