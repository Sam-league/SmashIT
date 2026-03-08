import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import UserAchievement from '../models/UserAchievement'
import { ACHIEVEMENTS } from '../services/achievementService'

const router = Router()
router.use(requireAuth)

// GET /api/achievements
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const unlocked = await UserAchievement.find({ userId: req.userId })
    const unlockedMap = new Map(unlocked.map((a) => [a.achievementName, a.dateUnlocked]))

    const result = ACHIEVEMENTS.map((ach) => {
      const dateUnlocked = unlockedMap.get(ach.id)
      return {
        id:           ach.id,
        name:         ach.name,
        description:  ach.description,
        icon:         ach.icon,
        points:       ach.points,
        unlocked:     unlockedMap.has(ach.id),
        dateUnlocked: dateUnlocked ? dateUnlocked.toISOString() : undefined,
      }
    })

    res.json(result)
  } catch {
    res.status(500).json({ message: 'Failed to fetch achievements' })
  }
})

export default router
