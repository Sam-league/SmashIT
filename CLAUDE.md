# CLAUDE.md — SmashIT PWA
> This file is the single source of truth for the SmashIT project.
> Read this entire file before writing any code.

---

## 1. Project Overview

**SmashIT** is a productivity tracking Progressive Web App (PWA).

Users manage daily and scheduled tasks, earn/lose points for completing or missing them, track streaks and analytics, unlock achievements, and compete with friends on a leaderboard.

**Goal:** Build a mobile-first PWA that feels like a native app — installable, offline-capable, with push notifications.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| PWA | next-pwa |
| State / Data fetching | React Query (TanStack Query) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (cloud) + Mongoose |
| Auth | JWT + Refresh Tokens (httpOnly cookies) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Background Jobs | node-cron |
| Icons | lucide-react |

---

## 3. Frost Design System

All UI must follow the Frost theme exactly. Use these tokens everywhere.

### CSS Variables (globals.css)
```css
:root {
  --bg:          #f7f5f0;
  --surface:     #ffffff;
  --dark:        #1a1a2e;
  --accent:      #ff6b4a;
  --accent-lt:   #fff0ed;
  --accent-dk:   #e8523a;
  --muted:       #aaa8a0;
  --border:      #e8e4dc;
  --success:     #2da44e;
  --success-lt:  #edfbf1;
  --error:       #e53935;
  --warn:        #f4a22d;
  --warn-lt:     #fff8ec;
  --blue:        #3b82f6;
  --blue-lt:     #eff6ff;
}
```

### Tailwind Custom Colors (tailwind.config.ts)
```ts
colors: {
  bg:         '#f7f5f0',
  surface:    '#ffffff',
  dark:       '#1a1a2e',
  accent:     '#ff6b4a',
  'accent-lt':'#fff0ed',
  muted:      '#aaa8a0',
  border:     '#e8e4dc',
  success:    '#2da44e',
  error:      '#e53935',
  warn:       '#f4a22d',
}
```

### Typography
```css
/* Headings */
font-family: 'Syne', sans-serif;
font-weight: 700 | 800;

/* Body */
font-family: 'DM Sans', sans-serif;
font-weight: 400 | 500 | 600;
```

Add to `<head>` in layout.tsx:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

### Border Radius
```
Cards:    rounded-[14px]
Pills:    rounded-full
Inputs:   rounded-[12px]
Phone:    rounded-[44px]
Buttons:  rounded-full (primary) | rounded-[10px] (icon)
```

### Shadows
```
Cards:   shadow-sm  (0 1px 4px rgba(26,26,46,0.05))
Phone:   0 24px 64px rgba(26,26,46,0.14)
Buttons: 0 4px 20px rgba(255,107,74,0.3)  ← accent buttons
```

---

## 4. Project File Structure

