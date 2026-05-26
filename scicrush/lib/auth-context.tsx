'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'
import { UserProfile } from './types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isPaid: boolean
  isSciCrushEligible: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isPaid: false,
  isSciCrushEligible: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
      }
    })
    return unsubAuth
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile)
      }
      setLoading(false)
    })
    return unsubProfile
  }, [user])

  const isPaid = profile?.subscriptions?.active === true
  const isSciCrushEligible = profile?.scicrushEligible === true

  return (
    <AuthContext.Provider value={{ user, profile, loading, isPaid, isSciCrushEligible }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
