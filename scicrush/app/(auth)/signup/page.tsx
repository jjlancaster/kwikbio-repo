'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { SkillLevel, SKILL_LABELS, UserProfile } from '@/lib/types'
import { differenceInYears, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const SKILL_OPTIONS: { level: SkillLevel; icon: string; desc: string; minAge: number }[] = [
  { level: 'green_circle',     icon: '🟢', desc: 'Just starting out — curious and eager', minAge: 0  },
  { level: 'blue_square',      icon: '🔵', desc: 'Some science background, ready to contribute', minAge: 13 },
  { level: 'black_diamond',    icon: '◆',  desc: 'Advanced — ready for deep collaboration', minAge: 18 },
  { level: 'sapphire_hexagon', icon: '💎', desc: 'Expert — shaping the CrowdCureDisease DAO', minAge: 18 },
]

function computeSkillLevel(dob: string, selected: SkillLevel): { skillLevel: SkillLevel; scicrushEligible: boolean } {
  const age = differenceInYears(new Date(), parseISO(dob))

  // Enforce age floor for claimed skill level
  const option = SKILL_OPTIONS.find((o) => o.level === selected)!
  let skillLevel: SkillLevel = selected

  if (age < 13) skillLevel = 'green_circle'
  else if (age < 18 && (selected === 'black_diamond' || selected === 'sapphire_hexagon')) {
    skillLevel = 'blue_square'
  }

  return {
    skillLevel,
    scicrushEligible: age >= 18,
  }
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    dob: '',
    skillLevel: 'black_diamond' as SkillLevel,
  })
  const [loading, setLoading] = useState(false)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.displayName || !form.email || !form.password || !form.dob) {
      toast.error('Please fill all fields')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setStep(2)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { skillLevel, scicrushEligible } = computeSkillLevel(form.dob, form.skillLevel)

      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(user, { displayName: form.displayName })

      const profile: UserProfile = {
        uid: user.uid,
        email: form.email,
        displayName: form.displayName,
        dob: form.dob,
        skillLevel,
        scicrushEligible,
        subscriptions: { active: false },
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', user.uid), profile)

      if (scicrushEligible) {
        toast.success('Welcome to SciCrush! 🧬')
        router.push('/campaigns')
      } else {
        toast.success('Welcome to kwiKBio! 🟢')
        router.push('/campaigns')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crush-gradient flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-crush-light">Sci</span>
            <span className="text-white">Crush</span>
          </Link>
          <p className="text-muted mt-2 text-sm">
            {step === 1 ? 'Create your account' : 'Choose your research level'}
          </p>
        </div>

        <div className="card p-8 animate-slide-up">
          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-crush' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Display name</label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Dr. Curious"
                  className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush transition-colors"
                />
              </div>
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
                  placeholder="8+ characters"
                  className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Date of birth
                  <span className="text-xs text-muted ml-2">(required for age verification)</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crush transition-colors"
                />
              </div>
              <button type="submit" className="btn-crush w-full py-3.5 mt-2">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="text-sm text-gray-400 mb-2">
                Pick your trail. Be honest — it shapes your experience.
              </p>
              {SKILL_OPTIONS.map(({ level, icon, desc }) => {
                const age = form.dob
                  ? differenceInYears(new Date(), parseISO(form.dob))
                  : 99
                const opt = SKILL_OPTIONS.find((o) => o.level === level)!
                const disabled = age < opt.minAge
                return (
                  <label
                    key={level}
                    className={`flex items-start gap-4 card p-4 cursor-pointer transition-all duration-150 ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : form.skillLevel === level
                        ? 'border-crush bg-crush/10'
                        : 'hover:border-crush/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="skillLevel"
                      value={level}
                      disabled={disabled}
                      checked={form.skillLevel === level}
                      onChange={() => setForm({ ...form, skillLevel: level })}
                      className="mt-1 accent-violet-500"
                    />
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {icon} {SKILL_LABELS[level]}
                      </div>
                      <div className="text-xs text-muted mt-0.5">{desc}</div>
                      {disabled && (
                        <div className="text-xs text-rose-400 mt-1">
                          Age requirement not met
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}

              {form.dob && differenceInYears(new Date(), parseISO(form.dob)) >= 18 && (
                <div className="text-xs text-green-400 bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3">
                  ✓ SciCrush matching enabled — you can connect with other researchers
                </div>
              )}
              {form.dob && differenceInYears(new Date(), parseISO(form.dob)) < 18 && (
                <div className="text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3">
                  ℹ️ SciCrush matching is available at 18+. You have full access to campaigns and contributions.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 py-3"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-crush flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? 'Creating account…' : 'Join SciCrush 🧬'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted mt-6">
            Already a member?{' '}
            <Link href="/login" className="text-crush-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
