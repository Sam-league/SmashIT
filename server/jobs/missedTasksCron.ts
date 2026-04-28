import cron from 'node-cron'
import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import User, { IUser } from '../models/User'
import { awardPoints, resetStreak, POINTS_MISSED } from '../services/pointsService'
import { sendPushNotification } from '../services/notificationService'
import { getUserMidnight, getUserYesterday } from '../services/dateUtils'

async function processMissedTasksForUser(userId: string, fcmToken: string, utcOffset: number) {
  const { start, end } = getUserYesterday(utcOffset)

  // Handle daily tasks
  const dailyTasks = await Task.find({ type: 'daily', userId })

  for (const task of dailyTasks) {
    const completedYesterday = await TaskLog.findOne({
      taskId: task._id,
      userId: task.userId,
      date: { $gte: start, $lt: end },
      status: 'completed',
    })

    if (!completedYesterday) {
      const alreadyMissed = await TaskLog.findOne({
        taskId: task._id,
        userId: task.userId,
        date: { $gte: start, $lt: end },
        status: 'missed',
      })

      if (!alreadyMissed) {
        const penalty = -(task.penalty ?? 5)
        await TaskLog.create({
          taskId: task._id,
          userId: task.userId,
          date:   start,
          status: 'missed',
          points: penalty,
        })

        await awardPoints(task.userId.toString(), penalty)

        const anyCompletedYesterday = await TaskLog.findOne({
          userId: task.userId,
          date:   { $gte: start, $lt: end },
          status: 'completed',
        })

        if (!anyCompletedYesterday) {
          await resetStreak(task.userId.toString())
        }

        await sendPushNotification(
          task.userId.toString(),
          fcmToken,
          'Missed Task',
          `You missed "${task.title}" yesterday. -5 points`
        )
      }
    }
  }

  // Handle overdue scheduled tasks (dueDate is before user's today start)
  const { start: todayStart } = getUserMidnight(utcOffset)
  const overdueTasks = await Task.find({
    type:    'scheduled',
    userId,
    dueDate: { $lt: todayStart },
  })

  for (const task of overdueTasks) {
    const alreadyLogged = await TaskLog.findOne({
      taskId: task._id,
      userId: task.userId,
    })

    if (!alreadyLogged) {
      const penalty = -(task.penalty ?? 5)
      await TaskLog.create({
        taskId: task._id,
        userId: task.userId,
        date:   task.dueDate ?? start,
        status: 'missed',
        points: penalty,
      })

      await awardPoints(task.userId.toString(), penalty)

      await sendPushNotification(
        task.userId.toString(),
        fcmToken,
        'Missed Task',
        `You missed "${task.title}". -5 points`
      )
    }
  }
}

export function startMissedTasksCron() {
  // Run every minute; for each user, trigger at their local 00:01
  cron.schedule('* * * * *', async () => {
    const now = new Date()

    try {
      const users = await User.find({}).select('_id fcmToken utcOffset') as (IUser & { utcOffset: number })[]

      for (const user of users) {
        const offset = user.utcOffset ?? 0
        // What hour:minute is it for this user right now?
        const userLocal = new Date(now.getTime() + offset * 60_000)
        const h = userLocal.getUTCHours()
        const m = userLocal.getUTCMinutes()

        if (h === 0 && m === 1) {
          await processMissedTasksForUser(
            user._id.toString(),
            user.fcmToken ?? '',
            offset
          )
        }
      }
    } catch (err) {
      console.error('Missed tasks cron job failed:', err)
    }
  })

  console.log('Missed tasks cron started (per-user timezone)')
}
