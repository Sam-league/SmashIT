import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import { awardPoints, updateStreak, POINTS_COMPLETE } from './pointsService'
import { checkAndGrantAchievements } from './achievementService'

export async function completeTask(taskId: string, userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if already completed today
  const existingLog = await TaskLog.findOne({
    taskId,
    userId,
    date: { $gte: today },
    status: 'completed',
  })
  if (existingLog) {
    throw new Error('Task already completed today')
  }

  const log = await TaskLog.create({
    taskId,
    userId,
    date: new Date(),
    status: 'completed',
    points: POINTS_COMPLETE,
  })

  await awardPoints(userId, POINTS_COMPLETE)

  // Only increment streak on the first task completed today
  const todayCompletions = await TaskLog.countDocuments({
    userId,
    date: { $gte: today },
    status: 'completed',
  })
  if (todayCompletions <= 1) {
    await updateStreak(userId)
  }

  await checkAndGrantAchievements(userId)

  return log
}
