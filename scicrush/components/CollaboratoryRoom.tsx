'use client'

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth } from '@/lib/firebase'

interface CollaboratoryRoomProps {
  roomName: string
  campaignId: string
  campaignTitle: string
  onLeave: () => void
}

export default function CollaboratoryRoom({
  roomName,
  campaignId,
  campaignTitle,
  onLeave,
}: CollaboratoryRoomProps) {
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchToken = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken()
        const res = await fetch('/api/livekit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ roomName, campaignId, isHost: false }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setToken(data.token)
        setLivekitUrl(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join room')
      }
    }

    fetchToken()
  }, [user, roomName, campaignId])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 card">
        <div className="text-center">
          <div className="text-rose-400 text-sm mb-3">{error}</div>
          <button onClick={onLeave} className="btn-ghost text-sm py-2 px-4">
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-64 card">
        <div className="text-center text-muted text-sm animate-pulse">
          Connecting to Collaboratory…
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ height: '600px' }}>
      {/* Room header */}
      <div className="bg-panel border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">{campaignTitle} Collaboratory</span>
          <span className="text-xs text-muted font-mono">{roomName}</span>
        </div>
        <button
          onClick={onLeave}
          className="text-xs text-muted hover:text-rose-400 transition-colors"
        >
          Leave room ✕
        </button>
      </div>

      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={onLeave}
        style={{ height: 'calc(100% - 52px)', background: '#11111c' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}

// Lightweight track layout for the campaign page embedded preview
export function CollaboratoryPreview() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false })
  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  )
}
