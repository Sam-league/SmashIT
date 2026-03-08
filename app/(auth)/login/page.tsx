'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoginPending, loginError } = useAuth()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  const errorMsg = loginError
    ? ((loginError as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Invalid email or password')
    : null

  return (
    <div className="min-h-dvh bg-bg relative overflow-x-hidden">

      {/* Decorative blob */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,74,0.08) 0%, transparent 70%)',
          top: -80, right: -60,
        }}
      />

      <div className="relative z-10 px-6 pt-5 pb-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-icon bg-surface border border-border flex items-center justify-center mb-6 self-start flex-shrink-0"
          style={{ boxShadow: '0 1px 4px rgba(26,26,46,0.06)' }}
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-dark" />
        </button>

        {/* Header */}
        <div className="mb-7 relative z-10">
          <p className="font-syne text-[11px] font-semibold tracking-[0.15em] uppercase text-accent mb-1.5">
            Welcome back
          </p>
          <h1 className="font-syne text-[28px] font-extrabold text-dark tracking-[-0.02em] leading-[1.1]">
            Log back<br />into <span className="text-accent">SmashIT.</span>
          </h1>
          <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
            Pick up right where you left off.
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-error text-[12px] font-medium rounded-[10px] px-3 py-2.5 mb-4">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[11px] font-semibold tracking-[0.06em] uppercase text-dark">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-[13px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[11px] font-semibold tracking-[0.06em] uppercase text-dark">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-[13px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="flex justify-end -mt-1">
            <button type="button" className="text-[12px] text-accent font-semibold">
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted font-medium whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="flex gap-2.5">
            <button
              type="button"
              className="flex-1 py-[11px] bg-surface border-[1.5px] border-border rounded-input flex items-center justify-center gap-1.5 font-syne text-[12px] font-bold text-dark"
            >
              G&nbsp; Google
            </button>
            <button
              type="button"
              className="flex-1 py-[11px] bg-surface border-[1.5px] border-border rounded-input flex items-center justify-center gap-1.5 font-syne text-[12px] font-bold text-dark"
            >
               Apple
            </button>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full py-[15px] bg-accent text-white rounded-full font-syne text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
            style={{ boxShadow: '0 4px 20px rgba(255,107,74,0.3)' }}
          >
            {isLoginPending
              ? 'Signing in…'
              : <><span>Sign In</span><ArrowRight size={16} strokeWidth={2.5} /></>
            }
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[12px] text-muted pt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
