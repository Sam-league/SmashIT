import { Router, Response } from 'express'
import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { completeTask } from '../services/taskService'
import { getUserMidnight } from '../services/dateUtils'

const router = Router()
router.use(requireAuth)

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch {
    res.status(500).json({ message: 'Failed to fetch tasks' })
  }
})

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, dueDate, reminderTimes, points, penalty } = req.body
    if (!title || !type) {
      res.status(400).json({ message: 'title and type are required' })
      return
    }
    const times = Array.isArray(reminderTimes) && reminderTimes.length > 0
      ? reminderTimes
      : ['09:00']
    const task = await Task.create({
      userId: req.userId,
      title,
      type,
      dueDate:       dueDate ?? undefined,
      reminderTimes: times,
      points:        typeof points  === 'number' && points  > 0 ? points  : 10,
      penalty:       typeof penalty === 'number' && penalty > 0 ? penalty : 5,
    })
    res.status(201).json(task)
  } catch {
    res.status(500).json({ message: 'Failed to create task' })
  }
})

// GET /api/tasks/today — returns all tasks enriched with today's log status
router.get('/today', async (req: AuthRequest, res: Response) => {
  try {
    const { start, end } = getUserMidnight(req.utcOffset ?? 0)

    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
    const logs = await TaskLog.find({
      userId: req.userId,
      date: { $gte: start, $lt: end },
    })

    const logMap = new Map(logs.map((l) => [l.taskId.toString(), l]))

    const result = tasks.map((task) => {
      const log = logMap.get(task._id.toString())
      return {
        task,
        status: log?.status ?? 'pending',
        points: log?.points ?? 0,
      }
    })

    res.json(result)
  } catch {
    res.status(500).json({ message: "Failed to fetch today's tasks" })
  }
})

// GET /api/tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    const logs = await TaskLog.find({ taskId: task._id }).sort({ date: -1 }).limit(30)
    res.json({ task, logs })
  } catch {
    res.status(500).json({ message: 'Failed to fetch task' })
  }
})

// PATCH /api/tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    res.json(task)
  } catch {
    res.status(500).json({ message: 'Failed to update task' })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    res.json({ message: 'Task deleted' })
  } catch {
    res.status(500).json({ message: 'Failed to delete task' })
  }
})

// POST /api/tasks/:id/complete
router.post('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    const log = await completeTask(req.params.id, req.userId!, req.utcOffset ?? 0)
    res.json({ log, points: 10 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete task'
    res.status(400).json({ message })
  }
})

export default router
