/**
 * Returns the UTC start and end of the user's current local day.
 * utcOffsetMinutes: minutes ahead of UTC (e.g. IST = +330, EST = -300)
 */
export function getUserMidnight(utcOffsetMinutes: number): { start: Date; end: Date } {
  const now = new Date()
  // Shift now into user's local timezone (as if it were UTC)
  const userLocal = new Date(now.getTime() + utcOffsetMinutes * 60_000)
  // Zero out to local midnight
  userLocal.setUTCHours(0, 0, 0, 0)
  // Shift back to real UTC
  const start = new Date(userLocal.getTime() - utcOffsetMinutes * 60_000)
  const end = new Date(start.getTime() + 86_400_000)
  return { start, end }
}

/**
 * Returns the UTC start and end of the user's previous local day.
 */
export function getUserYesterday(utcOffsetMinutes: number): { start: Date; end: Date } {
  const { start } = getUserMidnight(utcOffsetMinutes)
  return {
    start: new Date(start.getTime() - 86_400_000),
    end:   start,
  }
}
