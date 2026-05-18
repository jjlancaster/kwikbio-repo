import { NextRequest, NextResponse } from 'next/server'
import { generateRoomToken } from '@/lib/livekit'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { serverTimestamp } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const userSnap = await adminDb.doc(`users/${uid}`).get()
    const user = userSnap.data()

    if (!user?.scicrushEligible) {
      return NextResponse.json({ error: 'SciCrush eligibility required' }, { status: 403 })
    }

    const { roomName, campaignId, isHost } = await req.json()
    if (!roomName || !campaignId) {
      return NextResponse.json({ error: 'Missing roomName or campaignId' }, { status: 400 })
    }

    const token = await generateRoomToken(roomName, user.displayName, uid, isHost === true)

    // Log room participation in Firestore
    await adminDb.collection('room_participants').add({
      uid,
      displayName: user.displayName,
      roomName,
      campaignId,
      joinedAt: serverTimestamp(),
    })

    return NextResponse.json({
      token,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    })
  } catch (err) {
    console.error('LiveKit token error:', err)
    return NextResponse.json({ error: 'Token generation failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  // Host creates a new room and registers it in Firestore
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const userSnap = await adminDb.doc(`users/${uid}`).get()
    const user = userSnap.data()

    if (!user?.scicrushEligible) {
      return NextResponse.json({ error: 'SciCrush eligibility required' }, { status: 403 })
    }

    const { campaignId, name, scheduledAt } = await req.json()
    const ts = Date.now().toString(36)
    const livekitRoomName = `scicrush-${campaignId}-${ts}`

    const roomRef = await adminDb.collection('rooms').add({
      campaignId,
      name: name ?? `${user.displayName}'s Collaboratory`,
      hostUid: uid,
      hostName: user.displayName,
      livekitRoomName,
      scheduledAt: scheduledAt ?? null,
      active: true,
      participantCount: 0,
      createdAt: serverTimestamp(),
    })

    return NextResponse.json({ roomId: roomRef.id, livekitRoomName })
  } catch (err) {
    console.error('Room creation error:', err)
    return NextResponse.json({ error: 'Room creation failed' }, { status: 500 })
  }
}
