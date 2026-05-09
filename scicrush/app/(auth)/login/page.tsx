'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      router.push('/campaigns')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/campaigns')
    } catch {
      toast.error('Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen bg-crush-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-crush-light">Sci</span>
            <span className="text-white">Crush</span>
          </Link>
          <p className="text-muted mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-8 animate-slide-up space-y-5">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-panel border border-border hover:border-gray-500 text-white font-medium py-3 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@scicrush.ai"
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-crush w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            New to SciCrush?{' '}
            <Link href="/signup" className="text-crush-light hover:underline">
              Join free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
