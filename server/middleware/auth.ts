import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?:    string
  utcOffset?: number  // minutes ahead of UTC, parsed from x-utc-offset header
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    req.userId = payload.userId
    const headerOffset = parseInt(req.headers['x-utc-offset'] as string)
    req.utcOffset = isNaN(headerOffset) ? 0 : headerOffset
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
