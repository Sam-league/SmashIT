'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PenLine, Clock, CalendarDays, Bell, ArrowRight, Plus, X } from 'lucide-react'
import { useCreateTask } from '@/hooks/useTasks'
import type { TaskType } from '@/lib/types'

export default function CreateTaskPage() {
  const router = useRouter()
  const { mutate: createTask, isPending, error } = useCreateTask()

  const [title,         setTitle]         = useState('')
  const [type,          setType]          = useState<TaskType>('daily')
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00'])
  const [dueDate,       setDueDate]       = useState('')
  const [points,        setPoints]        = useState(10)
  const [penalty,       setPenalty]       = useState(5)

  function addTime() {
    setReminderTimes((prev) => [...prev, '09:00'])
  }

  function removeTime(idx: number) {
    setReminderTimes((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateTime(idx: number, val: string) {
    setReminderTimes((prev) => prev.map((t, i) => (i === idx ? val : t)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createTask(
      {
        title: title.trim(),
        type,
        reminderTimes,
        dueDate: type === 'scheduled' ? dueDate || undefined : undefined,
        points,
        penalty,
      },
      { onSuccess: () => router.push('/tasks') }
    )
  }

  const errorMsg = error
    ? ((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create task')
    : null

  return (
    <div className="min-h-dvh bg-bg relative overflow-x-hidden">
      <div className="px-5 pt-[14px] pb-24 flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="w-[34px] h-[34px] rounded-[10px] bg-surface border border-border flex items-center justify-center shadow-card flex-shrink-0"
          >
            <ArrowLeft size={15} className="text-dark" strokeWidth={2} />
          </button>
          <h1 className="font-syne text-[20px] font-extrabold text-dark tracking-tight">New Task</h1>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-error text-[12px] font-medium rounded-[10px] px-3 py-2.5">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
              Task Title
            </label>
            <div className="relative">
              <PenLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning run"
                required
                className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Task Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
              Task Type
            </label>
            <div className="flex gap-2">
              {(['daily', 'scheduled'] as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 rounded-card border-[1.5px] flex flex-col items-center gap-1 transition-colors ${
                    type === t ? 'border-accent bg-accent-lt' : 'border-border bg-surface'
                  }`}
                >
                  <span className="text-[20px]">{t === 'daily' ? '🔁' : '📅'}</span>
                  <span className={`font-syne text-[11px] font-bold tracking-[0.04em] capitalize ${type === t ? 'text-accent' : 'text-muted'}`}>
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Times */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark flex items-center gap-1.5">
                <Bell size={11} />
                {type === 'daily' ? 'Reminder Times' : 'Reminder Time'}
              </label>
              {type === 'daily' && (
                <button
                  type="button"
                  onClick={addTime}
                  className="flex items-center gap-1 text-[10px] font-bold text-accent"
                >
                  <Plus size={11} strokeWidth={2.5} />
                  Add time
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {reminderTimes.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => updateTime(idx, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  {type === 'daily' && reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(idx)}
                      className="w-8 h-8 rounded-[10px] bg-[#ffebee] flex items-center justify-center flex-shrink-0"
                    >
                      <X size={13} className="text-error" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted">
              {type === 'daily'
                ? "You'll get a push reminder at each time — only if the task isn't done yet."
                : "You'll get a reminder at this time on the due date."}
            </p>
          </div>

          {/* Due Date (scheduled only) */}
          {type === 'scheduled' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
                Due Date
              </label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          )}

          {/* Points */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
              Points
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-success">✓ Complete</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-success pointer-events-none">+</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={points}
                    onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 10))}
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
                    value={penalty}
                    onChange={(e) => setPenalty(Math.max(0, parseInt(e.target.value) || 5))}
                    className="w-full pl-6 pr-3 py-2.5 bg-[#ffebee] border border-[#ffcdd2] rounded-card font-syne text-[13px] font-bold text-error outline-none focus:border-error transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="w-full py-[15px] mt-2 bg-accent text-white rounded-full font-syne text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ boxShadow: '0 4px 16px rgba(255,107,74,0.3)' }}
          >
            {isPending
              ? 'Creating…'
              : <><span>Create Task</span><ArrowRight size={16} strokeWidth={2.5} /></>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
