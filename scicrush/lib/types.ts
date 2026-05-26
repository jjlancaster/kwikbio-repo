export type SkillLevel =
  | 'green_circle'      // 🟢 Beginner Researcher (kids)
  | 'blue_square'       // 🔵 Novice Scientist (13+, no SciCrush)
  | 'black_diamond'     // ◆  Advanced Scientist (18+, SciCrush)
  | 'sapphire_hexagon'  // 💎 CrowdCureDisease DAO (18+, SciCrush top tier)

export type Platform = 'scicrush' | 'kwikbio' | 'climate_cro' | 'both'
export type SignupSource = 'scicrush_direct' | 'kwikbio_direct' | 'climate_cro' | 'referral'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  dob: string                  // ISO date string, stored server-side
  skillLevel: SkillLevel
  scicrushEligible: boolean    // true if age >= 18
  stripeCustomerId?: string
  subscriptions: {
    active: boolean
    [subId: string]: unknown
  }
  lastStripeEvent?: string
  // kwiKBio funnel linkage
  platform: Platform
  signupSource: SignupSource
  kwiKBioMemberId?: string     // set when user formally activates FS!5 account
  kwiKBioLinkedAt?: string
  referralCode?: string        // for tracking SciCrush → kwiKBio conversions
  createdAt: string
}

export interface CollaboratoryRoom {
  id: string
  campaignId: string
  name: string
  hostUid: string
  hostName: string
  livekitRoomName: string      // unique room name for LiveKit
  scheduledAt?: string         // optional scheduled time
  active: boolean
  participantCount: number
  createdAt: string
}

export interface Campaign {
  id: string
  title: string
  tagline: string
  brief: string
  emoji: string
  color: string              // tailwind color class
  contributorCount: number
  createdAt: string
}

export interface Contribution {
  id: string
  campaignId: string
  authorUid: string
  authorName: string
  authorSkillLevel: SkillLevel
  text: string
  link?: string
  crushCount: number
  replyTo?: string           // parent contribution id for threading
  createdAt: string
}

export interface Crush {
  contribId: string
  crusherUid: string
  createdAt: string
}

export interface DirectMessage {
  id: string
  fromUid: string
  fromName: string
  toUid: string
  preview: string            // first 80 chars — visible to freemium
  body: string               // gated by Firestore rules
  read: boolean
  createdAt: string
}

export const SKILL_LABELS: Record<SkillLevel, string> = {
  green_circle: '🟢 Beginner Researcher',
  blue_square: '🔵 Novice Scientist',
  black_diamond: '◆ Advanced Scientist',
  sapphire_hexagon: '💎 CrowdCureDisease DAO',
}

export const SKILL_COLORS: Record<SkillLevel, string> = {
  green_circle: 'text-green-circle',
  blue_square: 'text-blue-square',
  black_diamond: 'text-black-diamond',
  sapphire_hexagon: 'text-sapphire-hex',
}

export const SCICRUSH_ELIGIBLE_LEVELS: SkillLevel[] = ['black_diamond', 'sapphire_hexagon']
