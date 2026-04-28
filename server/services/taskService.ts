import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import User from '../models/User'
import { awardPoints, updateStreak, POINTS_COMPLETE } from './pointsService'
import { checkAndGrantAchievements } from './achievementService'
import { getUserMidnight } from './dateUtils'
import { sendPushNotification } from './notificationService'

export async function completeTask(taskId: string, userId: string, utcOffset = 0) {
  const { start, end } = getUserMidnight(utcOffset)

  // Check if already completed in user's current local day
  const existingLog = await TaskLog.findOne({
    taskId,
    userId,
    date: { $gte: start, $lt: end },
    status: 'completed',
  })
  if (existingLog) {
    throw new Error('Task already completed today')
  }

  const taskDoc = await Task.findById(taskId)
  const pts = taskDoc?.points ?? POINTS_COMPLETE

  const log = await TaskLog.create({
    taskId,
    userId,
    date: new Date(),
    status: 'completed',
    points: pts,
  })

  await awardPoints(userId, pts)

  // Only increment streak on the first task completed in user's local day
  const todayCompletions = await TaskLog.countDocuments({
    userId,
    date: { $gte: start, $lt: end },
    status: 'completed',
  })
  if (todayCompletions <= 1) {
    await updateStreak(userId)
  }

  await checkAndGrantAchievements(userId)

  const user = await User.findById(userId).select('fcmToken')
  await sendPushNotification(
    userId,
    user?.fcmToken ?? '',
    'Task Completed!',
    `+${pts} points for completing "${taskDoc?.title}"`
  )

  return log
}
