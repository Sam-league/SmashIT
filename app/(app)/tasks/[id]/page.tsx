'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Bell, Trash2 } from 'lucide-react'
import { useTask, useCompleteTask, useDeleteTask } from '@/hooks/useTasks'
import type { TaskStatus } from '@/lib/types'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const { data, isLoading }                    = useTask(id)
  const { mutate: complete, isPending: completing } = useCompleteTask(id)
  const { mutate: remove,   isPending: deleting }   = useDeleteTask(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted text-[13px]">Loading…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted text-[13px]">Task not found</p>
      </div>
    )
  }

  const { task, logs } = data

  // Today's log
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const todayLog = logs.find((l) => {
    const d = new Date(l.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === todayMidnight.getTime()
  })
  const currentStatus: TaskStatus = todayLog?.status ?? 'pending'

  // Stats
  const totalCompleted = logs.filter((l) => l.status === 'completed').length
  const totalMissed    = logs.filter((l) => l.status === 'missed').length
  const totalPoints    = logs.reduce((sum, l) => sum + l.points, 0)

  // Consecutive streak for this task
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let streak = 0
  for (const log of sorted) {
    if (log.status === 'completed') streak++
    else break
  }

  const handleComplete = () => {
    complete(undefined, { onSuccess: () => {} })
  }

  const handleDelete = () => {
    if (!confirm('Delete this task? This cannot be undone.')) return
    remove(undefined, { onSuccess: () => router.push('/tasks') })
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">

      {/* ── Hero ── */}
      <div className="bg-dark px-5 pt-5 pb-7 relative overflow-hidden flex-shrink-0">
        {/* decorative blob */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 -top-16 -right-10 pointer-events-none" />

        {/* top row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <button className="px-3 py-[5px] rounded-full bg-white/10 font-syne text-[11px] font-bold text-white">
            Edit
          </button>
        </div>

        {/* type pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold tracking-wider uppercase mb-2">
          {task.type === 'daily' ? '🔁' : '📅'} {task.type === 'daily' ? 'Daily Task' : 'Scheduled Task'}
        </div>

        {/* title */}
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight leading-snug mb-3">
          {task.title}
        </h1>

        {/* meta row */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Clock size={12} /> {task.reminderTime}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Bell size={12} /> Reminder on
          </div>
          <div
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold font-syne ${
              currentStatus === 'completed'
                ? 'bg-success/20 text-success'
                : currentStatus === 'missed'
                ? 'bg-error/20 text-error'
                : 'bg-warn/20 text-warn'
            }`}
          >
            {currentStatus === 'completed' ? '✅ Done' : currentStatus === 'missed' ? '✕ Missed' : '⏳ Pending'}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-[18px] space-y-4 pb-24">

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Streak',       value: `🔥 ${streak} days` },
            { label: 'Total Done',   value: `✅ ${totalCompleted} times` },
            { label: 'Points Earned', value: `+${Math.max(totalPoints, 0)} pts`, cls: 'text-success' },
            { label: 'Times Missed', value: `${totalMissed} times`,              cls: 'text-error'   },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-surface border border-border rounded-card p-3">
              <p className="font-syne text-[9px] font-bold tracking-[0.12em] uppercase text-muted mb-1">{label}</p>
              <p className={`text-[13px] font-bold text-dark ${cls ?? ''}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Recent log */}
        {logs.length > 0 && (
          <div>
            <p className="font-syne text-[12px] font-bold text-dark tracking-wider uppercase mb-3">
              Recent Log
            </p>
            <div>
              {logs.slice(0, 5).map((log, i) => {
                const isDone   = log.status === 'completed'
                const logDate  = new Date(log.date)
                const yesterday = new Date(todayMidnight.getTime() - 86400000)
                const dateLabel = logDate.toDateString() === yesterday.toDateString()
                  ? `Yesterday · ${logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const isLast = i === Math.min(logs.length, 5) - 1

                return (
                  <div key={log._id} className="flex items-start gap-3 relative pb-3">
                    {!isLast && (
                      <div className="absolute left-3 top-6 bottom-0 w-px bg-border" />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] border-2 z-10 ${
                        isDone
                          ? 'bg-success border-success text-white'
                          : 'bg-[#ffebee] border-[#ef9a9a] text-error'
                      }`}
                    >
                      {isDone ? '✓' : '✕'}
                    </div>
                    <div className="flex-1 pt-[2px]">
                      <p className="text-[12px] font-semibold text-dark">{isDone ? 'Completed' : 'Missed'}</p>
                      <p className="text-[10px] text-muted mt-[1px]">{dateLabel}</p>
                    </div>
                    <span
                      className={`font-syne text-[11px] font-bold pt-[3px] flex-shrink-0 ${
                        isDone ? 'text-success' : 'text-error'
                      }`}
                    >
                      {isDone ? '+10' : '−5'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleComplete}
            disabled={completing || currentStatus === 'completed'}
            className="flex-1 py-[14px] bg-dark text-white rounded-full font-syne text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed active:opacity-90 transition-opacity"
            style={{ boxShadow: '0 4px 16px rgba(26,26,46,0.15)' }}
          >
            {completing
              ? 'Marking…'
              : currentStatus === 'completed'
              ? '✓ Completed!'
              : 'Mark Complete ✓'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-[46px] h-[46px] rounded-full bg-[#ffebee] flex items-center justify-center active:opacity-80 transition-opacity disabled:opacity-50"
          >
            <Trash2 size={16} className="text-error" />
          </button>
        </div>

      </div>
    </div>
  )
}