```
smashit/
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← unauthenticated routes
│   │   ├── splash/
│   │   │   └── page.tsx          ← Screen 01
│   │   ├── onboarding/
│   │   │   └── page.tsx          ← Screens 02-03
│   │   ├── login/
│   │   │   └── page.tsx          ← Screen 04
│   │   └── register/
│   │       └── page.tsx          ← Screen 05
│   ├── (app)/                    ← authenticated routes
│   │   ├── layout.tsx            ← wraps all app pages, includes BottomNav
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← Screen 06
│   │   ├── tasks/
│   │   │   ├── page.tsx          ← Screen 07
│   │   │   ├── create/
│   │   │   │   └── page.tsx      ← Screen 08
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Screen 09
│   │   ├── analytics/
│   │   │   └── page.tsx          ← Screen 10
│   │   ├── leaderboard/
│   │   │   └── page.tsx          ← Screen 11
│   │   ├── friends/
│   │   │   ├── page.tsx          ← Screen 12
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Screen 13
│   │   ├── profile/
│   │   │   └── page.tsx          ← Screen 14
│   │   ├── achievements/
│   │   │   └── page.tsx          ← Screen 15
│   │   ├── settings/
│   │   │   └── page.tsx          ← Screen 16
│   │   └── notifications/
│   │       └── page.tsx          ← Screen 17
│   ├── layout.tsx                ← root layout (fonts, PWA meta)
│   ├── globals.css               ← CSS variables + base styles
│   └── page.tsx                  ← redirects to /splash or /dashboard
│
├── components/
│   ├── ui/
│   │   ├── BottomNav.tsx         ← shared bottom navigation bar
│   │   ├── TaskCard.tsx          ← reusable task list item
│   │   ├── StatCard.tsx          ← points/streak/rate stat tile
│   │   ├── AchievementCard.tsx   ← achievement grid card
│   │   ├── FriendItem.tsx        ← friend list row
│   │   ├── LeaderboardItem.tsx   ← leaderboard row
│   │   ├── NotifItem.tsx         ← notification list item
│   │   ├── Toggle.tsx            ← settings toggle switch
│   │   ├── BarChart.tsx          ← horizontal/vertical bar chart
│   │   ├── DonutChart.tsx        ← SVG donut chart
│   │   └── StreakCalendar.tsx    ← month grid calendar
│   └── layout/
│       ├── PhoneShell.tsx        ← dev-only phone mockup wrapper
│       └── PageHeader.tsx        ← shared page title + back button
│
├── lib/
│   ├── tokens.ts                 ← design tokens as JS constants
│   ├── types.ts                  ← all TypeScript interfaces
│   ├── api.ts                    ← axios instance + API calls
│   ├── auth.ts                   ← JWT helpers
│   └── fcm.ts                    ← Firebase push notification setup
│
├── hooks/
│   ├── useAuth.ts                ← auth state hook
│   ├── useTasks.ts               ← task CRUD hooks
│   ├── usePoints.ts              ← points + streak hook
│   └── useNotifications.ts      ← FCM + notification hooks
│
├── store/
│   └── authStore.ts              ← Zustand auth store
│
├── public/
│   ├── manifest.json             ← PWA manifest
│   ├── sw.js                     ← service worker (auto-generated by next-pwa)
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── firebase-messaging-sw.js ← FCM service worker
│
├── server/                       ← Express backend
│   ├── index.ts                  ← server entry point
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── users.ts
│   │   ├── friends.ts
│   │   └── leaderboard.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── TaskLog.ts
│   │   ├── Friendship.ts
│   │   └── UserAchievement.ts
│   ├── middleware/
│   │   ├── auth.ts               ← JWT verification middleware
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── taskService.ts
│   │   ├── pointsService.ts
│   │   ├── achievementService.ts
│   │   ├── analyticsService.ts
│   │   └── notificationService.ts
│   └── jobs/
│       └── missedTasksCron.ts    ← nightly missed task detection
│
├── next.config.js                ← next-pwa config
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                    ← environment variables
└── CLAUDE.md                     ← this file
```

---

## 5. UI Reference Files

Each screen has an HTML reference file. When converting to Next.js/TSX, match the layout, colors, spacing, and components exactly.

| Screen | Reference File | Target Page |
|---|---|---|
| 01 Splash | `references/01-splash-onboarding.html` | `app/(auth)/splash/page.tsx` |
| 02-03 Onboarding | `references/01-splash-onboarding.html` | `app/(auth)/onboarding/page.tsx` |
| 04 Login | `references/02-login-register.html` | `app/(auth)/login/page.tsx` |
| 05 Register | `references/02-login-register.html` | `app/(auth)/register/page.tsx` |
| 06 Dashboard | `references/03-dashboard.html` | `app/(app)/dashboard/page.tsx` |
| 07 Task List | `references/04-tasks.html` | `app/(app)/tasks/page.tsx` |
| 08 Create Task | `references/04-tasks.html` | `app/(app)/tasks/create/page.tsx` |
| 09 Task Detail | `references/04-tasks.html` | `app/(app)/tasks/[id]/page.tsx` |
| 10 Analytics | `references/05-analytics.html` | `app/(app)/analytics/page.tsx` |
| 11 Leaderboard | `references/06-social.html` | `app/(app)/leaderboard/page.tsx` |
| 12 Friends | `references/06-social.html` | `app/(app)/friends/page.tsx` |
| 13 Friend Profile | `references/06-social.html` | `app/(app)/friends/[id]/page.tsx` |
| 14 My Profile | `references/07-profile-settings-notifications.html` | `app/(app)/profile/page.tsx` |
| 15 Achievements | `references/07-profile-settings-notifications.html` | `app/(app)/achievements/page.tsx` |
| 16 Settings | `references/07-profile-settings-notifications.html` | `app/(app)/settings/page.tsx` |
| 17 Notifications | `references/07-profile-settings-notifications.html` | `app/(app)/notifications/page.tsx` |

---

## 6. TypeScript Types (lib/types.ts)

