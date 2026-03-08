import cron from 'node-cron'
import Task from '../models/Task'
import TaskLog from '../models/TaskLog'
import User from '../models/User'
import { awardPoints, resetStreak, POINTS_MISSED } from '../services/pointsService'
import { sendPushNotification } from '../services/notificationService'

export function startMissedTasksCron() {
  // Runs at 00:01 every night
  cron.schedule('1 0 * * *', async () => {
    console.log('Running missed tasks cron job...')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    try {
      // Handle daily tasks
      const dailyTasks = await Task.find({ type: 'daily' })

      for (const task of dailyTasks) {
        const completedToday = await TaskLog.findOne({
          taskId: task._id,
          userId: task.userId,
          date: { $gte: today, $lt: tomorrow },
          status: 'completed',
        })

        if (!completedToday) {
          const alreadyMissed = await TaskLog.findOne({
            taskId: task._id,
            userId: task.userId,
            date: { $gte: today, $lt: tomorrow },
            status: 'missed',
          })

          if (!alreadyMissed) {
            await TaskLog.create({
              taskId: task._id,
              userId: task.userId,
              date:   today,
              status: 'missed',
              points: POINTS_MISSED,
            })

            await awardPoints(task.userId.toString(), POINTS_MISSED)

            // Check if user had any completed tasks today before resetting
            const anyCompletedToday = await TaskLog.findOne({
              userId: task.userId,
              date:   { $gte: today, $lt: tomorrow },
              status: 'completed',
            })

            if (!anyCompletedToday) {
              await resetStreak(task.userId.toString())
            }

            // Send push notification
            const user = await User.findById(task.userId).select('fcmToken')
            await sendPushNotification(
              task.userId.toString(),
              user?.fcmToken ?? '',
              'Missed Task',
              `You missed "${task.title}" today. -5 points`
            )
          }
        }
      }

      // Handle scheduled tasks that are overdue
      const overdueTasks = await Task.find({
        type: 'scheduled',
        dueDate: { $lt: today },
      })

      for (const task of overdueTasks) {
        const alreadyLogged = await TaskLog.findOne({
          taskId: task._id,
          userId: task.userId,
        })

        if (!alreadyLogged) {
          await TaskLog.create({
            taskId: task._id,
            userId: task.userId,
            date:   task.dueDate ?? today,
            status: 'missed',
            points: POINTS_MISSED,
          })

          await awardPoints(task.userId.toString(), POINTS_MISSED)

          const user = await User.findById(task.userId).select('fcmToken')
          await sendPushNotification(
            task.userId.toString(),
            user?.fcmToken ?? '',
            'Missed Task',
            `You missed "${task.title}". -5 points`
          )
        }
      }

      console.log('Missed tasks cron job completed')
    } catch (err) {
      console.error('Missed tasks cron job failed:', err)
    }
  })
}
