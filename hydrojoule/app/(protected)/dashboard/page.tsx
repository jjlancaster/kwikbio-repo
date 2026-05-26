import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { roleLabel, roleBadgeClass, isAdmin, isResearcher } from '@/lib/rbac'
import type { Role } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/signin')

  const userRole = session.user.role as Role
  const admin = isAdmin(session)
  const researcher = isResearcher(session)

  const navLinks = [
    {
      href: '/patents',
      label: 'Patent Portfolio',
      description: 'View and analyze hydrojoule IP assets',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      allowed: researcher,
      requiredRole: 'RESEARCHER',
    },
    {
      href: '/licensees',
      label: 'Licensee Management',
      description: 'Manage active and prospective licensees',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      allowed: admin,
      requiredRole: 'ADMIN',
    },
    {
      href: '/deploy',
      label: 'Deployment Controls',
      description: 'Terraform deploys and BrainFile management',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
      ),
      allowed: admin,
      requiredRole: 'ADMIN',
    },
  ]

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="border-b border-electric-500/10 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-electric-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs font-mono">HJ</span>
              </div>
              <span className="text-white font-semibold tracking-tight">HYDROJOULE</span>
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 text-sm">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="w-8 h-8 rounded-full border border-slate-700"
              />
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm text-white">{session.user.name ?? session.user.email}</div>
              <div className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono ${roleBadgeClass(userRole)}`}>
                {userRole}
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono border border-slate-800 px-3 py-1.5 rounded hover:border-slate-700"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-2">
            Portal Dashboard
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {session.user.name?.split(' ')[0] ?? 'User'}
          </h1>
          <p className="text-slate-400 text-sm">
            Access level:{' '}
            <span className={`font-mono px-2 py-0.5 rounded ${roleBadgeClass(userRole)}`}>
              {roleLabel(userRole)}
            </span>
          </p>
        </div>

        {/* Role-based content */}
        {admin && (
          <div className="mb-8 p-4 rounded border border-red-700/30 bg-red-900/10">
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Administrator Access Active
            </div>
            <p className="text-red-400/70 text-xs">
              All portal functions are enabled. Deploy actions require Telegram verification.
            </p>
          </div>
        )}

        {/* Navigation cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {navLinks.map((link) => (
            <div key={link.href} className="relative">
              {link.allowed ? (
                <Link
                  href={link.href}
                  className="panel p-5 flex flex-col gap-3 hover:border-electric-500/40 transition-all group block"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-electric-500/10 border border-electric-500/20 flex items-center justify-center text-electric-400 group-hover:bg-electric-500/20 transition-colors">
                      {link.icon}
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-electric-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm mb-1">{link.label}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{link.description}</div>
                  </div>
                  <div className={`self-start px-1.5 py-0.5 rounded text-xs font-mono ${roleBadgeClass(link.requiredRole)}`}>
                    {link.requiredRole}+
                  </div>
                </Link>
              ) : (
                <div className="panel p-5 flex flex-col gap-3 opacity-40 cursor-not-allowed">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                      {link.icon}
                    </div>
                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium text-sm mb-1">{link.label}</div>
                    <div className="text-slate-600 text-xs leading-relaxed">{link.description}</div>
                  </div>
                  <div className={`self-start px-1.5 py-0.5 rounded text-xs font-mono ${roleBadgeClass(link.requiredRole)}`}>
                    {link.requiredRole}+ required
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Account info panel */}
        <div className="panel p-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-4">
            Account Information
          </div>
          <div className="grid sm:grid-cols-2 gap-4 font-mono text-sm">
            {[
              { label: 'email', value: session.user.email ?? '—' },
              { label: 'role', value: userRole ?? '—' },
              { label: 'name', value: session.user.name ?? '—' },
              { label: 'telegram_id', value: (session.user as { telegramId?: string }).telegramId ?? 'not linked' },
            ].map((row) => (
              <div key={row.label} className="flex gap-3">
                <span className="text-electric-400 w-28 flex-shrink-0">{row.label}:</span>
                <span className="text-slate-300 truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
