'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications'
import type { Notification } from '@/lib/types'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hr ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

function notifIcon(title: string): { icon: string; bg: string } {
  const t = title.toLowerCase()
  if (t.includes('missed') || t.includes('miss'))  return { icon: '✕', bg: 'bg-[#ffebee]' }
  if (t.includes('achievement'))                    return { icon: '🏅', bg: 'bg-success-lt' }
  if (t.includes('friend') || t.includes('request')) return { icon: '👥', bg: 'bg-accent-lt' }
  if (t.includes('streak'))                         return { icon: '🔥', bg: 'bg-[#fff8ec]' }
  return { icon: '⏰', bg: 'bg-accent-lt' }
}

function NotifItem({ n }: { n: Notification }) {
  const { icon, bg } = notifIcon(n.title)
  return (
    <div
      className={`flex items-start gap-2.5 rounded-card p-[11px_13px] border shadow-card relative ${
        !n.read ? 'bg-accent-lt border-accent/20' : 'bg-surface border-border'
      }`}
    >
      {!n.read && (
        <span className="absolute top-3 right-3 w-[7px] h-[7px] rounded-full bg-accent" />
      )}
      <div className={`w-9 h-9 rounded-[10px] ${bg} flex items-center justify-center text-[17px] flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-[12px] font-semibold text-dark leading-snug">{n.title}</p>
        <p className="text-[10px] text-muted mt-0.5">{n.body}</p>
        <p className="font-syne text-[9px] font-bold text-muted mt-1">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data: notifications = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationsRead()

  const todayNotifs    = notifications.filter((n) => isToday(n.createdAt))
  const earlierNotifs  = notifications.filter((n) => !isToday(n.createdAt))
  const unreadCount    = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-[10px] bg-surface border border-border flex items-center justify-center shadow-card flex-shrink-0"
            >
              <ArrowLeft size={14} className="text-dark" />
            </button>
            <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-tight">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markRead.mutate()}
              className="text-[11px] font-semibold text-accent"
            >
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface border border-border rounded-card animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-4xl">🔔</span>
            <p className="text-[14px] font-semibold text-dark">No notifications yet</p>
            <p className="text-[12px] text-muted text-center">Complete tasks to get updates</p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <>
                <span className="font-syne text-[9px] font-bold tracking-[0.15em] uppercase text-muted">Today</span>
                <div className="flex flex-col gap-2">
                  {todayNotifs.map((n) => <NotifItem key={n._id} n={n} />)}
                </div>
              </>
            )}

            {earlierNotifs.length > 0 && (
              <>
                <span className="font-syne text-[9px] font-bold tracking-[0.15em] uppercase text-muted">Earlier</span>
                <div className="flex flex-col gap-2">
                  {earlierNotifs.map((n) => <NotifItem key={n._id} n={n} />)}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}
