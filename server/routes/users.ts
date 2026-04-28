import { Router, Response } from 'express'
import User from '../models/User'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET /api/users/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    // Keep utcOffset in sync with the client's current timezone
    const user = await User.findByIdAndUpdate(
      req.userId,
      { utcOffset: req.utcOffset ?? 0 },
      { new: true }
    ).select('-password')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  } catch {
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// PATCH /api/users/me
router.patch('/me', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch {
    res.status(500).json({ message: 'Failed to update user' })
  }
})

// GET /api/users/:id — public profile
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('name email points currentStreak bestStreak')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  } catch {
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// POST /api/users/fcm-token
router.post('/fcm-token', async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken } = req.body
    await User.findByIdAndUpdate(req.userId, { fcmToken })
    res.json({ message: 'FCM token saved' })
  } catch {
    res.status(500).json({ message: 'Failed to save FCM token' })
  }
})

export default router
