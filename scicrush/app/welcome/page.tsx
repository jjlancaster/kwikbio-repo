'use client'

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { SKILL_LABELS } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function WelcomePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)

  // Generate a referral/member ID for kwiKBio activation
  const kwiKBioMemberId = user ? `SC-${user.uid.slice(0, 8).toUpperCase()}` : null

  const handleLinkKwiKBio = async () => {
    if (!user) return
    setLinking(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        kwiKBioMemberId,
        kwiKBioLinkedAt: new Date().toISOString(),
        platform: 'both',
      })
      setLinked(true)
      toast.success('kwiKBio account linked! 🧬')
    } catch {
      toast.error('Could not link account')
    } finally {
      setLinking(false)
    }
  }

  const isSciCrushEligible = profile?.scicrushEligible

  return (
    <div className="min-h-screen bg-crush-gradient">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* Welcome hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-6xl mb-4">⚗️</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to SciCrush
            {profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}!
          </h1>
          {profile && (
            <div className="inline-flex items-center gap-2 bg-panel border border-border rounded-full px-4 py-1.5 text-sm text-gray-300 mt-2">
              <span>{SKILL_LABELS[profile.skillLevel]}</span>
            </div>
          )}
        </div>

        {/* SciCrush status */}
        <div className={`card p-6 mb-5 ${isSciCrushEligible ? 'border-crush/40 bg-crush/5' : 'border-blue-800/40 bg-blue-900/10'}`}>
          {isSciCrushEligible ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💜</span>
                <h2 className="font-bold text-white">SciCrush matching is active</h2>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                You&apos;re eligible to give Crushes, receive DMs, and join Collaboratory rooms.
                Your contributions are your dating profile — start posting in a campaign to get noticed.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔵</span>
                <h2 className="font-bold text-white">SciCrush matching unlocks at 18+</h2>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                You have full access to campaigns and contributions. Keep building your
                reputation — your thinking is your profile, and it&apos;s already visible.
              </p>
            </>
          )}
        </div>

        {/* kwiKBio link card */}
        <div className="card p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔬</div>
            <div className="flex-1">
              <h2 className="font-bold text-white mb-1">
                {linked ? 'kwiKBio account linked ✅' : 'Activate your kwiKBio / FastScience! account'}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                SciCrush is the front door to <strong className="text-white">kwiKBio</strong> and the{' '}
                <strong className="text-white">FastScience! 5.0</strong> research platform — powered by the
                ARS engine. Link your account to access the full research toolkit.
              </p>

              {linked ? (
                <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3 text-sm text-green-400">
                  <p>Your kwiKBio Member ID: <strong className="font-mono">{kwiKBioMemberId}</strong></p>
                  <p className="mt-1 text-xs text-green-400/70">
                    Use this ID when signing into kwiKBio.com to sync your SciCrush profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-panel rounded-xl px-4 py-3 text-sm text-gray-300">
                    <p className="text-xs text-muted mb-1">Your Member ID will be</p>
                    <p className="font-mono text-crush-light font-semibold">{kwiKBioMemberId}</p>
                  </div>
                  <button
                    onClick={handleLinkKwiKBio}
                    disabled={linking || !user}
                    className="btn-crush py-2.5 px-6 text-sm disabled:opacity-50"
                  >
                    {linking ? 'Linking…' : 'Link kwiKBio account →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skill levels reminder */}
        <div className="card p-6 mb-5">
          <h3 className="font-semibold text-white mb-3 text-sm">The Research Mountain</h3>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            {[
              { icon: '🟢', label: 'Green Circle', sub: 'Beginner', active: profile?.skillLevel === 'green_circle' },
              { icon: '🔵', label: 'Blue Square', sub: 'Novice', active: profile?.skillLevel === 'blue_square' },
              { icon: '◆', label: 'Black Diamond', sub: 'Advanced', active: profile?.skillLevel === 'black_diamond' },
              { icon: '💎', label: 'Sapphire', sub: 'DAO', active: profile?.skillLevel === 'sapphire_hexagon' },
            ].map(({ icon, label, sub, active }) => (
              <div key={label} className={`rounded-xl p-3 border ${active ? 'border-crush/50 bg-crush/10' : 'border-border bg-panel'}`}>
                <div className="text-xl mb-1">{icon}</div>
                <div className={`font-semibold ${active ? 'text-crush-light' : 'text-gray-400'}`}>{label}</div>
                <div className="text-muted">{sub}</div>
                {active && <div className="text-xs text-crush-light mt-1">← You</div>}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/campaigns" className="btn-crush flex-1 text-center py-3.5">
            Enter a Campaign 🧬
          </Link>
          {isSciCrushEligible && (
            <Link href="/subscribe" className="btn-ghost flex-1 text-center py-3.5">
              Unlock messaging — $8/mo
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
