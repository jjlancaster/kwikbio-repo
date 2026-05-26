'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { CollaboratoryRoom as RoomType } from '@/lib/types'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CollaboratoryRoom = dynamic(() => import('./CollaboratoryRoom'), { ssr: false })

interface Props {
  campaignId: string
  campaignTitle: string
}

export default function CollaboratoryLauncher({ campaignId, campaignTitle }: Props) {
  const { user, isSciCrushEligible } = useAuth()
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      where('campaignId', '==', campaignId),
      where('active', '==', true)
    )
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoomType)))
    })
    return unsub
  }, [campaignId])

  const handleCreateRoom = async () => {
    if (!user) { window.location.href = '/login'; return }
    if (!isSciCrushEligible) {
      toast.error('Collaboratory rooms require Black Diamond or Sapphire level (18+)')
      return
    }
    setCreating(true)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/livekit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ campaignId, name: `${campaignTitle} Room` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Optimistically enter the room we just created
      setActiveRoom({
        id: data.roomId,
        campaignId,
        name: `${campaignTitle} Room`,
        hostUid: user.uid,
        hostName: user.displayName ?? 'Host',
        livekitRoomName: data.livekitRoomName,
        active: true,
        participantCount: 1,
        createdAt: new Date().toISOString(),
      })
      toast.success('Collaboratory room created!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinRoom = (room: RoomType) => {
    if (!user) { window.location.href = '/login'; return }
    if (!isSciCrushEligible) {
      toast.error('Collaboratory rooms require Black Diamond or Sapphire level (18+)')
      return
    }
    setActiveRoom(room)
  }

  if (activeRoom) {
    return (
      <CollaboratoryRoom
        roomName={activeRoom.livekitRoomName}
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        onLeave={() => setActiveRoom(null)}
      />
    )
  }

  return (
    <div className="card p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span>🎙️</span> Collaboratory Rooms
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Live video sessions — meet the minds behind the posts
          </p>
        </div>
        {isSciCrushEligible ? (
          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="btn-crush text-xs py-2 px-4 disabled:opacity-50"
          >
            {creating ? 'Starting…' : '+ New Room'}
          </button>
        ) : (
          <Link href="/signup" className="text-xs text-crush-light hover:underline">
            18+ to host →
          </Link>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted">
          No live rooms right now.{' '}
          {isSciCrushEligible
            ? 'Start one and invite collaborators.'
            : 'Check back or join at 18+ to start one.'}
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between bg-panel rounded-xl px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {room.name}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Hosted by {room.hostName} · {room.participantCount} in room
                </div>
              </div>
              <button
                onClick={() => handleJoinRoom(room)}
                className="btn-crush text-xs py-1.5 px-4"
              >
                Join →
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted mt-4 text-center">
        Video powered by LiveKit · End-to-end encrypted
      </p>
    </div>
  )
}
