import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import Notification from '../models/Notification'

const router = Router()
router.use(requireAuth)

// GET /api/notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch {
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// POST /api/notifications/read
router.post('/read', async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
    res.json({ message: 'Notifications marked as read' })
  } catch {
    res.status(500).json({ message: 'Failed to mark notifications as read' })
  }
})

export default router
