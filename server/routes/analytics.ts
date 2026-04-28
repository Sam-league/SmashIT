import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { getDailyPoints, getAnalyticsSummary } from '../services/analyticsService'

const router = Router()
router.use(requireAuth)

// GET /api/analytics/daily?days=7
router.get('/daily', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7
    const data = await getDailyPoints(req.userId!, days, req.utcOffset ?? 0)
    res.json(data)
  } catch {
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

// GET /api/analytics/summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const summary = await getAnalyticsSummary(req.userId!)
    res.json(summary)
  } catch {
    res.status(500).json({ message: 'Failed to fetch summary' })
  }
})

export default router
