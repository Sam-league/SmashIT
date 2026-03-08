'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PenLine, Clock, CalendarDays, Bell, ArrowRight } from 'lucide-react'
import { useCreateTask } from '@/hooks/useTasks'
import type { TaskType } from '@/lib/types'

export default function CreateTaskPage() {
  const router = useRouter()
  const { mutate: createTask, isPending, error } = useCreateTask()

  const [title,        setTitle]        = useState('')
  const [type,         setType]         = useState<TaskType>('daily')
  const [reminderTime, setReminderTime] = useState('06:00')
  const [dueDate,      setDueDate]      = useState('')
  const [reminder,     setReminder]     = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createTask(
      {
        title: title.trim(),
        type,
        reminderTime,
        dueDate: type === 'scheduled' ? dueDate || undefined : undefined,
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
                    type === t
                      ? 'border-accent bg-accent-lt'
                      : 'border-border bg-surface'
                  }`}
                >
                  <span className="text-[20px]">{t === 'daily' ? '🔁' : '📅'}</span>
                  <span
                    className={`font-syne text-[11px] font-bold tracking-[0.04em] capitalize ${
                      type === t ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Time */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
              Reminder Time
            </label>
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark outline-none focus:border-accent transition-colors"
              />
            </div>
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

          {/* Push Reminder toggle */}
          <div className="bg-surface border border-border rounded-card p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell size={18} className="text-muted" strokeWidth={1.8} />
              <div>
                <p className="text-[12px] font-semibold text-dark">Push Reminder</p>
                <p className="text-[10px] text-muted">Get notified before deadline</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                reminder ? 'bg-accent' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all ${
                  reminder ? 'right-[3px]' : 'left-[3px]'
                }`}
              />
            </button>
          </div>

          {/* Points preview */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-dark">
              Points
            </label>
            <div className="flex gap-2">
              <div className="flex-1 py-2.5 px-3 rounded-card border border-[#c8e6c9] bg-success-lt flex items-center gap-1.5 text-[12px] font-bold text-success">
                ✓ Complete <strong>+10 pts</strong>
              </div>
              <div className="flex-1 py-2.5 px-3 rounded-card border border-[#ffcdd2] bg-[#ffebee] flex items-center gap-1.5 text-[12px] font-bold text-error">
                ✕ Miss <strong>−5 pts</strong>
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
