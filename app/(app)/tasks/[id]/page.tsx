'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Bell, Trash2, PenLine, CalendarDays, ArrowRight } from 'lucide-react'
import { useTask, useCompleteTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks'
import type { TaskStatus, TaskType } from '@/lib/types'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const { data, isLoading }                    = useTask(id)
  const { mutate: complete, isPending: completing } = useCompleteTask(id)
  const { mutate: remove,   isPending: deleting }   = useDeleteTask(id)
  const { mutate: update,   isPending: updating }   = useUpdateTask(id)

  const [editing,       setEditing]       = useState(false)
  const [editTitle,     setEditTitle]     = useState('')
  const [editType,      setEditType]      = useState<TaskType>('daily')
  const [editReminder,  setEditReminder]  = useState('06:00')
  const [editDueDate,   setEditDueDate]   = useState('')
  const [editPoints,    setEditPoints]    = useState(10)
  const [editPenalty,   setEditPenalty]   = useState(5)

  const openEdit = () => {
    if (!data) return
    setEditTitle(data.task.title)
    setEditType(data.task.type)
    setEditReminder(data.task.reminderTimes?.[0] ?? '09:00')
    setEditDueDate(data.task.dueDate ? data.task.dueDate.slice(0, 10) : '')
    setEditPoints(data.task.points ?? 10)
    setEditPenalty(data.task.penalty ?? 5)
    setEditing(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    update(
      {
        title:        editTitle.trim(),
        type:         editType,
        reminderTimes: [editReminder],
        dueDate:      editType === 'scheduled' ? editDueDate || undefined : undefined,
        points:       editPoints,
        penalty:      editPenalty,
      },
      { onSuccess: () => setEditing(false) }
    )
  }

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
          <button
            onClick={openEdit}
            className="px-3 py-[5px] rounded-full bg-white/10 font-syne text-[11px] font-bold text-white active:opacity-70 transition-opacity"
          >
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
            <Clock size={12} /> {task.reminderTimes?.join(', ') ?? ''}
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

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-dark/40 px-0">
          <div className="w-full max-w-[430px] bg-bg rounded-t-[24px] px-5 pt-5 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne text-[18px] font-extrabold text-dark">Edit Task</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-muted text-[13px] font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-3.5">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">Task Title</label>
                <div className="relative">
                  <PenLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">Task Type</label>
                <div className="flex gap-2">
                  {(['daily', 'scheduled'] as TaskType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditType(t)}
                      className={`flex-1 py-3 rounded-card border-[1.5px] flex flex-col items-center gap-1 transition-colors ${
                        editType === t ? 'border-accent bg-accent-lt' : 'border-border bg-surface'
                      }`}
                    >
                      <span className="text-[20px]">{t === 'daily' ? '🔁' : '📅'}</span>
                      <span className={`font-syne text-[11px] font-bold capitalize ${editType === t ? 'text-accent' : 'text-muted'}`}>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminder Time */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">Reminder Time</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="time"
                    value={editReminder}
                    onChange={(e) => setEditReminder(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Due Date (scheduled only) */}
              {editType === 'scheduled' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">Due Date</label>
                  <div className="relative">
                    <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Points */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">Points</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-success">✓ Complete</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-success pointer-events-none">+</span>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={editPoints}
                        onChange={(e) => setEditPoints(Math.max(1, parseInt(e.target.value) || 10))}
                        className="w-full pl-6 pr-3 py-2.5 bg-success-lt border border-[#c8e6c9] rounded-card font-syne text-[13px] font-bold text-success outline-none focus:border-success transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-error">✕ Miss penalty</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-error pointer-events-none">−</span>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={editPenalty}
                        onChange={(e) => setEditPenalty(Math.max(0, parseInt(e.target.value) || 5))}
                        className="w-full pl-6 pr-3 py-2.5 bg-[#ffebee] border border-[#ffcdd2] rounded-card font-syne text-[13px] font-bold text-error outline-none focus:border-error transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updating || !editTitle.trim()}
                className="w-full py-[15px] mt-1 bg-accent text-white rounded-full font-syne text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                style={{ boxShadow: '0 4px 16px rgba(255,107,74,0.3)' }}
              >
                {updating ? 'Saving…' : <><span>Save Changes</span><ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
