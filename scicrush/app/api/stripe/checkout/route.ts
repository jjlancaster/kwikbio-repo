import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json()
    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 })
    }

    const userRef = adminDb.doc(`users/${uid}`)
    const userSnap = await userRef.get()
    const userData = userSnap.data()

    let customerId: string = userData?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { uid } })
      customerId = customer.id
      await userRef.update({ stripeCustomerId: customerId })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_SCICRUSH_MONTHLY!,
          quantity: 1,
        },
      ],
      metadata: { uid },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dms?subscribed=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
