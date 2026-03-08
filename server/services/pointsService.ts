import User from '../models/User'

export const POINTS_COMPLETE = 10
export const POINTS_MISSED   = -5

export async function awardPoints(userId: string, delta: number): Promise<void> {
  await User.findByIdAndUpdate(userId, { $inc: { points: delta } })
}

export async function updateStreak(userId: string): Promise<void> {
  const user = await User.findById(userId)
  if (!user) return

  const newStreak = user.currentStreak + 1
  const bestStreak = Math.max(newStreak, user.bestStreak)
  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    bestStreak,
  })
}

export async function resetStreak(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { currentStreak: 0 })
}
