'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type DeployAction = {
  id: string
  label: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  target: string
}

const DEPLOY_ACTIONS: DeployAction[] = [
  {
    id: 'terraform-plan',
    label: 'Terraform Plan',
    description: 'Run terraform plan on the hydrojoule infrastructure repo. No changes applied.',
    severity: 'low',
    target: 'infrastructure/hydrojoule-core',
  },
  {
    id: 'terraform-apply',
    label: 'Terraform Apply',
    description: 'Apply pending infrastructure changes. Requires Telegram verification.',
    severity: 'high',
    target: 'infrastructure/hydrojoule-core',
  },
  {
    id: 'brainfile-update',
    label: 'BrainFile Update',
    description: 'Push updated BrainFile to the ARS engine knowledge store.',
    severity: 'medium',
    target: 'ars-engine/knowledge-store',
  },
  {
    id: 'ars-restart',
    label: 'ARS Engine Restart',
    description: 'Gracefully restart the ARS engine service. Expect ~30s downtime.',
    severity: 'medium',
    target: 'ars-engine/service',
  },
  {
    id: 'db-migrate',
    label: 'Database Migration',
    description: 'Run Prisma migrations against the production PostgreSQL instance.',
    severity: 'critical',
    target: 'postgresql/hydrojoule-prod',
  },
]

const SEVERITY_STYLES = {
  low: { badge: 'bg-slate-800 text-slate-400 border-slate-700', bar: 'bg-slate-600' },
  medium: { badge: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40', bar: 'bg-yellow-500' },
  high: { badge: 'bg-orange-900/40 text-orange-400 border-orange-700/40', bar: 'bg-orange-500' },
  critical: { badge: 'bg-red-900/40 text-red-400 border-red-700/40', bar: 'bg-red-600' },
}

export default function DeployPage() {
  const { data: session, status } = useSession()
  const [telegramId, setTelegramId] = useState('')
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [actionLog, setActionLog] = useState<{ ts: string; action: string; result: string }[]>([])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    redirect('/signin')
  }

  const userRole = (session.user as { role?: string }).role
  if (userRole !== 'ADMIN') {
    redirect('/unauthorized')
  }

  async function handleVerifyTelegram(e: React.FormEvent) {
    e.preventDefault()
    if (!telegramId.trim()) return
    setVerifying(true)
    setVerifyError(null)

    try {
      const res = await fetch('/api/deploy/verify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: telegramId.trim() }),
      })
      const data = await res.json() as { verified?: boolean; error?: string }
      if (res.ok && data.verified) {
        setVerified(true)
      } else {
        setVerifyError(data.error ?? 'Telegram ID not linked to an ADMIN account.')
      }
    } catch {
      setVerifyError('Verification request failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleRunAction(action: DeployAction) {
    if (!verified) return
    setRunningAction(action.id)

    try {
      const res = await fetch('/api/deploy/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: action.id, target: action.target, telegramId }),
      })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }

      setActionLog((prev) => [
        {
          ts: new Date().toISOString(),
          action: action.label,
          result: data.success ? `OK — ${data.message ?? 'completed'}` : `ERROR — ${data.error ?? 'unknown'}`,
        },
        ...prev,
      ])
    } catch {
      setActionLog((prev) => [
        { ts: new Date().toISOString(), action: action.label, result: 'ERROR — network failure' },
        ...prev,
      ])
    } finally {
      setRunningAction(null)
    }
  }

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
            <Link href="/dashboard" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">Dashboard</Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 text-sm">Deploy</span>
          </div>
          <div className="px-2 py-0.5 rounded text-xs font-mono bg-red-900/40 text-red-300 border border-red-700/50">
            ADMIN
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-2">
            Admin Panel
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Deployment Controls</h1>
          <p className="text-slate-400 text-sm">
            Infrastructure management and ARS engine operations.
            All actions are logged and audited.
          </p>
        </div>

        {/* Telegram Verification Gate */}
        <div className={`panel p-6 mb-8 border ${verified ? 'border-green-700/40' : 'border-red-700/30'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${verified ? 'bg-green-900/40 border border-green-700/40' : 'bg-red-900/30 border border-red-700/40'}`}>
              {verified ? (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold mb-1 ${verified ? 'text-green-400' : 'text-red-300'}`}>
                {verified ? 'Telegram Gatekeeper Verified' : 'Telegram Verification Required'}
              </div>
              {verified ? (
                <p className="text-slate-400 text-sm">
                  Identity confirmed. Telegram ID{' '}
                  <span className="font-mono text-electric-300">{telegramId}</span> matches an active ADMIN account.
                  Deploy actions are now unlocked.
                </p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">
                    Enter your linked Telegram user ID to verify your identity before running any deploy action.
                    Your Telegram ID must be associated with your ADMIN account.
                  </p>
                  {verifyError && (
                    <div className="mb-4 px-3 py-2 rounded border border-red-700/40 bg-red-900/20 text-red-300 text-xs font-mono">
                      {verifyError}
                    </div>
                  )}
                  <form onSubmit={handleVerifyTelegram} className="flex gap-3">
                    <input
                      type="text"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      placeholder="e.g. 123456789"
                      className="flex-1 px-3 py-2 rounded border border-slate-700 bg-navy-950/60 text-white placeholder-slate-600 text-sm font-mono focus:border-electric-500 focus:outline-none"
                      disabled={verifying}
                    />
                    <button
                      type="submit"
                      disabled={verifying || !telegramId.trim()}
                      className="px-4 py-2 bg-electric-500 text-white text-sm font-medium rounded hover:bg-electric-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifying && (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Deploy Actions */}
        <div className="mb-8">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-4">
            Available Actions
          </div>
          <div className="space-y-3">
            {DEPLOY_ACTIONS.map((action) => {
              const style = SEVERITY_STYLES[action.severity]
              const isRunning = runningAction === action.id
              return (
                <div key={action.id} className="panel p-5 flex items-center gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{action.label}</span>
                      <span className={`px-1.5 py-0.5 rounded border text-xs font-mono ${style.badge}`}>
                        {action.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{action.description}</p>
                    <div className="text-slate-600 text-xs font-mono mt-1">
                      target: {action.target}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunAction(action)}
                    disabled={!verified || runningAction !== null}
                    className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded border transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2
                      border-electric-500/40 text-electric-300 hover:bg-electric-500/10 disabled:border-slate-700 disabled:text-slate-600"
                  >
                    {isRunning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                        </svg>
                        Run
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Log */}
        <div className="panel overflow-hidden">
          <div className="border-b border-electric-500/10 px-5 py-3 bg-navy-950/30 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              Audit Log — Session
            </div>
            <div className="text-xs font-mono text-slate-600">{actionLog.length} entries</div>
          </div>
          <div className="p-4 font-mono text-xs min-h-[120px]">
            {actionLog.length === 0 ? (
              <div className="text-slate-700 py-4 text-center">
                No actions executed this session.
              </div>
            ) : (
              <div className="space-y-1.5">
                {actionLog.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-slate-600 flex-shrink-0">{entry.ts}</span>
                    <span className="text-electric-300">[{entry.action}]</span>
                    <span className={entry.result.startsWith('OK') ? 'text-green-400' : 'text-red-400'}>
                      {entry.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
