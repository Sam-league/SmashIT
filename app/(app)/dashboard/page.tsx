'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useTodayTasks } from '@/hooks/useTasks'
import { useAnalyticsSummary, useAnalyticsDaily } from '@/hooks/usePoints'
import api from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/types'
import StatCard from '@/components/ui/StatCard'
import TaskCard from '@/components/ui/TaskCard'

/* ── helpers ── */
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })
}

/* ── Mini bar chart ── */
function WeekChart({ data }: { data: { date: string; points: number }[] }) {
  const max = Math.max(...data.map((d) => d.points), 1)
  const todayIdx = new Date().getDay() // 0=Sun

  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => {
        const height = Math.max(4, Math.round((d.points / max) * 52))
        const isToday = i === data.length - 1
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div
              className={`w-full rounded-t-[4px] transition-all ${
                isToday ? 'bg-accent' : 'bg-dark'
              }`}
              style={{ height }}
            />
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.04em] ${
                isToday ? 'text-accent' : 'text-muted'
              }`}
            >
              {DAYS[(new Date(d.date).getDay() + 1) % 7]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Streak calendar (last 7 days) ── */
function StreakCalendar({ dailyData }: { dailyData: { date: string; points: number }[] }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const entry = dailyData.find((x) => x.date === key)
    const done  = (entry?.points ?? 0) > 0
    const isToday = i === 6
    return { label: DAYS[d.getDay()], done, isToday }
  })

  return (
    <div className="flex gap-1.5 justify-between">
      {days.map((d, i) => (
        <div
          key={i}
          className={`flex-1 aspect-square rounded-[6px] flex flex-col items-center justify-center gap-0.5 ${
            d.isToday ? 'bg-accent' : d.done ? 'bg-dark' : 'bg-border'
          }`}
        >
          <span className={`text-[8px] font-bold uppercase ${d.isToday || d.done ? 'text-white' : 'text-muted'}`}>
            {d.label}
          </span>
          <span className="text-[9px]">{d.isToday ? '🔥' : d.done ? '✓' : ''}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Page ── */
export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data: todayTasks = [], isLoading: tasksLoading }  = useTodayTasks()
  const { data: summary,         isLoading: summaryLoading } = useAnalyticsSummary()
  const { data: dailyData = [],  isLoading: chartLoading }   = useAnalyticsDaily(7)
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get<LeaderboardEntry[]>('/api/leaderboard')
      return data
    },
  })

  const todayStr    = new Date().toISOString().slice(0, 10)
  const dailyTasks  = todayTasks.filter((t) => t.task.type === 'daily')
  const upcomingTasks = todayTasks
    .filter((t) => t.task.type === 'scheduled' && t.task.dueDate && t.task.dueDate.slice(0, 10) >= todayStr)
    .sort((a, b) => new Date(a.task.dueDate!).getTime() - new Date(b.task.dueDate!).getTime())
    .slice(0, 3)

  const completionRate = summary?.completionRate ?? 0
  const currentStreak  = summary?.currentStreak  ?? user?.currentStreak ?? 0
  const bestStreak     = summary?.bestStreak      ?? user?.bestStreak    ?? 0
  const totalPoints    = summary?.totalPoints     ?? user?.points        ?? 0

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[11px] text-muted font-medium tracking-[0.03em]">{formatDate()}</p>
            <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-normal leading-tight">
              {getGreeting()}, <span className="text-accent">{firstName}</span> 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="w-[38px] h-[38px] rounded-[12px] bg-surface border border-border flex items-center justify-center relative shadow-card"
            >
              <Bell size={17} className="text-dark" strokeWidth={1.8} />
              <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-accent rounded-full border-[1.5px] border-bg" />
            </Link>
            <Link
              href="/profile"
              className="w-[38px] h-[38px] rounded-[12px] bg-dark flex items-center justify-center shadow-card text-lg"
            >
              😎
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex gap-2.5">
          <StatCard icon="⚡" value={totalPoints} label="Total Points" dark />
          <StatCard
            icon="🔥"
            value={currentStreak}
            label="Day Streak"
            delta={bestStreak > 0 ? `↑ Best: ${bestStreak}` : undefined}
          />
          <StatCard
            icon="✅"
            value={`${completionRate}%`}
            label="This Week"
          />
        </div>

        {/* ── Weekly bar chart ── */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="flex justify-between items-center mb-3.5">
            <span className="font-syne text-[13px] font-bold text-dark">📈 This Week</span>
            <Link href="/analytics" className="text-[11px] text-accent font-semibold">See all →</Link>
          </div>
          {chartLoading
            ? <div className="h-16 bg-border rounded animate-pulse" />
            : dailyData.length > 0
              ? <WeekChart data={dailyData} />
              : <div className="h-16 flex items-center justify-center text-[12px] text-muted">No data yet</div>
          }
        </div>

        {/* ── Streak calendar ── */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="flex justify-between items-center mb-3.5">
            <span className="font-syne text-[13px] font-bold text-dark">
              🗓 Streak — {currentStreak} days
            </span>
            <Link href="/analytics" className="text-[11px] text-accent font-semibold">History →</Link>
          </div>
          <StreakCalendar dailyData={dailyData} />
        </div>

        {/* ── Today's tasks ── */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-syne text-[13px] font-bold text-dark">Today&apos;s Tasks</span>
            <span className="text-[11px] text-muted font-medium">
              {dailyTasks.length > 0
                ? `${dailyTasks.filter((t) => t.status === 'completed').length} of ${dailyTasks.length} done`
                : ''}
            </span>
          </div>

          {tasksLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[62px] bg-surface border border-border rounded-card animate-pulse" />
              ))}
            </div>
          ) : dailyTasks.length === 0 ? (
            <div className="bg-surface border border-border rounded-card p-4 text-center">
              <p className="text-[13px] text-muted">No daily tasks yet.</p>
              <Link href="/tasks/create" className="text-[12px] text-accent font-semibold mt-1 inline-block">
                + Create one
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dailyTasks.slice(0, 5).map(({ task, status }) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  status={status}
                  timeLabel={task.reminderTimes?.[0] ?? ''}
                  onClick={() => router.push(`/tasks/${task._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Upcoming ── */}
        {upcomingTasks.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-syne text-[13px] font-bold text-dark">Upcoming</span>
              <Link href="/tasks" className="text-[11px] text-accent font-semibold">See all →</Link>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingTasks.map(({ task }) => {
                const due      = task.dueDate ? new Date(task.dueDate) : null
                const mon      = due?.toLocaleString('en-US', { month: 'short' }) ?? ''
                const day      = due?.getDate() ?? ''
                const daysAway = due ? Math.ceil((due.getTime() - Date.now()) / 86400000) : 0
                return (
                  <div
                    key={task._id}
                    onClick={() => router.push(`/tasks/${task._id}`)}
                    className="bg-surface border border-border rounded-card p-3 flex items-center gap-2.5 shadow-card cursor-pointer"
                  >
                    <div className="w-[38px] h-[42px] bg-bg border border-border rounded-[10px] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-bold uppercase text-accent tracking-[0.05em] leading-none">{mon}</span>
                      <span className="font-syne text-[17px] font-extrabold text-dark leading-tight">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-dark truncate">{task.title}</p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`} · Scheduled
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-border" strokeWidth={2} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Mini Leaderboard ── */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="flex justify-between items-center mb-3">
            <span className="font-syne text-[13px] font-bold text-dark">🏆 Friends</span>
            <Link href="/leaderboard" className="text-[11px] text-accent font-semibold">Full board →</Link>
          </div>

          {leaderboard.length > 0 ? (
            <div>
              {leaderboard.slice(0, 4).map((entry, i) => {
                const isYou = entry.userId.toString() === user?._id
                return (
                  <div
                    key={entry.userId.toString()}
                    className={`flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 last:pb-0 first:pt-0 ${
                      isYou ? 'bg-accent-lt -mx-1 px-1 rounded-[8px] border-b-0' : ''
                    }`}
                  >
                    <span className={`font-syne text-[13px] font-extrabold w-5 text-center ${i < 2 ? 'text-accent' : 'text-muted'}`}>
                      {entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-bg border border-border flex items-center justify-center text-sm flex-shrink-0">
                      {isYou ? '🙋' : '😎'}
                    </div>
                    <span className={`text-[12px] font-semibold flex-1 ${isYou ? 'text-accent' : 'text-dark'}`}>
                      {isYou ? 'You' : entry.name}
                    </span>
                    <span className="text-[11px] font-bold text-accent">{entry.points} pts</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[11px] text-muted text-center py-2">
              <Link href="/friends" className="text-accent font-semibold">Add friends</Link> to see the leaderboard
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
