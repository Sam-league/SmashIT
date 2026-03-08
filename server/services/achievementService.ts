import User from '../models/User'
import TaskLog from '../models/TaskLog'
import UserAchievement from '../models/UserAchievement'

interface AchievementDef {
  id:          string
  name:        string
  description: string
  icon:        string
  points:      number
  check:       (userId: string) => Promise<boolean>
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_task', name: 'First Task',
    description: 'Complete your first task', icon: '🎯', points: 0,
    check: async (userId) => {
      const count = await TaskLog.countDocuments({ userId, status: 'completed' })
      return count >= 1
    },
  },
  {
    id: 'streak_7', name: '7 Day Streak',
    description: 'Maintain a 7-day streak', icon: '🔥', points: 0,
    check: async (userId) => {
      const user = await User.findById(userId)
      return (user?.currentStreak ?? 0) >= 7
    },
  },
  {
    id: 'streak_30', name: '30 Day Streak',
    description: 'Maintain a 30-day streak', icon: '💎', points: 0,
    check: async (userId) => {
      const user = await User.findById(userId)
      return (user?.currentStreak ?? 0) >= 30
    },
  },
  {
    id: 'points_100', name: '100 Points',
    description: 'Earn 100 points', icon: '⭐', points: 0,
    check: async (userId) => {
      const user = await User.findById(userId)
      return (user?.points ?? 0) >= 100
    },
  },
  {
    id: 'points_500', name: '500 Points',
    description: 'Earn 500 points', icon: '🏆', points: 0,
    check: async (userId) => {
      const user = await User.findById(userId)
      return (user?.points ?? 0) >= 500
    },
  },
  {
    id: 'tasks_10', name: '10 Tasks Done',
    description: 'Complete 10 tasks total', icon: '✅', points: 0,
    check: async (userId) => {
      const count = await TaskLog.countDocuments({ userId, status: 'completed' })
      return count >= 10
    },
  },
  {
    id: 'tasks_50', name: '50 Tasks Done',
    description: 'Complete 50 tasks total', icon: '🚀', points: 0,
    check: async (userId) => {
      const count = await TaskLog.countDocuments({ userId, status: 'completed' })
      return count >= 50
    },
  },
  {
    id: 'tasks_100', name: '100 Tasks Done',
    description: 'Complete 100 tasks total', icon: '👑', points: 0,
    check: async (userId) => {
      const count = await TaskLog.countDocuments({ userId, status: 'completed' })
      return count >= 100
    },
  },
]

export async function checkAndGrantAchievements(userId: string): Promise<string[]> {
  const existing = await UserAchievement.find({ userId }).select('achievementName')
  const existingNames = new Set(existing.map((a) => a.achievementName))

  const newlyUnlocked: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (existingNames.has(achievement.id)) continue
    const earned = await achievement.check(userId)
    if (earned) {
      await UserAchievement.create({
        userId,
        achievementName: achievement.id,
        dateUnlocked: new Date(),
      })
      newlyUnlocked.push(achievement.id)
    }
  }

  return newlyUnlocked
}

export { ACHIEVEMENTS }
