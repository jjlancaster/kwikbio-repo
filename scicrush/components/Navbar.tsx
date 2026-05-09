'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { SKILL_LABELS } from '@/lib/types'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, isPaid } = useAuth()

  const handleSignOut = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-void/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">⚗️</span>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-crush-light">Sci</span>
            <span className="text-white">Crush</span>
            <span className="text-crush-light text-xs align-top">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && profile ? (
            <>
              <Link href="/campaigns" className="text-sm text-gray-400 hover:text-white transition-colors">
                Campaigns
              </Link>
              <Link href="/dms" className="text-sm text-gray-400 hover:text-white transition-colors relative">
                Messages
                {!isPaid && (
                  <span className="ml-1 text-xs text-crush-light">PRO</span>
                )}
              </Link>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <span className="text-xs text-muted">
                  {SKILL_LABELS[profile.skillLevel]}
                </span>
                {isPaid && (
                  <span className="text-xs bg-crush/20 text-crush-light border border-crush/30 px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted hover:text-rose-400 transition-colors ml-1"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm py-2 px-4">
                Sign in
              </Link>
              <Link href="/signup" className="btn-crush text-sm py-2 px-4">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
