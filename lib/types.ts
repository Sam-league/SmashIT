export type TaskType   = 'daily' | 'scheduled'
export type TaskStatus = 'pending' | 'completed' | 'missed'
export type FriendshipStatus = 'pending' | 'accepted'

export interface User {
  _id:           string
  name:          string
  email:         string
  points:        number
  currentStreak: number
  bestStreak:    number
  fcmToken?:     string
  createdAt:     string
}

export interface Task {
  _id:          string
  userId:       string
  title:        string
  type:         TaskType
  dueDate?:     string
  reminderTime: string
  points:       number
  penalty:      number
  createdAt:    string
}

export interface TaskLog {
  _id:     string
  taskId:  string
  userId:  string
  date:    string
  status:  TaskStatus
  points:  number
}

export interface Friendship {
  _id:      string
  userId:   string
  friendId: string
  status:   FriendshipStatus
}

export interface UserAchievement {
  _id:             string
  userId:          string
  achievementName: string
  dateUnlocked:    string
}

export interface Achievement {
  id:           string
  name:         string
  description:  string
  icon:         string
  points:       number
  unlocked:     boolean
  dateUnlocked?: string
}

export interface LeaderboardEntry {
  userId:        string
  name:          string
  points:        number
  currentStreak: number
  rank:          number
}

export interface Notification {
  _id:       string
  userId:    string
  title:     string
  body:      string
  read:      boolean
  createdAt: string
}

export interface AnalyticsDailyEntry {
  date:   string
  points: number
}

export interface AnalyticsSummary {
  totalPoints:      number
  completionRate:   number
  currentStreak:    number
  bestStreak:       number
  totalCompleted:   number
  totalMissed:      number
}

export interface FriendUser {
  _id:           string
  name:          string
  email:         string
  points:        number
  currentStreak: number
  bestStreak?:   number
}

export interface PopulatedFriendship {
  _id:      string
  userId:   FriendUser
  friendId: FriendUser
  status:   FriendshipStatus
}

export interface TaskWithStatus {
  task:   Task
  status: TaskStatus
  points: number
}

export interface ApiResponse<T> {
  data:    T
  message?: string
}
