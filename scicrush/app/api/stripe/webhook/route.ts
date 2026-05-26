import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency — skip already-processed events
  const eventRef = adminDb.doc(`payments/${event.id}`)
  const existing = await eventRef.get()
  if (existing.exists) {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Subscription | Stripe.CheckoutSession
  const uid = (session.metadata as Record<string, string>)?.uid

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.CheckoutSession
        const subId = checkoutSession.subscription as string
        const sub = await stripe.subscriptions.retrieve(subId)
        if (uid) {
          await adminDb.doc(`users/${uid}`).update({
            [`subscriptions.active`]: true,
            [`subscriptions.${subId}.status`]: sub.status,
            [`subscriptions.${subId}.priceId`]: sub.items.data[0]?.price.id,
            [`subscriptions.${subId}.current_period_end`]: new Date(sub.current_period_end * 1000),
            lastStripeEvent: event.type,
            skillLevel: 'black_diamond', // Ensure paid users are at minimum Black Diamond
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(sub.customer as string)
        const customerUid = (customer as Stripe.Customer).metadata?.uid ?? uid
        if (customerUid) {
          const isActive = sub.status === 'active' || sub.status === 'trialing'
          await adminDb.doc(`users/${customerUid}`).update({
            [`subscriptions.active`]: isActive,
            [`subscriptions.${sub.id}.status`]: sub.status,
            [`subscriptions.${sub.id}.current_period_end`]: new Date(sub.current_period_end * 1000),
            lastStripeEvent: event.type,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(sub.customer as string)
        const customerUid = (customer as Stripe.Customer).metadata?.uid ?? uid
        if (customerUid) {
          await adminDb.doc(`users/${customerUid}`).update({
            'subscriptions.active': false,
            [`subscriptions.${sub.id}.status`]: 'canceled',
            lastStripeEvent: event.type,
          })
        }
        break
      }
    }

    // Log processed event for idempotency
    await eventRef.set({
      processedAt: new Date().toISOString(),
      eventType: event.type,
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
