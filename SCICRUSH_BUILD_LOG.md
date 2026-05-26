# SciCrush.ai + hydrojoule.ai — Full Build Log
**Session date:** 2026-05-26  
**Repository:** `jjlancaster/kwikbio-repo`  
**Branch:** `claude/hydrojoule-agent-team-t4mXi`  
**Built by:** Claude Code (Anthropic) + parallel subagent

---

## 1. Corporate & IP Structure

```
hydrojoule, LLC  (patent holding company)
├── USP11282088 — FastScience! / ARS (Automated Research System) engine
└── Telehealth patents
        │
        ├── kwiKBio, Inc.  (operator, VT)
        │   ├── FastScience! 5.0 (FS!5) — core research platform
        │   └── SciCrush.ai — marketing funnel → kwiKBio subscribers
        │              (also viable as standalone companion/dating site)
        │
        └── Climate Research Inc.  (licensee/operator)
            └── Climate-CRO — FastScience! flavored for climate research
```

---

## 2. The SciCrush.ai Concept

### Core Insight
**Attraction through demonstrated cognition, not curated appearance.**

SciCrush is a sapiosexual science-companion platform. Members meet inside live collaborative research sessions ("Collaboratory rooms") focused on solving real problems — disease, climate, quantum/ASI. The shared external goal removes first-date awkwardness entirely.

**Attraction signals:** competence, effort, devotion, humor — visible through contribution history, not profile photos.

### The Core Loop
```
JOIN CAMPAIGN → CONTRIBUTE → GET CRUSHED → DM RECEIVED → SUBSCRIBE TO READ/REPLY
```

### Why It's Distinct
| Platform | What it does | What's missing |
|----------|-------------|----------------|
| ResearchGate | Academic collab | No social/dating layer |
| Bumble BFF | Friend finding | No intellectual depth |
| Reddit | Topic communities | No identity, no matching |
| GitHub | Code collab | No discovery of humans |
| Hinge | Dating | No shared mission |

**SciCrush sits in an empty quadrant.**

---

## 3. Skill Level System (Ski Resort Metaphor)

| Symbol | Level | Enum | Age | SciCrush Access |
|--------|-------|------|-----|-----------------|
| 🟢 | Green Circle | `green_circle` | Kids | No |
| 🔵 | Blue Square | `blue_square` | 13+ | No |
| ◆ | Black Diamond | `black_diamond` | 18+ | Yes |
| 💎 | Sapphire Hexagon | `sapphire_hexagon` | 18+ | Yes (DAO top tier) |

- **SciCrush matching, DMs, and Collaboratory rooms** require `black_diamond` or `sapphire_hexagon` + age ≥ 18
- Age is verified **server-side** via Firebase Cloud Function on user creation (prevents client-side spoofing)
- Skill level is self-selected at signup but clamped server-side by age

---

## 4. Full Tech Stack

### SciCrush.ai
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR, file-based routing, fast iteration |
| Auth | Firebase Authentication | Shared with kwiKBio/FS!5 ecosystem |
| Database | Cloud Firestore | Real-time listeners, flexible schema |
| Backend functions | Firebase Cloud Functions (Node 18) | Trigger-based, scales to zero |
| Payments | Stripe Checkout + webhooks | Industry standard, idempotent webhook processing |
| Video rooms | LiveKit (WebRTC) | Open source, self-hostable on Hostinger VPS |
| Hosting | Firebase Hosting → GCS (production) | |

### hydrojoule.ai
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Consistent with SciCrush |
| Auth | NextAuth.js v5 (Auth.js) | RBAC-native, B2B-appropriate |
| Database | PostgreSQL via Prisma | Relational, suits licensee/RBAC data |
| Secrets | Google Cloud Secret Manager | IAM-controlled, no .env secrets in prod |
| Telegram | Bot API via @BotFather | Flash gatekeeper for admin deploy verification |

---

## 5. SciCrush.ai — File Structure

