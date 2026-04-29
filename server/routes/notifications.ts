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

// POST /api/notifications/test — creates a test notification for debugging
router.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    const notif = await Notification.create({
      userId: req.userId,
      title:  'Test Notification',
      body:   'If you see this, DB notifications are working.',
    })
    res.json(notif)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create test notification', error: String(err) })
  }
})

export default router
