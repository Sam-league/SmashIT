import TaskLog from '../models/TaskLog'
import User from '../models/User'

export async function getDailyPoints(userId: string, days: number) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const logs = await TaskLog.find({
    userId,
    date: { $gte: since },
  }).sort({ date: 1 })

  // Group by date string
  const map = new Map<string, number>()
  for (const log of logs) {
    const key = log.date.toISOString().slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + log.points)
  }

  // Fill all days including zeroes
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, points: map.get(key) ?? 0 })
  }

  return result
}

export async function getAnalyticsSummary(userId: string) {
  const user = await User.findById(userId).select('points currentStreak bestStreak')
  const totalCompleted = await TaskLog.countDocuments({ userId, status: 'completed' })
  const totalMissed    = await TaskLog.countDocuments({ userId, status: 'missed' })
  const total = totalCompleted + totalMissed
  const completionRate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0

  return {
    totalPoints:    user?.points ?? 0,
    completionRate,
    currentStreak:  user?.currentStreak ?? 0,
    bestStreak:     user?.bestStreak ?? 0,
    totalCompleted,
    totalMissed,
  }
}
