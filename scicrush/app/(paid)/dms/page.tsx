'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { DirectMessage } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function DMsPage() {
  const { user, profile, isPaid, isSciCrushEligible } = useAuth()
  const [inbox, setInbox] = useState<DirectMessage[]>([])
  const [selected, setSelected] = useState<DirectMessage | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'dms'),
      where('toUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setInbox(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DirectMessage)))
    })
    return unsub
  }, [user])

  const handleSelect = async (dm: DirectMessage) => {
    if (!isPaid) {
      toast('Subscribe to read messages 💜', { icon: '🔒' })
      return
    }
    setSelected(dm)
    if (!dm.read) {
      await updateDoc(doc(db, 'dms', dm.id), { read: true })
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !selected || !reply.trim()) return
    setSending(true)
    try {
      const body = reply.trim()
      await addDoc(collection(db, 'dms'), {
        fromUid: user.uid,
        fromName: profile.displayName,
        toUid: selected.fromUid,
        preview: body.slice(0, 80),
        body,
        read: false,
        createdAt: serverTimestamp(),
      })
      setReply('')
      toast.success('Message sent!')
    } catch {
      toast.error('Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-void">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted mb-4">Sign in to view your messages</p>
            <Link href="/login" className="btn-crush">Sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isSciCrushEligible) {
    return (
      <div className="min-h-screen bg-void">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="card p-10 max-w-md text-center">
            <div className="text-5xl mb-4">🔵</div>
            <h2 className="text-xl font-bold mb-2">SciCrush messages are 18+</h2>
            <p className="text-muted text-sm">
              Keep contributing to campaigns. Your reputation is building.
              SciCrush matching unlocks at 18 with Black Diamond or Sapphire Hexagon level.
            </p>
            <Link href="/campaigns" className="btn-crush mt-6 inline-block">
              Back to campaigns →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-muted text-sm mt-1">
              {isPaid ? 'Read and reply to your connections' : 'Subscribe to read and send messages'}
            </p>
          </div>
          {!isPaid && (
            <Link href="/subscribe" className="btn-crush text-sm py-2.5 px-5">
              Unlock messages — $8/mo
            </Link>
          )}
        </div>

        {!isPaid && (
          <div className="card p-6 mb-6 border-crush/30 bg-crush/5 text-center">
            <div className="text-4xl mb-3">💜</div>
            <h2 className="font-bold text-lg mb-2">Your brilliance is getting noticed</h2>
            <p className="text-muted text-sm max-w-md mx-auto mb-4">
              You can see when someone wants to connect. Subscribe to read their message and reply.
              Researchers who crush your contributions are waiting to hear back.
            </p>
            <Link href="/subscribe" className="btn-crush px-8 py-3">
              Subscribe for $8/month →
            </Link>
            <p className="text-xs text-muted mt-3">Cancel anytime · Secure payment via Stripe</p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Inbox list */}
          <div className="sm:col-span-1 space-y-2">
            {inbox.length === 0 && (
              <div className="card p-6 text-center text-sm text-muted">
                No messages yet.<br />
                Contribute to campaigns to get noticed.
              </div>
            )}
            {inbox.map((dm) => (
              <button
                key={dm.id}
                onClick={() => handleSelect(dm)}
                className={`w-full text-left card p-4 transition-all duration-150 ${
                  selected?.id === dm.id ? 'border-crush bg-crush/10' : 'hover:border-crush/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{dm.fromName}</span>
                  {!dm.read && (
                    <span className="w-2 h-2 rounded-full bg-crush-light animate-pulse-slow" />
                  )}
                </div>
                {isPaid ? (
                  <p className="text-xs text-muted truncate">{dm.preview}</p>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-crush-light">
                    <span>🔒</span>
                    <span>Subscribe to read</span>
                  </div>
                )}
                <p className="text-xs text-muted/50 mt-1">
                  {dm.createdAt
                    ? formatDistanceToNow(
                        typeof dm.createdAt === 'string'
                          ? new Date(dm.createdAt)
                          : (dm.createdAt as { toDate: () => Date }).toDate(),
                        { addSuffix: true }
                      )
                    : 'just now'}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="sm:col-span-2">
            {selected && isPaid ? (
              <div className="card p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                  <div className="w-10 h-10 rounded-full bg-crush/20 flex items-center justify-center text-crush-light font-bold">
                    {selected.fromName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selected.fromName}</div>
                    <div className="text-xs text-muted">wants to connect</div>
                  </div>
                </div>
                <div className="flex-1 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap mb-6">
                  {selected.body}
                </div>
                <form onSubmit={handleReply} className="border-t border-border pt-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    rows={3}
                    className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush resize-none text-sm"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={sending || !reply.trim()}
                      className="btn-crush py-2 px-5 text-sm disabled:opacity-50"
                    >
                      {sending ? 'Sending…' : 'Reply 💬'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-10 flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center text-muted text-sm">
                  {isPaid ? 'Select a message to read' : (
                    <>
                      <div className="text-4xl mb-3">🔒</div>
                      <p>Subscribe to unlock your inbox</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
