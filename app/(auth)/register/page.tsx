'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function getStrength(pwd: string): { label: string; pct: string; color: string } {
  if (!pwd)           return { label: '',          pct: '0%',   color: '' }
  if (pwd.length < 6) return { label: 'Too short', pct: '20%', color: '#e53935' }
  if (pwd.length < 8) return { label: 'Weak',      pct: '38%', color: '#f4a22d' }
  const score = [/[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((r) => r.test(pwd)).length
  if (score === 3)    return { label: 'Strong',    pct: '100%', color: '#2da44e' }
  if (score >= 1)     return { label: 'Good',      pct: '65%',  color: '#ff6b4a' }
  return                { label: 'Fair',       pct: '45%',  color: '#f4a22d' }
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isRegisterPending, registerError } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)

  const strength = getStrength(password)
  const pwdMatch  = confirm.length > 0 && confirm === password
  const canSubmit = !isRegisterPending && !(confirm.length > 0 && !pwdMatch)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return
    register({ name: `${firstName} ${lastName}`.trim(), email, password })
  }

  const errorMsg = registerError
    ? ((registerError as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed. Please try again.')
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

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-icon bg-surface border border-border flex items-center justify-center mb-6"
          style={{ boxShadow: '0 1px 4px rgba(26,26,46,0.06)' }}
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-dark" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1 bg-[#f0faf0] text-[#2e7d32] border border-[#c8e6c9] text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
            🎉 Free forever
          </span>
          <h1 className="font-syne text-[28px] font-extrabold text-dark tracking-[-0.02em] leading-[1.1]">
            Create your<br /><span className="text-accent">account.</span>
          </h1>
          <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
            Join thousands building better habits.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-error text-[12px] font-medium rounded-[10px] px-3 py-2.5 mb-5">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── Name row ── */}
          <div className="flex gap-2.5">
            {/* First name */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="font-syne text-[11px] font-semibold tracking-[0.06em] uppercase text-dark">
                First
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aryan"
                  required
                  className="w-full pl-[34px] pr-2 py-[13px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            {/* Last name */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="font-syne text-[11px] font-semibold tracking-[0.06em] uppercase text-dark">
                Last
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Shah"
                required
                className="w-full px-3 py-[13px] bg-surface border-[1.5px] border-border rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* ── Email ── */}
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

          {/* ── Password ── */}
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
                autoComplete="new-password"
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
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="h-[3px] bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.pct, background: strength.color }}
                  />
                </div>
                <span className="text-[11px] text-muted">
                  Password strength: <span style={{ color: strength.color }}>{strength.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* ── Confirm Password ── */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[11px] font-semibold tracking-[0.06em] uppercase text-dark">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type={showConf ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-[13px] bg-surface border-[1.5px] rounded-input font-dm-sans text-[13px] text-dark placeholder:text-muted outline-none transition-colors ${
                  confirm.length > 0
                    ? pwdMatch
                      ? 'border-success'
                      : 'border-error'
                    : 'border-border focus:border-accent'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {confirm.length > 0 && pwdMatch ? (
                  <Check size={15} className="text-success" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="text-muted"
                  >
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </span>
            </div>
            {confirm.length > 0 && !pwdMatch && (
              <span className="text-[11px] text-error">Passwords do not match</span>
            )}
          </div>

          {/* Terms */}
          <p className="text-[11px] text-muted text-center leading-relaxed">
            By signing up you agree to our{' '}
            <button type="button" className="text-accent font-semibold text-[11px]">Terms</button>
            {' & '}
            <button type="button" className="text-accent font-semibold text-[11px]">Privacy Policy</button>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-[15px] bg-accent text-white rounded-full font-syne text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ boxShadow: '0 4px 20px rgba(255,107,74,0.3)' }}
          >
            {isRegisterPending
              ? 'Creating account…'
              : <><span>Create Account</span><ArrowRight size={16} strokeWidth={2.5} /></>
            }
          </button>

          {/* Footer */}
          <p className="text-center text-[12px] text-muted pt-1">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