```ts
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
  id:          string
  name:        string
  description: string
  icon:        string
  points:      number
  unlocked:    boolean
  dateUnlocked?: string
}

export interface LeaderboardEntry {
  userId:        string
  name:          string
  points:        number
  currentStreak: number
  rank:          number
}
```

---

## 7. API Routes (server/routes/)

### Auth
```
POST /api/auth/register     → { name, email, password }
POST /api/auth/login        → { email, password }
POST /api/auth/logout
POST /api/auth/refresh      → refresh JWT
```

### Tasks
```
GET    /api/tasks            → get all tasks for user
POST   /api/tasks            → create task
GET    /api/tasks/:id        → get single task + logs
PATCH  /api/tasks/:id        → update task
DELETE /api/tasks/:id        → delete task
POST   /api/tasks/:id/complete → mark complete, award points
```

### Users
```
GET   /api/users/me          → get current user profile
PATCH /api/users/me          → update profile
POST  /api/users/fcm-token   → save FCM device token
```

### Analytics
```
GET /api/analytics/daily     → daily points for past 7/30 days
GET /api/analytics/summary   → completion rate, streak, totals
```

### Friends
```
GET    /api/friends           → friends list
POST   /api/friends/request   → { targetUserId }
PATCH  /api/friends/:id/accept
DELETE /api/friends/:id
GET    /api/friends/search?q= → search users
```

### Leaderboard
```
GET /api/leaderboard          → friends ranked by points
```

### Notifications
```
GET  /api/notifications       → all notifications for user
POST /api/notifications/read  → mark all as read
```

---

## 8. MongoDB Models

### User
```ts
{
  name:          String (required)
  email:         String (required, unique)
  password:      String (hashed with bcrypt)
  points:        Number (default: 0)
  currentStreak: Number (default: 0)
  bestStreak:    Number (default: 0)
  fcmToken:      String
  createdAt:     Date
}
```

### Task
```ts
{
  userId:       ObjectId (ref: User)
  title:        String (required)
  type:         'daily' | 'scheduled'
  dueDate:      Date (required if scheduled)
  reminderTime: String (e.g. "06:00")
  createdAt:    Date
}
```

### TaskLog
```ts
{
  taskId:  ObjectId (ref: Task)
  userId:  ObjectId (ref: User)
  date:    Date
  status:  'completed' | 'missed'
  points:  Number (+10 or -5)
}
```

### Friendship
```ts
{
  userId:   ObjectId (ref: User)
  friendId: ObjectId (ref: User)
  status:   'pending' | 'accepted'
  createdAt: Date
}
```

### UserAchievement
```ts
{
  userId:          ObjectId (ref: User)
  achievementName: String
  dateUnlocked:    Date
}
```

---

## 9. Points & Streak Logic

```
Complete task  → +10 points
Miss task      → -5 points

Streak rules:
- Increment streak if at least 1 task completed today
- Reset streak to 0 if no tasks completed by midnight
- bestStreak updated whenever currentStreak exceeds it
```

---

## 10. Achievements List

| ID | Name | Condition |
|---|---|---|
| first_task | First Task | Complete 1 task |
| streak_7 | 7 Day Streak | currentStreak >= 7 |
| streak_30 | 30 Day Streak | currentStreak >= 30 |
| points_100 | 100 Points | points >= 100 |
| points_500 | 500 Points | points >= 500 |
| tasks_10 | 10 Tasks Done | total completed >= 10 |
| tasks_50 | 50 Tasks Done | total completed >= 50 |
| tasks_100 | 100 Tasks Done | total completed >= 100 |

Check achievements after every task completion inside `achievementService.ts`.

---

## 11. Cron Job (server/jobs/missedTasksCron.ts)

Runs at **00:01 every night**.

```
For each active daily task:
  If no TaskLog entry exists for today with status 'completed':
    Create TaskLog { status: 'missed', points: -5 }
    Deduct 5 points from user
    Reset streak if no completed tasks today
    Send FCM push notification: "You missed [task name]"

For each scheduled task where dueDate < now and status != 'completed':
    Mark as missed
    Same deduction + notification
```

---

