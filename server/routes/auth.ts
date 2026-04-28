import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = Router()

function signAccess(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
}

function signRefresh(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' })
      return
    }

    const exists = await User.findOne({ email })
    if (exists) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })

    const accessToken  = signAccess(user._id.toString())
    const refreshToken = signRefresh(user._id.toString())

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   true,
      sameSite: 'none',   // required for cross-origin (Vercel → Railway)
      maxAge:   30 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      accessToken,
      user: {
        _id: user._id, name: user.name, email: user.email,
        points: user.points, currentStreak: user.currentStreak,
        bestStreak: user.bestStreak, createdAt: user.createdAt,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const accessToken  = signAccess(user._id.toString())
    const refreshToken = signRefresh(user._id.toString())

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   true,
      sameSite: 'none',   // required for cross-origin (Vercel → Railway)
      maxAge:   30 * 24 * 60 * 60 * 1000,
    })

    res.json({
      accessToken,
      user: {
        _id: user._id, name: user.name, email: user.email,
        points: user.points, currentStreak: user.currentStreak,
        bestStreak: user.bestStreak, createdAt: user.createdAt,
      },
    })
  } catch {
    res.status(500).json({ message: 'Login failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' })
  res.json({ message: 'Logged out' })
})

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    res.status(401).json({ message: 'No refresh token' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string }
    const accessToken = signAccess(payload.userId)
    res.json({ accessToken })
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

export default router