```
scicrush/
├── app/
│   ├── (auth)/
│   │   ├── signup/page.tsx          2-step: credentials + DOB → skill level picker
│   │   └── login/page.tsx           Email + Google OAuth
│   ├── (freemium)/
│   │   └── campaigns/
│   │       ├── page.tsx             Campaign list (3 seed campaigns)
│   │       └── [id]/page.tsx        Contribution thread + Crush signal + Collaboratory
│   ├── (paid)/
│   │   └── dms/page.tsx             DM inbox — preview free, body/reply gated
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts    Creates Stripe session, creates customer if new
│   │   │   └── webhook/route.ts     Idempotent webhook → Firestore entitlement
│   │   └── livekit/route.ts         POST: join room (JWT) / PUT: host creates room
│   ├── subscribe/
│   │   ├── page.tsx                 Pricing page — Free vs SciCrush Full ($8/mo)
│   │   └── success/page.tsx         Post-payment confirmation + redirect
│   ├── welcome/page.tsx             Post-signup: kwiKBio linking, skill level, CTAs
│   ├── layout.tsx                   Root layout + AuthProvider + Toaster
│   ├── page.tsx                     Landing page
│   └── globals.css
├── components/
│   ├── Navbar.tsx                   Fixed nav, role-aware, sign out
│   ├── CollaboratoryRoom.tsx        LiveKit video room UI (VideoConference component)
│   └── CollaboratoryLauncher.tsx    Room list + create/join flow, age gate
├── lib/
│   ├── firebase.ts                  Firebase client SDK init (singleton)
│   ├── firebase-admin.ts            Firebase Admin SDK init (server-side)
│   ├── auth-context.tsx             React context: user, profile, isPaid, isSciCrushEligible
│   ├── types.ts                     All TypeScript interfaces and enums
│   ├── campaigns.ts                 3 seed campaigns: Cure It / Fix Earth / Ride the Wave
│   ├── livekit.ts                   Token generation + RoomServiceClient
│   └── stripe.ts                   (Stripe client — loaded via API routes)
├── functions/
│   └── src/index.ts                 4 Cloud Functions (see below)
├── firestore.rules                  Security rules (see below)
├── firebase.json                    Firebase project config + emulator config
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── .env.local.example
```

---

## 6. SciCrush.ai — Firestore Data Model

```
users/{uid}
  uid: string
  email: string
  displayName: string
  dob: string                       ISO date — age-verified server-side
  skillLevel: SkillLevel            green_circle | blue_square | black_diamond | sapphire_hexagon
  scicrushEligible: boolean         true if age >= 18
  platform: Platform                scicrush | kwikbio | climate_cro | both
  signupSource: SignupSource        scicrush_direct | kwikbio_direct | climate_cro | referral
  kwiKBioMemberId?: string          SC-XXXXXXXX — set on welcome page link action
  kwiKBioLinkedAt?: string
  stripeCustomerId?: string
  subscriptions.active: boolean     THE entitlement flag — only writeable by webhook
  subscriptions.{subId}.status
  subscriptions.{subId}.priceId
  subscriptions.{subId}.current_period_end
  lastStripeEvent: string
  createdAt: string

  notifications/{notifId}           subcollection
    type: 'dm' | 'crush'
    read: boolean
    createdAt: Timestamp

campaigns/{campaignId}              read-only from client; seed data managed via Admin SDK
  title, tagline, brief, emoji, color, contributorCount, createdAt

contributions/{contribId}
  campaignId, authorUid, authorName, authorSkillLevel
  text: string                      max 2000 chars
  crushCount: number
  replyTo?: string                  parent contribId for threading
  createdAt: Timestamp

crushes/{contribId_uid}             composite key prevents double-crush
  contribId, crusherUid, createdAt

dms/{dmId}
  fromUid, fromName, toUid
  preview: string                   first 80 chars — visible to freemium users
  body: string                      GATED — Firestore rules require subscriptions.active
  read: boolean
  createdAt: Timestamp

rooms/{roomId}
  campaignId, name, hostUid, hostName
  livekitRoomName: string           unique LiveKit room identifier
  scheduledAt?: string
  active: boolean
  participantCount: number
  createdAt: Timestamp

room_participants/{docId}           written by Admin SDK on join
  uid, displayName, roomName, campaignId, joinedAt: Timestamp

payments/{eventId}                  Stripe webhook idempotency log — Admin SDK only
  processedAt, eventType
```

---

## 7. SciCrush.ai — Firestore Security Rules (Key Gates)