## 12. PWA Setup (next.config.js)

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // your next config
})
```

### manifest.json
```json
{
  "name": "SmashIT",
  "short_name": "SmashIT",
  "description": "Build habits. Earn points. Beat your friends.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#f7f5f0",
  "theme_color": "#1a1a2e",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 13. Environment Variables (.env.local)

```
# App
NEXT_PUBLIC_API_URL=http://localhost:4000

# MongoDB Atlas
# Get connection string from: Atlas Dashboard → Cluster → Connect → Drivers → Node.js
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smashit?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SDK_KEY=
```

---

## 14. BottomNav Component

The BottomNav is shared across all `(app)` pages via `app/(app)/layout.tsx`.

```
5 tabs:
  Home      → /dashboard       icon: Home
  Tasks     → /tasks           icon: CheckSquare
  Stats     → /analytics       icon: BarChart2
  Social    → /leaderboard     icon: Users
  Me        → /profile         icon: User
```

Active tab: dark color + coral dot indicator below icon.

---

## 15. Coding Conventions

- All components use **TypeScript** with proper types — no `any`
- Use **React Query** for all API calls — no useEffect for data fetching
- Tailwind classes only — no inline styles in final code
- All pages must be **mobile-first** — max-width 430px centered on desktop
- Use **lucide-react** for all icons
- File naming: `PascalCase` for components, `camelCase` for hooks/utils
- Keep pages thin — extract logic into hooks, UI into components
- Server components where possible, client components only when needed (interactivity, hooks)

---

## 16. How to Scaffold the Project

Run these commands in order when starting:

```bash
# 1. Create Next.js app
npx create-next-app@latest smashit --typescript --tailwind --app --src-dir=false

# 2. Install frontend deps
cd smashit
npm install @tanstack/react-query axios zustand next-pwa lucide-react

# 3. Install Firebase
npm install firebase firebase-admin

# 4. Install backend deps
mkdir server && cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv node-cron
npm install -D typescript @types/express @types/node ts-node nodemon

# 5. Copy reference HTML files into /references folder
# 6. Copy this CLAUDE.md to project root
# 7. Start converting screens one by one
```

---

## 17. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Free Cluster** (M0 tier — always free)
3. Under **Database Access** → Add a database user with username + password
4. Under **Network Access** → Add IP Address:
   - For development: add your current IP
   - For production: add `0.0.0.0/0` (allow all) or your server IP
5. Under **Clusters** → Connect → Drivers → Node.js → copy the connection string
6. Paste into `.env.local` replacing `<username>`, `<password>`, `<cluster>`

### Mongoose connection (server/index.ts)
```ts
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✅ MongoDB Atlas connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
}

export default connectDB
```

### Recommended Atlas Indexes
```ts
// Add these in your Mongoose schemas for performance:
TaskSchema.index({ userId: 1, type: 1 })
TaskLogSchema.index({ userId: 1, date: -1 })
TaskLogSchema.index({ taskId: 1, date: -1 })
FriendshipSchema.index({ userId: 1, status: 1 })
UserAchievementSchema.index({ userId: 1 })
```

---

## 18. Screen Conversion Instructions for Claude Code

When converting a reference HTML file to a Next.js page:

1. Read the target HTML reference file first
2. Identify all UI sections and map them to components
3. Extract reusable parts into `components/ui/`
4. Use Tailwind classes matching the Frost design tokens
5. Add proper TypeScript types for all props
6. Wire up React Query hooks for real data
7. Ensure the page is scrollable on mobile (overflow-y-auto)
8. Keep bottom nav always visible (sticky bottom)
9. Test that fonts (Syne + DM Sans) load correctly

Example command to Claude Code:
```
Convert references/03-dashboard.html to app/(app)/dashboard/page.tsx
following CLAUDE.md conventions. Use Frost design tokens.
Extract TaskCard and StatCard into components/ui/.
Wire up useTasks and usePoints hooks.
```

---

## 18. Development Order (Recommended)

Build in this order to avoid blockers:

```
Phase 1 — Foundation
  □ Project scaffold + dependencies
  □ globals.css with Frost tokens
  □ tailwind.config.ts with custom colors
  □ lib/types.ts
  □ BottomNav component
  □ Root layout.tsx

Phase 2 — Auth
  □ Splash + Onboarding pages
  □ Login + Register pages
  □ JWT auth (server + client)
  □ useAuth hook + authStore

Phase 3 — Core
  □ Dashboard page
  □ Task List + Create + Detail pages
  □ Task CRUD API
  □ Points + streak logic
  □ Cron job for missed tasks

Phase 4 — Analytics & Social
  □ Analytics page
  □ Leaderboard + Friends + Friend Profile
  □ Analytics API

Phase 5 — Profile & Notifications
  □ Profile + Achievements + Settings
  □ Notifications page
  □ FCM push notifications
  □ Achievement checker

Phase 6 — PWA
  □ manifest.json + icons
  □ next-pwa setup
  □ Offline caching strategy
  □ Test install on mobile

Phase 7 — Deploy
  □ Push to GitHub
  □ Connect Vercel to repo (frontend)
  □ Connect Railway to repo (backend)
  □ Set env vars on both platforms
  □ Test production URLs end to end
```

---

## 19. Deployment Architecture

```
User's Phone (PWA)
      │
      ▼
  Vercel CDN
  (Next.js frontend)
  smashit.vercel.app
      │
      │  REST API calls
      ▼
  Railway
  (Express backend)
  api.smashit.up.railway.app
      │
      ▼
  MongoDB Atlas
  (Free M0 cluster)
  cluster.mongodb.net
```

No Docker needed. Each platform handles its own containerization internally.

---

## 20. Frontend Deployment — Vercel

### Setup (one time)
1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Vercel auto-detects Next.js — no config needed
5. Set environment variables (see below)
6. Deploy → get a live URL instantly

### vercel.json (add to project root)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Environment Variables on Vercel
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL              = https://your-app.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY     = (from Firebase console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (from Firebase console)
NEXT_PUBLIC_FIREBASE_PROJECT_ID  = (from Firebase console)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (from Firebase console)
NEXT_PUBLIC_FIREBASE_APP_ID      = (from Firebase console)
```

### Auto-deploy
Every `git push` to `main` triggers a new Vercel deploy automatically.

---

## 21. Backend Deployment — Railway

### Setup (one time)
1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo
3. Set the **Root Directory** to `/server`
4. Set the **Start Command** to `npm start`
5. Set environment variables (see below)
6. Railway gives you a public URL: `https://your-app.up.railway.app`

### package.json scripts (server/package.json)
```json
{
  "scripts": {
    "dev":   "nodemon --exec ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### tsconfig.json (server/tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### railway.toml (add to /server folder)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Environment Variables on Railway
Set these in Railway Dashboard → Project → Variables:

```
NODE_ENV          = production
PORT              = 4000
MONGODB_URI       = mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/smashit?retryWrites=true&w=majority
JWT_SECRET        = (long random string — use openssl rand -hex 64)
JWT_REFRESH_SECRET= (long random string — use openssl rand -hex 64)
FIREBASE_ADMIN_SDK_KEY = (JSON string from Firebase service account)
CLIENT_URL        = https://your-app.vercel.app
```

### CORS config (server/index.ts)
```ts
import cors from 'cors'

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
```

### Auto-deploy
Every `git push` to `main` triggers a new Railway deploy automatically.

---

## 22. README.md

Create this file at the project root for quick reference:

```markdown
# SmashIT — Productivity PWA

Build habits. Earn points. Beat your friends.

## Stack
- Frontend: Next.js 14 + TypeScript + Tailwind CSS (Vercel)
- Backend:  Node.js + Express.js (Railway)
- Database: MongoDB Atlas
- Push:     Firebase Cloud Messaging
- PWA:      next-pwa

## Live URLs
- App:  https://smashit.vercel.app
- API:  https://smashit-api.up.railway.app

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Firebase project

### Frontend
cd smashit
cp .env.example .env.local   # fill in your values
npm install
npm run dev                   # runs on http://localhost:3000

### Backend
cd server
cp .env.example .env          # fill in your values
npm install
npm run dev                   # runs on http://localhost:4000

## Deploy
- Frontend: push to main → Vercel auto-deploys
- Backend:  push to main → Railway auto-deploys

## Design
Frost theme — see CLAUDE.md Section 3 for full design tokens.
UI references in /references folder.
```

---

## 23. .env.example Files

### Root .env.example (commit this to git — no real values)
```
# App
NEXT_PUBLIC_API_URL=http://localhost:4000

# Firebase (get from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### server/.env.example (commit this to git — no real values)
```
NODE_ENV=development
PORT=4000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smashit?retryWrites=true&w=majority

# JWT (generate with: openssl rand -hex 64)
JWT_SECRET=
JWT_REFRESH_SECRET=

# Firebase Admin SDK
# Paste the entire JSON content as a single-line string
FIREBASE_ADMIN_SDK_KEY=

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### .gitignore (make sure these are excluded)
```
.env
.env.local
.env.production
node_modules/
dist/
.next/
```