'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'

const FEATURES_FREE = [
  'Join all 3 campaigns',
  'Post hypotheses & replies',
  'Give Crushes to great thinking',
  'Receive Crush notifications',
  'See who wants to connect (blurred)',
  'Build your reputation trail',
]

const FEATURES_PAID = [
  'Everything in Free',
  'Read all incoming messages',
  'Send messages to anyone',
  'Full DM inbox + history',
  'Priority in connection recommendations',
  'Support citizen science ⚗️',
]

export default function SubscribePage() {
  const { user, profile, isPaid } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) { window.location.href = '/login'; return }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Unlock{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              SciCrush Full
            </span>
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Your contributions already speak for you. Now let your brilliant matches hear back.
          </p>
        </div>

        {isPaid && (
          <div className="card p-6 mb-8 border-green-800/40 bg-green-900/10 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-green-400 font-semibold">You&apos;re already subscribed!</p>
            <p className="text-muted text-sm mt-1">Full DM access is active on your account.</p>
            <Link href="/dms" className="btn-crush mt-4 inline-block">
              Go to messages →
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free tier */}
          <div className="card p-7">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Free</h2>
              <div className="text-3xl font-extrabold mt-1">$0<span className="text-muted text-base font-normal">/mo</span></div>
            </div>
            <ul className="space-y-3 mb-8">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="text-sm text-muted text-center">Your current plan</div>
          </div>

          {/* Paid tier */}
          <div className="card p-7 border-crush/50 bg-crush/5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs bg-crush text-white px-2.5 py-1 rounded-full font-semibold">
              POPULAR
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">SciCrush Full</h2>
              <div className="text-3xl font-extrabold mt-1 text-crush-light">
                $8<span className="text-muted text-base font-normal">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {FEATURES_PAID.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-200">
                  <span className="text-violet-400 mt-0.5 shrink-0">💜</span>
                  {f}
                </li>
              ))}
            </ul>
            {!isPaid ? (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-crush w-full py-3.5 disabled:opacity-50"
              >
                {loading ? 'Redirecting to checkout…' : 'Subscribe — $8/month →'}
              </button>
            ) : (
              <div className="text-center text-green-400 text-sm font-semibold">Active ✅</div>
            )}
            <p className="text-xs text-muted text-center mt-3">
              Billed monthly · Cancel anytime · Stripe-secured
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-10">
          Revenue funds the ARS engine and citizen science infrastructure.{' '}
          <br className="hidden sm:block" />
          kwiKBio, Inc. · FastScience!5 · USP11282088
        </p>
      </main>
    </div>
  )
}
