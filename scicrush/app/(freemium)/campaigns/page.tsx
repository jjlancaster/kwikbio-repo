'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { SEED_CAMPAIGNS } from '@/lib/campaigns'
import { useAuth } from '@/lib/auth-context'

export default function CampaignsPage() {
  const { user, isSciCrushEligible } = useAuth()

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Active Campaigns</h1>
          <p className="text-muted">
            Pick a problem worth crushing. Contribute your thinking. Find your people.
          </p>
          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-2">
              <span>👀</span>
              <span>
                You&apos;re browsing as a guest.{' '}
                <Link href="/signup" className="underline">
                  Join free
                </Link>{' '}
                to contribute.
              </span>
            </div>
          )}
          {user && !isSciCrushEligible && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 bg-blue-900/20 border border-blue-800/40 rounded-xl px-4 py-2">
              <span>🔵</span>
              <span>SciCrush matching unlocks at 18+. Keep contributing — your work speaks.</span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {SEED_CAMPAIGNS.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="card p-6 hover:border-crush/50 hover:bg-panel transition-all duration-200 group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">{c.emoji}</span>
                <span className="text-xs text-muted bg-panel border border-border rounded-full px-2 py-1">
                  Open
                </span>
              </div>
              <h2 className={`text-2xl font-bold mb-1 ${c.color}`}>{c.title}</h2>
              <p className="text-sm font-medium text-gray-300 mb-3">{c.tagline}</p>
              <p className="text-sm text-muted leading-relaxed flex-1">{c.brief}</p>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <span>Contribute your thinking →</span>
                <span className="text-crush-light group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 card p-6 text-center">
          <p className="text-muted text-sm mb-1">More campaigns coming soon</p>
          <p className="text-xs text-muted/60">
            Longevity · Ocean plastics · Quantum error correction · Antibiotic resistance · Urban heat islands
          </p>
        </div>
      </main>
    </div>
  )
}
