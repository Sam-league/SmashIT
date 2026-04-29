import cron from 'node-cron'
import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import User, { IUser } from '../models/User'
import { sendPushNotification } from '../services/notificationService'
import { getUserMidnight } from '../services/dateUtils'

function currentHHMM(utcOffset: number): string {
  const now = new Date()
  const local = new Date(now.getTime() + utcOffset * 60_000)
  const h = String(local.getUTCHours()).padStart(2, '0')
  const m = String(local.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth()    === b.getUTCMonth() &&
    a.getUTCDate()     === b.getUTCDate()
  )
}

async function processRemindersForUser(userId: string, fcmToken: string, utcOffset: number) {
  const hhmm = currentHHMM(utcOffset)
  const { start, end } = getUserMidnight(utcOffset)
  const now = new Date()

  const tasks = await Task.find({ userId })

  for (const task of tasks) {
    const times: string[] = task.reminderTimes ?? []
    if (!times.includes(hhmm)) continue

    if (task.type === 'daily') {
      // Skip if already completed today
      const done = await TaskLog.findOne({
        taskId: task._id,
        userId,
        date:   { $gte: start, $lt: end },
        status: 'completed',
      })
      if (done) continue

      await sendPushNotification(
        userId,
        fcmToken,
        `Reminder: ${task.title}`,
        `Time to complete your daily task! +${task.points} points on completion.`
      )
    } else if (task.type === 'scheduled' && task.dueDate) {
      // Only remind on the due date
      const localNow = new Date(now.getTime() + utcOffset * 60_000)
      const localDue = new Date(task.dueDate.getTime() + utcOffset * 60_000)
      if (!isSameDay(localNow, localDue)) continue

      // Skip if already completed
      const done = await TaskLog.findOne({ taskId: task._id, userId, status: 'completed' })
      if (done) continue

      await sendPushNotification(
        userId,
        fcmToken,
        `Reminder: ${task.title}`,
        `This task is due today! +${task.points} points on completion.`
      )
    }
  }
}

export function startReminderCron() {
  cron.schedule('* * * * *', async () => {
    try {
      const users = await User.find({}).select('_id fcmToken utcOffset') as (IUser & { utcOffset: number })[]
      for (const user of users) {
        await processRemindersForUser(
          user._id.toString(),
          user.fcmToken ?? '',
          user.utcOffset ?? 0
        )
      }
    } catch (err) {
      console.error('Reminder cron failed:', err)
    }
  })

  console.log('Reminder cron started')
}
