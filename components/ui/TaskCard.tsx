'use client'

import { ChevronRight, Check, X } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'

interface TaskCardProps {
  task: Task
  status?: TaskStatus
  timeLabel?: string
  points?: number
  showChevron?: boolean
  onClick?: () => void
  onComplete?: () => void
}

function StatusCheck({ status, onComplete }: { status: TaskStatus; onComplete?: () => void }) {
  if (status === 'completed') {
    return (
      <div className="w-[22px] h-[22px] rounded-[8px] bg-success border-2 border-success flex items-center justify-center flex-shrink-0">
        <Check size={11} color="white" strokeWidth={3} />
      </div>
    )
  }
  if (status === 'missed') {
    return (
      <div className="w-[22px] h-[22px] rounded-[8px] bg-[#ffebee] border-2 border-[#ef9a9a] flex items-center justify-center flex-shrink-0">
        <X size={11} color="#e53935" strokeWidth={3} />
      </div>
    )
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onComplete?.() }}
      className="w-[22px] h-[22px] rounded-[8px] border-2 border-accent flex items-center justify-center flex-shrink-0"
    />
  )
}

function TypePill({ task, status }: { task: Task; status: TaskStatus }) {
  if (status === 'completed') {
    return <span className="text-[9px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-full bg-success-lt text-success">Done</span>
  }
  if (status === 'missed') {
    return <span className="text-[9px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-full bg-[#ffebee] text-error">Missed</span>
  }
  if (task.type === 'daily') {
    return <span className="text-[9px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-full bg-accent-lt text-accent">Daily</span>
  }
  return <span className="text-[9px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-full bg-blue-lt text-blue">Scheduled</span>
}

export default function TaskCard({
  task,
  status = 'pending',
  timeLabel,
  points,
  showChevron = true,
  onClick,
  onComplete,
}: TaskCardProps) {
  const isMissed    = status === 'missed'
  const isCompleted = status === 'completed'

  const ptsClass =
    status === 'completed' ? 'text-success' :
    status === 'missed'    ? 'text-error'   : 'text-muted'
  const ptsLabel =
    status === 'missed'
      ? `−${task.penalty ?? 5}`
      : `+${task.points ?? 10}`

  return (
    <div
      onClick={onClick}
      className={`bg-surface border rounded-card p-[13px] flex items-center gap-2.5 shadow-card cursor-pointer active:scale-[0.99] transition-transform ${
        isMissed ? 'border-[#ffd0d0] bg-[#fff8f8]' : 'border-border'
      }`}
    >
      <StatusCheck status={status} onComplete={onComplete} />

      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-semibold truncate ${
            isCompleted ? 'line-through text-muted' : 'text-dark'
          }`}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TypePill task={task} status={status} />
          {timeLabel && (
            <span className="text-[10px] text-muted font-medium">{timeLabel}</span>
          )}
        </div>
      </div>

      <div className={`font-syne text-[12px] font-bold flex-shrink-0 ${ptsClass}`}>
        {ptsLabel}
      </div>

      {showChevron && (
        <ChevronRight size={14} className="text-border flex-shrink-0" strokeWidth={2} />
      )}
    </div>
  )
}