```javascript
// DMs: body readable only by paid subscribers who are party to the message
match /dms/{dmId} {
  allow read: if isPaid()
    && (request.auth.uid == resource.data.toUid || request.auth.uid == resource.data.fromUid);
  allow create: if isPaid() && isSciCrushEligible()
    && request.resource.data.fromUid == request.auth.uid;
  allow update: if isSignedIn()           // mark as read only
    && request.auth.uid == resource.data.toUid
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
}

// Contributions: readable by anyone; writable only by SciCrush-eligible users
match /contributions/{contribId} {
  allow read: if true;
  allow create: if isSciCrushEligible()
    && request.resource.data.authorUid == request.auth.uid
    && request.resource.data.crushCount == 0
    && request.resource.data.text.size() <= 2000;
  allow update: if isSignedIn()           // crush count only, via transaction
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['crushCount']);
}

// Users: subscriptions field NOT writable by client — webhook only
match /users/{uid} {
  allow update: if isOwner(uid)
    && !request.resource.data.diff(resource.data).affectedKeys()
         .hasAny(['subscriptions', 'stripeCustomerId', 'scicrushEligible']);
}
```

---

## 8. SciCrush.ai — Firebase Cloud Functions

| Function | Trigger | What it does |
|----------|---------|-------------|
| `onUserCreated` | `users/{uid}` onCreate | Re-validates age server-side; corrects `skillLevel` and `scicrushEligible` if client tried to cheat |
| `onDMCreated` | `dms/{dmId}` onCreate | Writes notification to recipient's `notifications` subcollection (freemium alert) |
| `onCrushCreated` | `crushes/{crushKey}` onCreate | Notifies contribution author that someone crushed their post |
| `onRoomParticipantJoined` | `room_participants/{docId}` onCreate | Increments `rooms/{roomId}.participantCount` |

---

## 9. SciCrush.ai — Stripe Subscription Flow

```
User clicks "Subscribe" on /subscribe
  → POST /api/stripe/checkout
    → Creates Stripe Customer (if new), stores stripeCustomerId in Firestore
    → Creates Checkout Session (mode: subscription, price: STRIPE_PRICE_ID_SCICRUSH_MONTHLY)
    → Returns session URL → client redirects to Stripe hosted page

User completes payment on Stripe
  → Stripe fires webhook to /api/stripe/webhook
    → Verifies webhook signature (STRIPE_WEBHOOK_SECRET)
    → Checks payments/{eventId} for idempotency
    → checkout.session.completed → sets subscriptions.active: true
    → customer.subscription.updated → syncs status
    → customer.subscription.deleted → sets subscriptions.active: false
    → Logs event to payments/{eventId}

Firestore listener in auth-context.tsx detects subscriptions.active change
  → isPaid becomes true immediately everywhere in the UI
  → DM body becomes readable, send button activates
```

---

## 10. SciCrush.ai — LiveKit Collaboratory Flow

```
Campaign page loads
  → CollaboratoryLauncher queries rooms where campaignId == id && active == true
  → Real-time listener shows live rooms with participant counts

User clicks "+ New Room" (must be Black Diamond+ / 18+)
  → PUT /api/livekit
    → Verifies Firebase ID token server-side
    → Checks scicrushEligible in Firestore
    → Creates Firestore room document
    → Returns { roomId, livekitRoomName }
  → CollaboratoryLauncher sets activeRoom → renders CollaboratoryRoom

CollaboratoryRoom mounts
  → POST /api/livekit with { roomName, campaignId }
    → Verifies Firebase ID token
    → Generates LiveKit AccessToken (4hr TTL)
    → Logs participant to room_participants collection
    → Returns { token, url }
  → LiveKitRoom connects → VideoConference renders

Cloud Function onRoomParticipantJoined fires
  → Increments rooms/{roomId}.participantCount
  → Visible in real-time to all campaign page viewers
```

---

## 11. SciCrush.ai → kwiKBio Funnel (C)

### Signup flow
1. User signs up on SciCrush → `signupSource: 'scicrush_direct'`, `platform: 'scicrush'`
2. Redirected to `/welcome` (not directly to campaigns)
3. `/welcome` page shows:
   - SciCrush eligibility status
   - kwiKBio account link card with generated Member ID (`SC-XXXXXXXX`)
   - One-click "Link kwiKBio account" → sets `platform: 'both'`, stores `kwiKBioMemberId`
   - Skill level mountain visual
   - CTAs to campaigns + subscription

### Member ID format
```
SC-{first 8 chars of Firebase UID, uppercase}
Example: SC-A1B2C3D4
```

### Platform tracking
```typescript
type Platform = 'scicrush' | 'kwikbio' | 'climate_cro' | 'both'
type SignupSource = 'scicrush_direct' | 'kwikbio_direct' | 'climate_cro' | 'referral'
```

---

## 12. hydrojoule.ai — File Structure

