'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAnalyticsSummary, useAnalyticsDaily } from '@/hooks/usePoints'

type Period = 7 | 30

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>(7)
  const user    = useAuthStore((s) => s.user)
  const { data: summary }      = useAnalyticsSummary()
  const { data: daily = [], isLoading } = useAnalyticsDaily(period)

  const totalPts   = summary?.totalPoints    ?? user?.points        ?? 0
  const streak     = summary?.currentStreak  ?? user?.currentStreak ?? 0
  const bestStreak = summary?.bestStreak     ?? user?.bestStreak    ?? 0
  const completed  = summary?.totalCompleted ?? 0
  const missed     = summary?.totalMissed    ?? 0
  const rate       = summary?.completionRate ?? 0

  const weeklyTotal = daily.reduce((s, d) => s + d.points, 0)
  const maxPts      = Math.max(...daily.map((d) => d.points), 1)

  // Donut SVG
  const R = 30
  const circ     = 2 * Math.PI * R
  const doneDash = (rate / 100) * circ

  // Calendar
  const now          = new Date()
  const year         = now.getFullYear()
  const month        = now.getMonth()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const firstDow     = new Date(year, month, 1).getDay() // 0=Sun
  const startOffset  = firstDow === 0 ? 6 : firstDow - 1 // Mon-based
  const monthName    = now.toLocaleDateString('en-US', { month: 'long' })
  const doneSet      = new Set(
    daily.filter((d) => d.points > 0).map((d) => parseInt(d.date.slice(8, 10), 10))
  )

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-normal">Analytics</h1>
            <p className="text-[11px] text-muted mt-0.5">Your productivity breakdown</p>
          </div>
          <div className="flex bg-surface border border-border rounded-full p-[3px] gap-0.5">
            {([7, 30] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-[5px] rounded-full font-syne text-[10px] font-bold tracking-wide transition-colors ${
                  period === p ? 'bg-dark text-white' : 'text-muted'
                }`}
              >
                {p === 7 ? '7D' : '30D'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-dark border border-dark rounded-card p-[14px_12px] shadow-card">
            <span className="text-xl mb-2 block">⚡</span>
            <div className="font-syne text-[26px] font-extrabold text-accent tracking-normal leading-none">{totalPts}</div>
            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-1">Total Points</div>
          </div>
          <div className="bg-surface border border-border rounded-card p-[14px_12px] shadow-card">
            <span className="text-xl mb-2 block">🔥</span>
            <div className="font-syne text-[26px] font-extrabold text-dark tracking-normal leading-none">{streak}</div>
            <div className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Day Streak</div>
            {bestStreak > 0 && <div className="text-[10px] text-success font-semibold mt-0.5">↑ Best: {bestStreak}</div>}
          </div>
          <div className="bg-surface border border-border rounded-card p-[14px_12px] shadow-card">
            <span className="text-xl mb-2 block">✅</span>
            <div className="font-syne text-[26px] font-extrabold text-dark tracking-normal leading-none">{completed}</div>
            <div className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Completed</div>
          </div>
          <div className="bg-accent border border-accent rounded-card p-[14px_12px] shadow-card">
            <span className="text-xl mb-2 block">📈</span>
            <div className="font-syne text-[26px] font-extrabold text-white tracking-normal leading-none">{rate}%</div>
            <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-1">Rate</div>
          </div>
        </div>

        {/* Daily Points — horizontal bars */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-card">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <p className="font-syne text-[13px] font-bold text-dark">Daily Points</p>
              <p className="text-[10px] text-muted mt-0.5">Points earned per day</p>
            </div>
            <span className="px-[10px] py-[3px] rounded-full bg-accent-lt text-accent font-syne text-[10px] font-bold">
              {period === 7 ? 'This Week' : 'Last 30D'}
            </span>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <span className="font-syne text-[36px] font-extrabold text-dark leading-none tracking-normal">
              {weeklyTotal} <span className="text-[18px] text-accent">pts</span>
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-2 bg-border rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {daily.map((d, i) => {
                const isToday = i === daily.length - 1
                const w = Math.max((d.points / maxPts) * 100, d.points > 0 ? 2 : 0)
                const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
                return (
                  <div key={d.date} className="flex items-center gap-2">
                    <span className="font-syne text-[10px] font-bold text-muted uppercase w-7 flex-shrink-0">{dayName}</span>
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isToday ? 'bg-accent' : 'bg-dark'}`}
                        style={{ width: `${w}%` }}
                      />
                    </div>
                    <span className={`font-syne text-[10px] font-bold w-8 text-right flex-shrink-0 ${isToday ? 'text-accent' : 'text-dark'}`}>
                      {d.points}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completion Rate */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-card">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <p className="font-syne text-[13px] font-bold text-dark">Completion Rate</p>
              <p className="text-[10px] text-muted mt-0.5">Tasks completed vs missed</p>
            </div>
            <span className="px-[10px] py-[3px] rounded-full bg-success-lt text-success font-syne text-[10px] font-bold">
              {rate}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" stroke="#e8e4dc" strokeWidth="10" />
                <circle
                  cx="40" cy="40" r={R} fill="none" stroke="#1a1a2e" strokeWidth="10"
                  strokeDasharray={`${doneDash} ${circ}`} strokeLinecap="round"
                />
                {rate < 100 && (
                  <circle
                    cx="40" cy="40" r={R} fill="none" stroke="#ff6b4a" strokeWidth="10"
                    strokeDasharray={`${circ - doneDash} ${circ}`}
                    strokeDashoffset={-doneDash} strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-syne text-[18px] font-extrabold text-dark leading-none">{rate}%</span>
                <span className="text-[8px] text-muted font-semibold uppercase tracking-wide">Done</span>
              </div>
            </div>

            {/* Legend rows */}
            <div className="flex-1 space-y-2">
              {[
                { dot: 'bg-dark',    label: 'Completed', val: completed, cls: 'text-dark' },
                { dot: 'bg-accent',  label: 'Missed',    val: missed,    cls: 'text-accent' },
                { dot: 'bg-border',  label: 'Total',     val: completed + missed, cls: 'text-dark' },
              ].map(({ dot, label, val, cls }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-[12px] text-dark font-medium flex-1">{label}</span>
                  <span className={`font-syne text-[13px] font-extrabold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {[
              { label: 'Completed', pct: rate,       color: 'bg-dark'   },
              { label: 'Missed',    pct: 100 - rate, color: 'bg-accent' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[10px] text-muted font-semibold tracking-wide mb-1">
                  <span>{label}</span><span>{pct}%</span>
                </div>
                <div className="h-[6px] bg-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-card">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <p className="font-syne text-[13px] font-bold text-dark">🗓 Streak Calendar</p>
              <p className="text-[10px] text-muted mt-0.5">{monthName} {year}</p>
            </div>
            <span className="px-[10px] py-[3px] rounded-full bg-accent-lt text-accent font-syne text-[10px] font-bold">
              🔥 {streak} days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center font-syne text-[8px] font-bold uppercase text-muted tracking-[0.05em]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day     = i + 1
              const isToday = day === now.getDate() && month === now.getMonth()
              const isDone  = doneSet.has(day) && !isToday
              const future  = day > now.getDate() && month === now.getMonth()
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-[6px] flex items-center justify-center text-[9px] font-semibold ${
                    isToday ? 'bg-accent text-white font-extrabold'
                    : isDone  ? 'bg-dark text-white'
                    : future  ? 'bg-transparent text-muted'
                    : 'bg-border text-muted'
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-3.5 mt-3">
            {[
              { color: 'bg-dark',    label: 'Done'    },
              { color: 'bg-accent',  label: 'Today'   },
              { color: 'bg-border',  label: 'Pending' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted">
                <div className={`w-2.5 h-2.5 rounded-[3px] ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
