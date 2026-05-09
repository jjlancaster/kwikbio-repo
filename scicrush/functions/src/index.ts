import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { differenceInYears, parseISO } from 'date-fns'

admin.initializeApp()
const db = admin.firestore()

// ── Age verification trigger ──────────────────────────────────────────────────
// Runs when a new user document is created (from signup flow).
// Re-validates age server-side and corrects skillLevel if client tried to cheat.

export const onUserCreated = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    if (!data?.dob) return

    const age = differenceInYears(new Date(), parseISO(data.dob as string))
    const scicrushEligible = age >= 18

    // Enforce: under-13 → green_circle; 13-17 → max blue_square
    let skillLevel: string = data.skillLevel as string
    if (age < 13) skillLevel = 'green_circle'
    else if (age < 18 && (skillLevel === 'black_diamond' || skillLevel === 'sapphire_hexagon')) {
      skillLevel = 'blue_square'
    }

    if (skillLevel !== data.skillLevel || scicrushEligible !== data.scicrushEligible) {
      await snap.ref.update({ skillLevel, scicrushEligible })
      functions.logger.info(`Age gate corrected uid=${context.params.uid} age=${age} skill=${skillLevel}`)
    }
  })

// ── DM notification trigger ───────────────────────────────────────────────────
// Fires when a new DM is created. Writes a lightweight notification to the
// recipient's subcollection so freemium users see the alert without reading body.

export const onDMCreated = functions.firestore
  .document('dms/{dmId}')
  .onCreate(async (snap, context) => {
    const dm = snap.data()
    if (!dm?.toUid || !dm?.fromName) return

    await db.collection('users').doc(dm.toUid as string).collection('notifications').add({
      type: 'dm',
      dmId: context.params.dmId,
      fromName: dm.fromName,
      preview: dm.preview ?? '',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })

// ── Crush notification trigger ────────────────────────────────────────────────
// Fires when a crush document is created. Notifies the contribution author.

export const onCrushCreated = functions.firestore
  .document('crushes/{crushKey}')
  .onCreate(async (snap) => {
    const crush = snap.data()
    if (!crush?.contribId || !crush?.crusherUid) return

    const contribSnap = await db.collection('contributions').doc(crush.contribId as string).get()
    if (!contribSnap.exists) return

    const contrib = contribSnap.data()!
    if (contrib.authorUid === crush.crusherUid) return // no self-crush notifications

    const crusherSnap = await db.collection('users').doc(crush.crusherUid as string).get()
    const crusherName = crusherSnap.data()?.displayName ?? 'Someone'

    await db.collection('users').doc(contrib.authorUid as string).collection('notifications').add({
      type: 'crush',
      contribId: crush.contribId,
      crusherName,
      campaignId: contrib.campaignId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })
