import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import userRoutes from './routes/users'
import friendRoutes from './routes/friends'
import leaderboardRoutes from './routes/leaderboard'
import analyticsRoutes from './routes/analytics'
import notificationRoutes from './routes/notifications'
import achievementRoutes from './routes/achievements'
import { errorHandler } from './middleware/errorHandler'
import { startMissedTasksCron } from './jobs/missedTasksCron'
import { startReminderCron } from './jobs/reminderCron'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 4000

// Middleware
app.use(compression())
app.use(cors({
  origin:         process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials:    true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-utc-offset'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Prevent browsers and proxies from caching API responses.
// React Query handles its own caching on the client side.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// Routes
app.use('/api/auth',          authRoutes)
app.use('/api/tasks',         taskRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/friends',       friendRoutes)
app.use('/api/leaderboard',   leaderboardRoutes)
app.use('/api/analytics',     analyticsRoutes)
app.use('/api/notifications',  notificationRoutes)
app.use('/api/achievements',   achievementRoutes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler (must be last)
app.use(errorHandler)

// Connect to MongoDB and start server
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('MongoDB Atlas connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  startMissedTasksCron()
  startReminderCron()
})

export default app