```
hydrojoule/
├── app/
│   ├── (auth)/
│   │   ├── signin/page.tsx          Google OAuth + magic link
│   │   └── error/page.tsx           Auth error handling
│   ├── (protected)/
│   │   ├── dashboard/page.tsx       Role-aware: different content per SUBSCRIBER/RESEARCHER/ADMIN
│   │   ├── patents/page.tsx         Patent portfolio viewer (RESEARCHER+)
│   │   ├── licensees/page.tsx       Licensee management table (ADMIN only)
│   │   └── deploy/page.tsx          Terraform/BrainFile controls + Telegram gate (ADMIN only)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    NextAuth.js v5 handler
│   │   └── deploy/
│   │       ├── verify-telegram/route.ts   Re-verifies Telegram ID before deploy
│   │       └── run/route.ts               Executes deploy action with audit log
│   ├── unauthorized/page.tsx        Access denied page
│   ├── layout.tsx
│   ├── page.tsx                     hydrojoule.ai landing (IP/patent professional theme)
│   └── globals.css
├── lib/
│   ├── auth.ts                      NextAuth config — secrets via getSecret(), role on JWT
│   ├── secrets.ts                   GCP Secret Manager: getSecret() + getCachedSecret()
│   ├── prisma.ts                    Prisma client singleton
│   ├── rbac.ts                      hasRole(), isAdmin(), isResearcher(), rank-based hierarchy
│   └── telegram.ts                  verifyTelegramAdmin(), sendTelegramMessage() audit trail
├── prisma/
│   └── schema.prisma                User (Role enum) + NextAuth tables
├── middleware.ts                    Route protection by role
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

---

## 13. hydrojoule.ai — RBAC System

### Roles (rank-ordered)
```
SUBSCRIBER  → Marketplace, Search
RESEARCHER  → SUBSCRIBER + patent analysis tools (Joule's biomedical tools)
ADMIN       → RESEARCHER + Terraform deployments, BrainFile updates, licensee management
```

### Route protection (middleware.ts)
```
/dashboard/**           → any authenticated role
/patents/**             → RESEARCHER or ADMIN
/licensees/**           → ADMIN only
/deploy/**              → ADMIN only + Telegram re-verification on action
```

### Telegram gatekeeper (Flash integration)
```
On every deploy action:
  1. Verify NextAuth session is valid
  2. Verify session.user.role === ADMIN
  3. Query DB: user.telegramId matches a known Admin
  4. Optionally send Telegram confirmation message
  5. Log action to audit trail
  6. Only then execute deploy
```

---

## 14. hydrojoule.ai — Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(SUBSCRIBER)
  telegramId    String?   // for Flash gatekeeper
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

enum Role {
  SUBSCRIBER
  RESEARCHER
  ADMIN
}

// + standard NextAuth: Account, Session, VerificationToken
```

---

## 15. hydrojoule.ai — GCP Secret Manager

### Secrets stored in GCP (NOT in .env)
| Secret name | Value |
|-------------|-------|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From GCP OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | From GCP OAuth credentials |
| `EMAIL_SERVER_HOST` | e.g. `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | Sending email address |
| `EMAIL_SERVER_PASSWORD` | App password or SendGrid key |
| `EMAIL_FROM` | `noreply@hydrojoule.ai` |
| `TELEGRAM_BOT_TOKEN` | From @BotFather on Telegram |

### Only in .env.local
```
GCP_PROJECT_ID=your-gcp-project-id
DATABASE_URL=postgresql://user:pass@host:5432/hydrojoule
NEXTAUTH_URL=https://hydrojoule.ai
```

### Required IAM role on service account
```
roles/secretmanager.secretAccessor
```

---

## 16. Full Credentials Checklist

### Firebase (SciCrush / kwiKBio shared)
- [ ] Go to console.firebase.google.com
- [ ] Find or create project `kwikbio-prod`
- [ ] Add web app → copy 6 `NEXT_PUBLIC_FIREBASE_*` values
- [ ] Enable Auth → Email/Password + Google sign-in methods
- [ ] Create Firestore database (production mode)
- [ ] Project Settings → Service accounts → Generate private key → copy 3 `FIREBASE_ADMIN_*` values
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`

### Stripe (SciCrush)
- [ ] dashboard.stripe.com → Products → Create "SciCrush Full" at $8/mo recurring → copy `price_` ID
- [ ] Developers → API keys → copy publishable + secret keys
- [ ] Developers → Webhooks → Add endpoint `/api/stripe/webhook` → 3 events → copy signing secret
- [ ] For local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### LiveKit (SciCrush Collaboratory)
- [ ] cloud.livekit.io → Create project → Settings → Keys → copy API key + secret + WSS URL

### PostgreSQL (hydrojoule)
- [ ] Supabase / Railway / Neon → Create DB → copy connection string
- [ ] Run `npx prisma db push` from `hydrojoule/`

### Google OAuth (hydrojoule)
- [ ] console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client
- [ ] Add redirect URI: `https://hydrojoule.ai/api/auth/callback/google`
- [ ] Store client ID + secret in GCP Secret Manager (not .env)

### GCP Secret Manager (hydrojoule)
- [ ] Enable Secret Manager API in GCP console
- [ ] Create each secret listed in Section 15
- [ ] Attach `secretmanager.secretAccessor` role to service account

### Telegram (hydrojoule Flash gatekeeper)
- [ ] Message @BotFather → `/newbot` → copy token → store in Secret Manager as `TELEGRAM_BOT_TOKEN`
- [ ] Message @userinfobot → copy your numeric Telegram user ID
- [ ] Set `telegramId` on your Admin user record in the DB

---

## 17. Recommended Credential Setup Order

```
Priority 1 — Get SciCrush running:
  1. Firebase project (Auth + Firestore + Admin SDK)
  2. Stripe product + price + webhook
  3. LiveKit project

Priority 2 — Get hydrojoule running:
  4. PostgreSQL (Supabase recommended — free tier, instant)
  5. GCP Secret Manager + secrets
  6. Google OAuth credentials

Priority 3 — Admin security layer:
  7. Telegram bot + set telegramId on Admin user
```

---

## 18. Deployment Targets

| Platform | Test | Production |
|----------|------|------------|
| SciCrush.ai | Hostinger VPS (Hydro openclaw resident) | GCS (Google Cloud) |
| hydrojoule.ai | Hostinger VPS | GCS |
| Climate-CRO | TBD | TBD |

### Firebase deploy commands
```bash
cd scicrush
firebase use kwikbio-prod
firebase deploy --only hosting,firestore:rules
firebase deploy --only functions
```

---

## 19. Phase Roadmap

### Phase 1 — MVP (BUILT ✅)
- Auth + age gate + skill level routing
- 3 seed campaigns (Cure It / Fix Earth / Ride the Wave)
- Contribution threads (post + threaded replies)
- Crush signal (atomic, toggle, real-time count)
- DM system (freemium paywall)
- Stripe subscription ($8/mo)
- Firestore security rules
- Firebase Cloud Functions (4)
- LiveKit Collaboratory rooms
- kwiKBio funnel linkage (/welcome + Member ID)
- hydrojoule.ai B2B portal (NextAuth + Prisma + GCP + RBAC + Telegram)

### Phase 2 — Social depth
- User profiles (contribution history IS the profile + optional bio/photo)
- Connection recommendations ("You both crushed the same thread 3x")
- Groups (linked to campaigns/collab projects)
- Posts + comments (FB-style feed within groups)
- LinkedIn-style professional networking layer

### Phase 3 — DAO + full platform
- Sapphire Hexagon CrowdCureDisease DAO mechanics (voting, proposals)
- ARS engine integration (patented research guidance, USP11282088)
- kwiKBio Black Diamond curriculum linkage
- Climate-CRO deployment (FS!5 clone, climate campaigns)
- Match.com-style full profile browsing + search filters
- Mobile app (React Native or PWA)

---

## 20. Key Design Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth for SciCrush | Firebase Auth | Shared with kwiKBio/FS!5 — one user table across ecosystem |
| Auth for hydrojoule | NextAuth.js v5 | B2B portal needs RBAC-native framework + GCP Secret Manager integration |
| Video rooms | LiveKit | Open source, self-hostable on existing Hostinger VPS, no per-minute billing |
| Subscription gate | Server-side Firestore rules | Client cannot grant itself access — only webhook writes `subscriptions.active` |
| Age verification | Double-checked (client + Cloud Function) | Prevents underage users from accessing 18+ features via client manipulation |
| Profile = contributions | No separate profile builder in MVP | Contribution history IS the authentic signal — faster to ship, truer to concept |
| $8/month price | Matches kwiKBio's stated FS!5 pricing | Consistent across ecosystem, positioned as accessible science subscription |
| Skill level = ski resort | Green Circle / Blue Square / Black Diamond / Sapphire Hexagon | Instantly recognizable to 20M+ skiers globally, communicates difficulty without intimidation |

---

*SciCrush.ai — a kwiKBio / FastScience!5 initiative · Powered by ARS engine (USP11282088) · hydrojoule LLC*
