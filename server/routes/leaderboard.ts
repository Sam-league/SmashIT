import { Router, Response } from 'express'
import User from '../models/User'
import Friendship from '../models/Friendship'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET /api/leaderboard
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Get all accepted friendships for the user
    const friendships = await Friendship.find({
      $or: [{ userId: req.userId }, { friendId: req.userId }],
      status: 'accepted',
    })

    const friendIds = friendships.map((f) =>
      f.userId.toString() === req.userId ? f.friendId : f.userId
    )

    // Include the current user + friends
    const userIds = [req.userId, ...friendIds]

    const users = await User.find({ _id: { $in: userIds } })
      .select('name points currentStreak')
      .sort({ points: -1 })

    const leaderboard = users.map((u, index) => ({
      userId:        u._id,
      name:          u.name,
      points:        u.points,
      currentStreak: u.currentStreak,
      rank:          index + 1,
    }))

    res.json(leaderboard)
  } catch {
    res.status(500).json({ message: 'Failed to fetch leaderboard' })
  }
})

export default router
