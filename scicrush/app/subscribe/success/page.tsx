'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SubscribeSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to DMs after 4 seconds
    const t = setTimeout(() => router.push('/dms'), 4000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="card p-12 max-w-md text-center animate-fade-in">
          <div className="text-6xl mb-6">💜</div>
          <h1 className="text-3xl font-bold text-white mb-3">You&apos;re in!</h1>
          <p className="text-muted mb-2">
            SciCrush Full is now active on your account.
          </p>
          <p className="text-sm text-muted mb-8">
            Your inbox is waiting. Researchers who crushed your thinking want to connect.
          </p>
          <Link href="/dms" className="btn-crush px-8 py-3">
            Open my messages →
          </Link>
          <p className="text-xs text-muted mt-4">Redirecting automatically…</p>
        </div>
      </div>
    </div>
  )
}
