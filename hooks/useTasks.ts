'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Task, TaskLog, TaskStatus, TaskWithStatus } from '@/lib/types'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get<Task[]>('/api/tasks')
      return data
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await api.get<{ task: Task; logs: TaskLog[] }>(`/api/tasks/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Task, '_id' | 'userId' | 'createdAt'>) => {
      const { data } = await api.post<Task>('/api/tasks', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.patch<Task>(`/api/tasks/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}

export function useDeleteTask(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/tasks/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useTodayTasks() {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const { data } = await api.get<TaskWithStatus[]>('/api/tasks/today')
      return data
    },
  })
}

export function useCompleteTask(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ log: TaskLog; points: number }>(
        `/api/tasks/${id}/complete`
      )
      return data
    },

    // Instantly mark the task done in the UI before the server responds.
    // If the server rejects it (e.g. already completed) we roll back.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'today'] })
      await queryClient.cancelQueries({ queryKey: ['tasks', id] })

      const prevToday  = queryClient.getQueryData<TaskWithStatus[]>(['tasks', 'today'])
      const prevDetail = queryClient.getQueryData<{ task: Task; logs: TaskLog[] }>(['tasks', id])

      queryClient.setQueryData<TaskWithStatus[]>(['tasks', 'today'], (old) =>
        old?.map((t) =>
          t.task._id === id ? { ...t, status: 'completed' as TaskStatus } : t
        )
      )

      return { prevToday, prevDetail }
    },

    onError: (_err, _vars, context) => {
      if (context?.prevToday)  queryClient.setQueryData(['tasks', 'today'], context.prevToday)
      if (context?.prevDetail) queryClient.setQueryData(['tasks', id],      context.prevDetail)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
