import { Router, Response } from 'express'
import User from '../models/User'
import Friendship from '../models/Friendship'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET /api/friends/pending — incoming friend requests for current user
router.get('/pending', async (req: AuthRequest, res: Response) => {
  try {
    const pending = await Friendship.find({
      friendId: req.userId,
      status: 'pending',
    }).populate('userId', 'name email points currentStreak')
    res.json(pending)
  } catch {
    res.status(500).json({ message: 'Failed to fetch pending requests' })
  }
})

// GET /api/friends
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const friendships = await Friendship.find({
      $or: [{ userId: req.userId }, { friendId: req.userId }],
      status: 'accepted',
    }).populate('userId friendId', 'name email points currentStreak')
    res.json(friendships)
  } catch {
    res.status(500).json({ message: 'Failed to fetch friends' })
  }
})

// GET /api/friends/search?q=
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string
    if (!q) {
      res.json([])
      return
    }
    const users = await User.find({
      _id: { $ne: req.userId },
      name: { $regex: q, $options: 'i' },
    }).select('name email points currentStreak').limit(20)
    res.json(users)
  } catch {
    res.status(500).json({ message: 'Search failed' })
  }
})

// POST /api/friends/request
router.post('/request', async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId } = req.body
    const existing = await Friendship.findOne({
      $or: [
        { userId: req.userId, friendId: targetUserId },
        { userId: targetUserId, friendId: req.userId },
      ],
    })
    if (existing) {
      res.status(409).json({ message: 'Friend request already exists' })
      return
    }
    const friendship = await Friendship.create({
      userId:   req.userId,
      friendId: targetUserId,
      status:   'pending',
    })
    res.status(201).json(friendship)
  } catch {
    res.status(500).json({ message: 'Failed to send friend request' })
  }
})

// PATCH /api/friends/:id/accept
router.patch('/:id/accept', async (req: AuthRequest, res: Response) => {
  try {
    const friendship = await Friendship.findOneAndUpdate(
      { _id: req.params.id, friendId: req.userId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    )
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' })
      return
    }
    res.json(friendship)
  } catch {
    res.status(500).json({ message: 'Failed to accept friend request' })
  }
})

// DELETE /api/friends/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Friendship.findOneAndDelete({
      _id: req.params.id,
      $or: [{ userId: req.userId }, { friendId: req.userId }],
    })
    res.json({ message: 'Friendship removed' })
  } catch {
    res.status(500).json({ message: 'Failed to remove friend' })
  }
})

export default router
