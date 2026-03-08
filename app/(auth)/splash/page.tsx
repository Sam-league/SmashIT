'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
      return
    }
    const t = setTimeout(() => router.replace('/onboarding'), 2200)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center overflow-hidden">

      {/* Top-right decorative blob */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,74,0.13) 0%, transparent 70%)',
          top: -60, right: -80,
        }}
      />
      {/* Bottom-left decorative blob */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,26,46,0.06) 0%, transparent 70%)',
          bottom: 60, left: -60,
        }}
      />

      {/* Logo */}
      <div
        className="animate-pop-in w-[72px] h-[72px] bg-dark rounded-[20px] flex items-center justify-center mb-6 relative z-10"
        style={{ boxShadow: '0 8px 24px rgba(26,26,46,0.2)' }}
      >
        <span style={{ fontSize: 32 }}>⚡</span>
      </div>

      {/* Title */}
      <h1
        className="animate-fade-up font-syne text-[42px] font-extrabold text-dark text-center tracking-[-0.03em] leading-none relative z-10"
        style={{ animationDelay: '0.15s' }}
      >
        Smash<span className="text-accent">IT</span>
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-up text-[13px] text-muted text-center mt-2.5 leading-relaxed font-normal relative z-10 px-8"
        style={{ animationDelay: '0.25s' }}
      >
        Build habits. Earn points.<br />Beat your friends.
      </p>

      {/* Progress dots */}
      <div
        className="animate-fade-up flex items-center gap-1.5 mt-9 relative z-10"
        style={{ animationDelay: '0.35s' }}
      >
        <span className="h-1.5 w-5 rounded-full bg-accent" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
      </div>
    </div>
  )
}
