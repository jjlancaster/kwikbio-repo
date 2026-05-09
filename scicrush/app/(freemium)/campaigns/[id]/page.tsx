'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, runTransaction, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { getCampaignById } from '@/lib/campaigns'
import { Contribution, SKILL_LABELS, SKILL_COLORS } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, profile, isSciCrushEligible } = useAuth()

  const campaign = getCampaignById(id)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [crushedIds, setCrushedIds] = useState<Set<string>>(new Set())
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!id) return
    const q = query(
      collection(db, 'contributions'),
      where('campaignId', '==', id),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setContributions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contribution)))
    })
    return unsub
  }, [id])

  useEffect(() => {
    if (!user || contributions.length === 0) return
    const fetchCrushes = async () => {
      const crushed = new Set<string>()
      for (const c of contributions) {
        const crushDoc = await getDoc(doc(db, 'crushes', `${c.id}_${user.uid}`))
        if (crushDoc.exists()) crushed.add(c.id)
      }
      setCrushedIds(crushed)
    }
    fetchCrushes()
  }, [user, contributions])

  const handleCrush = async (contribId: string) => {
    if (!user) { router.push('/login'); return }
    if (!isSciCrushEligible) {
      toast.error('SciCrush matching is available at 18+ (Black Diamond or Sapphire level)')
      return
    }
    const crushKey = `${contribId}_${user.uid}`
    const crushRef = doc(db, 'crushes', crushKey)
    const contribRef = doc(db, 'contributions', contribId)

    try {
      await runTransaction(db, async (tx) => {
        const crushSnap = await tx.get(crushRef)
        const contribSnap = await tx.get(contribRef)
        if (!contribSnap.exists()) return

        if (crushSnap.exists()) {
          tx.delete(crushRef)
          tx.update(contribRef, { crushCount: (contribSnap.data().crushCount || 1) - 1 })
          setCrushedIds((prev) => { const next = new Set(prev); next.delete(contribId); return next })
        } else {
          tx.set(crushRef, { contribId, crusherUid: user.uid, createdAt: new Date().toISOString() })
          tx.update(contribRef, { crushCount: (contribSnap.data().crushCount || 0) + 1 })
          setCrushedIds((prev) => new Set([...prev, contribId]))
          toast('💜 Crushed!', { duration: 1500 })
        }
      })
    } catch {
      toast.error('Could not register crush')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) { router.push('/login'); return }
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'contributions'), {
        campaignId: id,
        authorUid: user.uid,
        authorName: profile.displayName,
        authorSkillLevel: profile.skillLevel,
        text: text.trim(),
        crushCount: 0,
        replyTo: replyTo ?? null,
        createdAt: serverTimestamp(),
      })
      setText('')
      setReplyTo(null)
      toast.success('Contribution posted!')
    } catch {
      toast.error('Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-muted">Campaign not found. <Link href="/campaigns" className="text-crush-light underline">Back to campaigns</Link></p>
      </div>
    )
  }

  const topLevel = contributions.filter((c) => !c.replyTo)
  const getReplies = (parentId: string) => contributions.filter((c) => c.replyTo === parentId)

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        {/* Campaign header */}
        <div className="mb-8">
          <Link href="/campaigns" className="text-xs text-muted hover:text-white transition-colors mb-4 inline-block">
            ← All campaigns
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{campaign.emoji}</span>
            <div>
              <h1 className={`text-4xl font-bold ${campaign.color}`}>{campaign.title}</h1>
              <p className="text-gray-400 mt-1">{campaign.tagline}</p>
            </div>
          </div>
          <div className="mt-5 card p-5 text-sm text-gray-300 leading-relaxed">
            {campaign.brief}
          </div>
        </div>

        {/* Contribution composer */}
        {user && profile ? (
          <form onSubmit={handleSubmit} className="card p-5 mb-8">
            {replyTo && (
              <div className="flex items-center justify-between text-xs text-muted bg-panel rounded-lg px-3 py-2 mb-3">
                <span>Replying to a contribution</span>
                <button type="button" onClick={() => setReplyTo(null)} className="hover:text-white">✕</button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Post a hypothesis, finding, rebuttal, or wild idea…"
              rows={3}
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-crush resize-none transition-colors text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted">{SKILL_LABELS[profile.skillLevel]}</span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn-crush py-2 px-5 text-sm disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Contribute ⚗️'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card p-5 mb-8 text-center">
            <p className="text-muted text-sm mb-3">Sign in to contribute to this campaign</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn-ghost text-sm py-2 px-4">Sign in</Link>
              <Link href="/signup" className="btn-crush text-sm py-2 px-4">Join free</Link>
            </div>
          </div>
        )}

        {/* Contributions feed */}
        <div className="space-y-4">
          {topLevel.length === 0 && (
            <div className="text-center text-muted py-16 text-sm">
              No contributions yet. Be the first to post a hypothesis. 🧬
            </div>
          )}
          {topLevel.map((contrib) => (
            <ContributionCard
              key={contrib.id}
              contrib={contrib}
              replies={getReplies(contrib.id)}
              isCrushed={crushedIds.has(contrib.id)}
              onCrush={handleCrush}
              onReply={(id) => {
                setReplyTo(id)
                textareaRef.current?.focus()
              }}
              currentUid={user?.uid}
              isSciCrushEligible={isSciCrushEligible}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function ContributionCard({
  contrib, replies, isCrushed, onCrush, onReply, currentUid, isSciCrushEligible,
}: {
  contrib: Contribution
  replies: Contribution[]
  isCrushed: boolean
  onCrush: (id: string) => void
  onReply: (id: string) => void
  currentUid?: string
  isSciCrushEligible: boolean
}) {
  const isOwn = contrib.authorUid === currentUid

  return (
    <div className="animate-fade-in">
      <div className={`card p-5 ${isOwn ? 'border-crush/20' : ''}`}>
        {/* Author line */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-crush/20 flex items-center justify-center text-sm font-bold text-crush-light">
              {contrib.authorName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{contrib.authorName}</div>
              <div className={`text-xs ${SKILL_COLORS[contrib.authorSkillLevel] ?? 'text-muted'}`}>
                {SKILL_LABELS[contrib.authorSkillLevel]}
              </div>
            </div>
          </div>
          <span className="text-xs text-muted">
            {contrib.createdAt
              ? formatDistanceToNow(
                  typeof contrib.createdAt === 'string'
                    ? new Date(contrib.createdAt)
                    : (contrib.createdAt as { toDate: () => Date }).toDate(),
                  { addSuffix: true }
                )
              : 'just now'}
          </span>
        </div>

        {/* Content */}
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{contrib.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          <button
            onClick={() => onCrush(contrib.id)}
            disabled={isOwn}
            className={`flex items-center gap-1.5 text-sm transition-all duration-150 ${
              isCrushed
                ? 'text-violet-400'
                : 'text-muted hover:text-violet-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={!isSciCrushEligible ? 'Available at 18+ (Black Diamond+)' : isOwn ? 'Cannot crush your own' : ''}
          >
            <span>{isCrushed ? '💜' : '🤍'}</span>
            <span className="font-medium">{contrib.crushCount ?? 0}</span>
            <span className="text-xs">{isCrushed ? 'Crushed' : 'Crush'}</span>
          </button>

          <button
            onClick={() => onReply(contrib.id)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
          >
            <span>💬</span>
            <span>Reply</span>
            {replies.length > 0 && <span>({replies.length})</span>}
          </button>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="card p-4 border-l-2 border-crush/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-crush/10 flex items-center justify-center text-xs font-bold text-crush-light">
                  {reply.authorName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-xs font-semibold text-white">{reply.authorName}</span>
                <span className={`text-xs ${SKILL_COLORS[reply.authorSkillLevel] ?? 'text-muted'}`}>
                  {SKILL_LABELS[reply.authorSkillLevel]}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{reply.text}</p>
              <button
                onClick={() => onCrush(reply.id)}
                disabled={reply.authorUid === currentUid}
                className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                  reply.authorUid === currentUid ? 'text-muted opacity-40' : 'text-muted hover:text-violet-400'
                }`}
              >
                <span>🤍</span>
                <span>{reply.crushCount ?? 0}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
