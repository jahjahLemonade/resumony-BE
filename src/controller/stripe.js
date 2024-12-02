import Stripe from 'stripe'
import {createResponsePayload} from '../utils/sendResponse.js'
import {
  addOrUpdatePaymentPlan,
  getRecordByIdFromCollection,
} from '../utils/firebase.js'
import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {PAYMENT_TYPE} from '../globalConstants.js'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export const createCustomer = async (req, res, next) => {
  try {
    // Step 1: Search for an existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: req.body.email,
      limit: 1, // Limit to 1 to fetch the first match (if any)
    })

    // Step 2: If a customer exists, return the existing customer
    if (existingCustomers.data.length > 0) {
      const existingCustomer = existingCustomers.data[0]
      return res.json(createResponsePayload(existingCustomer))
    }

    // Step 3: If no customer exists, create a new customer
    const newCustomer = await stripe.customers.create({
      email: req.body.email,
    })
    return res.json(createResponsePayload(newCustomer))
  } catch (error) {
    console.error('Error in customer creation/fetch:', error.message)
    next(error)
  }
}

export const createSubscription = async (req, res, next) => {
  try {
    const {customerId, priceId, mode} = req.body

    // Create a Checkout session for the customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${process.env.CLIENT_PAYMENT_SUCCESS_URL}`,
      cancel_url: `${process.env.CLIENT_PAYMENT_ERROR_URL}`,
      client_reference_id: req?.user?.user_id,
    })
    return res.json(createResponsePayload({sessionId: session.id}))
  } catch (error) {
    next(error)
  }
}

export const checkPaymentStatus = async (req, res, next) => {
  try {
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    )
    // Check the payment status
    const paymentStatus = session.payment_status

    if (paymentStatus === 'paid') {
      return res.json(createResponsePayload({paymentStatus: 'paid'}))
    } else if (paymentStatus === 'unpaid') {
      return res.json(createResponsePayload({paymentStatus: 'unpaid'}))
    } else {
      return res.json(createResponsePayload({paymentStatus: 'unknown'}))
    }
  } catch (error) {
    next(error)
  }
}

export const stripeWebHook = async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event

  try {
    // Verify the event signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_KEY,
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        // Here we will update the user's subscription status
        const userId = session.client_reference_id
        const customerId = session.customer
        const subscriptionId = session.subscription
        const subscription = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : {}

        await addOrUpdatePaymentPlan({
          userId,
          data: {
            subscriptionId,
            subscriptionEndDate: new Date(
              session.mode === 'payment'
                ? new Date().setFullYear(new Date().getFullYear() + 1)
                : subscription.current_period_end * 1000,
            ).toISOString(),
            paymentStatus: 'completed',
            stripeCustomerId: customerId,
            type:
              session.mode === 'payment'
                ? PAYMENT_TYPE.ONE_TIME
                : PAYMENT_TYPE.MONTHLY,
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object

        const userId = failedInvoice.client_reference_id
        const failedUserId = failedInvoice.customer

        addOrUpdatePaymentPlan({
          userId,
          data: {
            stripeCustomerId: customerId,
            paymentStatus: 'failed',
            type:
              failedInvoice.mode === 'payment'
                ? PAYMENT_TYPE.ONE_TIME
                : PAYMENT_TYPE.MONTHLY,
          },
        })
        break
      }

      default:
    }

    res.status(200).send('Event received')
  } catch (err) {
    console.error('Error processing webhook event:', err)
    res.status(400).send(`Webhook error: ${err.message}`)
  }
}

export const verifySubscription = async (req, res, next) => {
  try {
    const {user_id} = req.user

    const paymentInfo = await getRecordByIdFromCollection(
      FIREBASE_COLLECTION.PAYMENTS,
      user_id,
    ) // Replace with your DB query

    // Fetch the customer’s subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: paymentInfo?.stripeCustomerId,
      status: 'all', // You can also filter by 'active', 'canceled', etc.
      limit: 1,
    })

    // If the user has no subscription, they haven't paid
    if (subscriptions.data.length === 0) {
      throw new Error('No subscription found for this user.')
    }

    const subscription = subscriptions.data[0]

    // Check if the subscription is still active
    const currentDate = new Date()
    const expirationDate = new Date(subscription.current_period_end * 1000) // Convert from Unix timestamp

    if (expirationDate > currentDate && subscription.status === 'active') {
      return res.json(createResponsePayload({isActiveSubscription: true}))
    }

    return res.json(createResponsePayload({isActiveSubscription: false}))
  } catch (error) {
    next(error)
  }
}
