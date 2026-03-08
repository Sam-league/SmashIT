'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap } from 'lucide-react'

/* ─────────────────────────────────────────────
   SLIDE 0 — Tasks illustration
───────────────────────────────────────────── */
function TasksIllustration() {
  return (
    <div className="flex-1 flex items-center justify-center relative">
      {/* Center icon */}
      <div
        className="w-[100px] h-[100px] bg-dark rounded-[28px] flex items-center justify-center z-10"
        style={{ boxShadow: '0 12px 32px rgba(26,26,46,0.22)' }}
      >
        <span style={{ fontSize: 44 }}>✅</span>
      </div>

      {/* Card A — top left */}
      <div
        className="animate-float-a absolute bg-surface rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 border border-border"
        style={{
          width: 195, top: 20, left: -8,
          boxShadow: '0 4px 16px rgba(26,26,46,0.08)',
        }}
      >
        <div className="w-[18px] h-[18px] rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-bold leading-none">✓</span>
        </div>
        <span className="text-[11px] text-dark font-medium">Morning run</span>
        <span className="text-[10px] text-accent font-bold ml-auto">+10</span>
      </div>

      {/* Card B — middle right */}
      <div
        className="animate-float-b absolute bg-surface rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 border border-border"
        style={{
          width: 185, top: 90, right: -8,
          boxShadow: '0 4px 16px rgba(26,26,46,0.08)',
          animationDelay: '0.5s',
        }}
      >
        <div className="w-[18px] h-[18px] rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-bold leading-none">✓</span>
        </div>
        <span className="text-[11px] text-dark font-medium">Read 20 pages</span>
        <span className="text-[10px] text-accent font-bold ml-auto">+10</span>
      </div>

      {/* Card C — bottom left (pending) */}
      <div
        className="animate-float-a absolute bg-surface rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 border border-border"
        style={{
          width: 205, bottom: 20, left: 0,
          boxShadow: '0 4px 16px rgba(26,26,46,0.08)',
          animationDelay: '1s',
        }}
      >
        <div className="w-[18px] h-[18px] rounded-full bg-border flex-shrink-0" />
        <span className="text-[11px] text-muted font-medium">Deep work block</span>
        <span className="text-[10px] text-border font-bold ml-auto">+10</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SLIDE 1 — Streaks illustration
───────────────────────────────────────────── */
function StreaksIllustration() {
  return (
    <div className="flex-1 flex items-center justify-center relative">
      <div
        className="bg-surface rounded-[16px] p-5 flex flex-col items-center gap-3 z-10 border border-border"
        style={{ width: 180, boxShadow: '0 8px 32px rgba(26,26,46,0.1)' }}
      >
        <span style={{ fontSize: 40 }}>🔥</span>
        <div className="text-center">
          <div className="font-syne text-[36px] font-extrabold text-dark leading-none">7</div>
          <div className="text-[11px] text-muted font-medium mt-1">day streak</div>
        </div>
        <div className="flex gap-1.5">
          {[1, 1, 1, 1, 1, 1, 0].map((done, i) => (
            <div
              key={i}
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold ${
                done ? 'bg-accent text-white' : 'bg-border text-muted'
              }`}
            >
              {done ? '✓' : ''}
            </div>
          ))}
        </div>
      </div>

      <div
        className="animate-float-b absolute bg-dark text-white rounded-[12px] px-3 py-2 flex items-center gap-1.5 z-20"
        style={{
          top: 10, right: 0,
          boxShadow: '0 4px 16px rgba(26,26,46,0.2)',
          fontSize: 10, fontWeight: 600,
        }}
      >
        🏅 Best streak: 14
      </div>

      <div
        className="animate-float-a absolute bg-accent text-white rounded-[12px] px-3 py-2 flex items-center gap-1.5 z-20"
        style={{
          bottom: 20, left: 0,
          boxShadow: '0 4px 16px rgba(255,107,74,0.35)',
          fontSize: 10, fontWeight: 600,
          animationDelay: '0.5s',
        }}
      >
        ⚠️ Miss = −5 pts
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SLIDE 2 — Compete / Get Started
───────────────────────────────────────────── */
function CompeteSlide({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 bg-bg flex flex-col px-6 pt-safe-top overflow-hidden">
      {/* Decorative bg text */}
      <div
        aria-hidden
        className="absolute font-syne font-extrabold pointer-events-none select-none text-dark/[0.04]"
        style={{ fontSize: 120, top: 20, left: -8, lineHeight: 1, letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}
      >
        WIN
      </div>

      {/* Top row */}
      <div className="flex justify-between items-center pt-4 mb-2 relative z-10">
        <div className="w-9 h-9 bg-dark rounded-[10px] flex items-center justify-center">
          <Zap size={18} fill="#ff6b4a" color="#ff6b4a" />
        </div>
        <span className="font-syne text-[11px] text-muted tracking-wider">3 of 3</span>
      </div>

      {/* Leaderboard illustration */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div
          className="bg-surface rounded-[16px] p-4 border border-border"
          style={{ width: 220, boxShadow: '0 8px 32px rgba(26,26,46,0.1)' }}
        >
          <div className="font-syne text-[11px] font-bold text-dark tracking-wider uppercase mb-3">
            🏆 Leaderboard
          </div>
          {/* Row 1 */}
          <div className="flex items-center gap-2 py-1.5 border-b border-border">
            <span className="font-syne text-[13px] font-bold text-accent w-4 flex-shrink-0">1</span>
            <span className="text-sm">😎</span>
            <span className="text-[11px] font-semibold text-dark flex-1">Abhishek</span>
            <span className="text-[10px] font-bold text-accent">420 pts</span>
          </div>
          {/* Row 2 — You (highlighted) */}
          <div className="flex items-center gap-2 py-1.5 border-b border-border rounded-[6px] px-1 -mx-1 bg-accent-lt">
            <span className="font-syne text-[13px] font-bold text-accent w-4 flex-shrink-0">2</span>
            <span className="text-sm">🙋</span>
            <span className="text-[11px] font-semibold text-accent flex-1">You</span>
            <span className="text-[10px] font-bold text-accent">390 pts</span>
          </div>
          {/* Row 3 */}
          <div className="flex items-center gap-2 py-1.5">
            <span className="font-syne text-[13px] font-bold text-muted w-4 flex-shrink-0">3</span>
            <span className="text-sm">😄</span>
            <span className="text-[11px] font-semibold text-dark flex-1">Rahul</span>
            <span className="text-[10px] font-bold text-accent">350 pts</span>
          </div>
        </div>

        {/* Achievement badge */}
        <div
          className="animate-float-b absolute bg-dark text-white rounded-[12px] px-3 py-2 flex items-center gap-1.5 z-20"
          style={{
            top: '8%', right: 0,
            boxShadow: '0 4px 16px rgba(26,26,46,0.2)',
            fontSize: 10, fontWeight: 600,
          }}
        >
          🏅 Achievement unlocked!
        </div>

        {/* Streak badge */}
        <div
          className="animate-float-a absolute bg-accent text-white rounded-[12px] px-3 py-2 flex items-center gap-1.5 z-20"
          style={{
            bottom: '12%', left: 0,
            boxShadow: '0 4px 16px rgba(255,107,74,0.35)',
            fontSize: 10, fontWeight: 600,
            animationDelay: '0.5s',
          }}
        >
          🔥 7 day streak
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pb-10">
        <h2 className="font-syne text-[28px] font-extrabold text-dark tracking-tight leading-[1.15] mb-2">
          Compete with<br /><span className="text-accent">your friends.</span>
        </h2>
        <p className="text-[13px] text-muted leading-relaxed mb-6">
          Climb the leaderboard, unlock achievements, and stay on top of your game.
        </p>
        <button
          onClick={onRegister}
          className="w-full py-4 bg-accent text-white rounded-full font-syne text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 mb-3"
          style={{ boxShadow: '0 4px 20px rgba(255,107,74,0.3)' }}
        >
          Get Started <ArrowRight size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={onLogin}
          className="w-full py-[14px] bg-transparent text-dark border-[1.5px] border-border rounded-full font-syne text-[14px] font-bold tracking-wide"
        >
          I already have an account
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SLIDES CONFIG
───────────────────────────────────────────── */
const SLIDES = [
  {
    tag: 'Tasks',
    title: 'Build habits,',
    titleAccent: 'earn points.',
    desc: 'Create daily and scheduled tasks. Complete them to earn points — miss them and lose some.',
    Illustration: TasksIllustration,
  },
  {
    tag: 'Streaks',
    title: 'Never miss',
    titleAccent: 'a day.',
    desc: 'Complete at least one task per day to keep your streak alive. Lose it if you miss a day.',
    Illustration: StreaksIllustration,
  },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)

  if (slide === 2) {
    return (
      <CompeteSlide
        onRegister={() => router.push('/register')}
        onLogin={() => router.push('/login')}
      />
    )
  }

  const { tag, title, titleAccent, desc, Illustration } = SLIDES[slide]

  return (
    <div className="fixed inset-0 bg-bg flex flex-col px-6 pt-4 pb-8">
      {/* Skip */}
      <button
        onClick={() => router.push('/login')}
        className="self-end text-[12px] text-muted font-medium py-1"
      >
        Skip
      </button>

      {/* Illustration */}
      <Illustration />

      {/* Content */}
      <div className="flex-shrink-0 mt-4">
        <span className="inline-block bg-accent-lt text-accent text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full mb-2.5">
          {tag}
        </span>

        <h2 className="font-syne text-[26px] font-extrabold text-dark tracking-[-0.02em] leading-[1.15] mb-2">
          {title}<br />
          <span className="text-accent">{titleAccent}</span>
        </h2>

        <p className="text-[13px] text-muted leading-relaxed mb-5">{desc}</p>

        {/* Nav row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-[18px] bg-accent' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setSlide(slide + 1)}
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"
            style={{ boxShadow: '0 4px 16px rgba(255,107,74,0.35)' }}
          >
            <ArrowRight size={20} color="white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
