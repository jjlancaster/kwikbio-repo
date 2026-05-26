'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description:
      'The authentication service is not configured correctly. Please contact your system administrator.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description:
      'You do not have permission to sign in to this portal. Access is restricted to authorized licensees and staff.',
  },
  Verification: {
    title: 'Link Expired or Invalid',
    description:
      'The sign-in link is no longer valid. Magic links expire after 24 hours and can only be used once.',
  },
  OAuthSignin: {
    title: 'OAuth Sign-In Error',
    description: 'There was a problem initiating Google sign-in. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description:
      'There was a problem processing the Google authentication response. Please try again.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Unable to create your account. Please contact your administrator.',
  },
  EmailCreateAccount: {
    title: 'Account Creation Error',
    description: 'Unable to create your account with this email address.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'An error occurred during authentication. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description:
      'This email is already registered with a different sign-in method. Please use your original sign-in method.',
  },
  EmailSignin: {
    title: 'Email Send Failed',
    description:
      'Failed to send the magic link. Please check your email address and try again.',
  },
  SessionRequired: {
    title: 'Authentication Required',
    description: 'You must be signed in to access this resource.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected authentication error occurred. Please try again.',
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error') || 'Default'
  const errorInfo = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-red-900/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-electric-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm font-mono">HJ</span>
          </div>
          <span className="text-slate-400 text-sm font-mono">HYDROJOULE PORTAL</span>
        </Link>

        <div className="panel p-8">
          {/* Error icon */}
          <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2">
            Error: {errorCode}
          </div>
          <h1 className="text-xl font-semibold text-white mb-3">{errorInfo.title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">{errorInfo.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signin"
              className="flex-1 py-2.5 px-4 bg-electric-500 text-white font-medium rounded text-sm hover:bg-electric-400 transition-colors text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 border border-slate-700 text-slate-300 font-medium rounded text-sm hover:border-slate-600 hover:text-white transition-all text-center"
            >
              Return Home
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-mono mt-6">
          If this problem persists, contact your system administrator.
        </p>
      </div>
    </div>
  )
}
