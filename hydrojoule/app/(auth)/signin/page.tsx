'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState<'google' | 'email' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setLoading('google')
    setError(null)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setError('Google sign-in failed. Please try again.')
      setLoading(null)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading('email')
    setError(null)
    try {
      const result = await signIn('nodemailer', {
        email: email.trim(),
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setError('Failed to send magic link. Please verify your email and try again.')
      } else {
        setEmailSent(true)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-electric-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-electric-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-mono">HJ</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">HYDROJOULE</span>
          </Link>
          <p className="text-slate-500 text-sm mt-2 font-mono">IP LICENSING PORTAL</p>
        </div>

        {/* Card */}
        <div className="panel p-8">
          {emailSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-xl mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                A secure sign-in link has been sent to{' '}
                <span className="text-electric-300 font-mono">{email}</span>.
                The link expires in 24 hours.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail('') }}
                className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-white mb-1">Portal Access</h1>
                <p className="text-slate-500 text-sm">
                  Authorized licensees and research staff only.
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded border border-red-700/40 bg-red-900/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Google SSO */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-700 rounded bg-slate-800/50 text-white text-sm font-medium hover:border-electric-500/40 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
              >
                {loading === 'google' ? (
                  <span className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-600 text-xs font-mono">OR</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Magic link form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-2 font-mono uppercase tracking-wide">
                    Institutional Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
                    required
                    disabled={loading !== null}
                    className="w-full px-4 py-3 rounded border border-slate-700 bg-navy-950/60 text-white placeholder-slate-600 text-sm focus:border-electric-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading !== null || !email.trim()}
                  className="w-full py-3 px-4 bg-electric-500 text-white font-medium rounded text-sm hover:bg-electric-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === 'email' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6 font-mono">
          HYDROJOULE LLC — CONFIDENTIAL SYSTEM
          <br />
          Unauthorized access is prohibited and monitored.
        </p>
      </div>
    </div>
  )
}
