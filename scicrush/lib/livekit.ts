import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

const apiKey = process.env.LIVEKIT_API_KEY!
const apiSecret = process.env.LIVEKIT_API_SECRET!
const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!

export async function generateRoomToken(
  roomName: string,
  participantName: string,
  participantUid: string,
  isHost = false,
): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantUid,
    name: participantName,
    ttl: '4h',
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
  })

  return at.toJwt()
}

export function getRoomServiceClient(): RoomServiceClient {
  return new RoomServiceClient(livekitUrl, apiKey, apiSecret)
}

export function generateRoomName(campaignId: string, suffix?: string): string {
  const ts = Date.now().toString(36)
  return `scicrush-${campaignId}-${suffix ?? ts}`
}
