import Link from 'next/link'
import { auth } from '@/lib/auth'
import { roleLabel } from '@/lib/rbac'
import type { Role } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function UnauthorizedPage() {
  const session = await auth()
  const userRole = session?.user?.role as Role | undefined

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-red-900/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-electric-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm font-mono">HJ</span>
          </div>
          <span className="text-slate-400 text-sm font-mono">HYDROJOULE PORTAL</span>
        </Link>

        <div className="panel p-10">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-3">
            403 — Access Denied
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Insufficient Privileges</h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You do not have the required role to access this resource.
            {userRole && (
              <>
                {' '}Your current access level is{' '}
                <span className="font-mono text-electric-300">{roleLabel(userRole)}</span>.
              </>
            )}
          </p>

          {userRole && (
            <div className="mb-6 p-4 rounded border border-slate-800 bg-navy-950/40 text-left">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-3">
                Access Requirements
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${userRole === 'ADMIN' ? 'bg-red-900/40 text-red-300 border border-red-700/40' : 'bg-slate-800 text-slate-500'}`}>
                    ADMIN
                  </span>
                  <span className="text-slate-500">/licensees, /deploy</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${userRole === 'RESEARCHER' || userRole === 'ADMIN' ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    RESEARCHER
                  </span>
                  <span className="text-slate-500">/patents</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-700/40 text-slate-300 border border-slate-600/50">
                    SUBSCRIBER
                  </span>
                  <span className="text-slate-500">/dashboard</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-2.5 px-4 bg-electric-500 text-white font-medium rounded text-sm hover:bg-electric-400 transition-colors text-center"
            >
              Go to Dashboard
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
          Contact your administrator to request elevated access.
        </p>
      </div>
    </div>
  )
}
