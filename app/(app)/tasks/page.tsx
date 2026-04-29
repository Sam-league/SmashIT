'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { useTodayTasks } from '@/hooks/useTasks'
import TaskCard from '@/components/ui/TaskCard'

type Filter = 'All' | 'Daily' | 'Scheduled' | 'Completed' | 'Missed'
const FILTERS: Filter[] = ['All', 'Daily', 'Scheduled', 'Completed', 'Missed']

export default function TasksPage() {
  const router = useRouter()
  const { data: todayTasks = [], isLoading } = useTodayTasks()
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')

  const all = todayTasks.filter((t) =>
    t.task.title.toLowerCase().includes(search.toLowerCase())
  )

  const daily     = all.filter((t) => t.task.type === 'daily'     && filter !== 'Scheduled' && filter !== 'Completed' && filter !== 'Missed')
  const scheduled = all.filter((t) => t.task.type === 'scheduled' && filter !== 'Daily'     && filter !== 'Completed' && filter !== 'Missed')
  const completed = all.filter((t) => t.status === 'completed')
  const missed    = all.filter((t) => t.status === 'missed')

  const showDaily     = filter === 'All' || filter === 'Daily'
  const showScheduled = filter === 'All' || filter === 'Scheduled'
  const showCompleted = filter === 'Completed'
  const showMissed    = filter === 'Missed'

  const dailySections     = all.filter((t) => t.task.type === 'daily')
  const scheduledSections = all.filter((t) => t.task.type === 'scheduled')
  const dailyDone         = dailySections.filter((t) => t.status === 'completed').length

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="px-[18px] pt-[14px] flex flex-col gap-3.5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="font-syne text-[22px] font-extrabold text-dark tracking-tight">My Tasks</h1>
          <button
            onClick={() => router.push('/tasks/create')}
            className="w-[34px] h-[34px] rounded-[10px] bg-accent flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(255,107,74,0.3)' }}
          >
            <Plus size={18} color="white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-4 py-[11px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-syne text-[11px] font-bold tracking-[0.04em] border-[1.5px] transition-colors ${
                filter === f
                  ? 'bg-dark border-dark text-white'
                  : 'bg-surface border-border text-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-2 mt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[62px] bg-surface border border-border rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">

            {/* Daily section */}
            {showDaily && dailySections.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
                  Daily · {dailyDone} of {dailySections.length}
                </span>
                {dailySections.map(({ task, status }) => (
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

            {/* Scheduled section */}
            {showScheduled && scheduledSections.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
                  Scheduled · {scheduledSections.filter((t) => t.status === 'pending').length} upcoming
                </span>
                {scheduledSections.map(({ task, status }) => {
                  const due = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      status={status}
                      timeLabel={due}
                      onClick={() => router.push(`/tasks/${task._id}`)}
                    />
                  )
                })}
              </div>
            )}

            {/* Completed filter */}
            {showCompleted && (
              completed.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-muted">
                    Completed · {completed.length}
                  </span>
                  {completed.map(({ task, status }) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      status={status}
                      timeLabel={task.type === 'scheduled' && task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : task.reminderTimes?.[0] ?? ''}
                      onClick={() => router.push(`/tasks/${task._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 gap-2">
                  <span className="text-3xl">✅</span>
                  <p className="text-[13px] text-muted">Completed tasks will appear here</p>
                </div>
              )
            )}

            {/* Missed filter */}
            {showMissed && (
              missed.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="font-syne text-[10px] font-bold tracking-[0.15em] uppercase text-[#ef9a9a]">
                    Missed · {missed.length}
                  </span>
                  {missed.map(({ task, status }) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      status={status}
                      timeLabel={task.reminderTimes?.[0] ?? ''}
                      onClick={() => router.push(`/tasks/${task._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 gap-2">
                  <span className="text-3xl">📉</span>
                  <p className="text-[13px] text-muted">No missed tasks</p>
                </div>
              )
            )}

            {/* Empty state for All/Daily/Scheduled */}
            {(filter === 'All' || filter === 'Daily' || filter === 'Scheduled') &&
              dailySections.length === 0 && scheduledSections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📭</span>
                <p className="text-[14px] font-semibold text-dark">No tasks found</p>
                <p className="text-[12px] text-muted text-center">
                  {search ? 'Try a different search term' : 'Create your first task to get started'}
                </p>
                {!search && (
                  <button
                    onClick={() => router.push('/tasks/create')}
                    className="mt-2 px-5 py-2.5 bg-accent text-white rounded-full font-syne text-[13px] font-bold"
                    style={{ boxShadow: '0 4px 16px rgba(255,107,74,0.3)' }}
                  >
                    + Create Task
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
