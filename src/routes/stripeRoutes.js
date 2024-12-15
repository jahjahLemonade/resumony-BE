import {Router} from 'express'

import {VALIDATOR} from '../validators/constant.js'
import {
  checkPaymentStatus,
  getCustomerPaymentInfo,
  createCustomer,
  createSubscription,
} from '../controller/stripe.js'
import {validatorMiddleWare} from '../middleware/validator.js'

const stripeRouter = Router()

stripeRouter
  .route('/create-customer')
  .post([validatorMiddleWare(VALIDATOR.CREATE_STRIPE_CUSTOMER)], createCustomer)

// Route to create a Stripe  subscription
stripeRouter
  .route('/create-subscription')
  .post(
    [validatorMiddleWare(VALIDATOR.CREATE_SUBSCRIPTION)],
    createSubscription,
  )

stripeRouter.route('/checkPaymentStatus/:sessionId').get([checkPaymentStatus])

stripeRouter
  .route('/getCustomerPaymentInfo/:customerId')
  .get([getCustomerPaymentInfo])

// stripeRouter
//   .route('/verify-subscription')
//   .post(
//     [validatorMiddleWare(VALIDATOR.VERIFY_SUBSCRIPTION)],
//     createSubscription,
//   )

// Verify Subscription Status
// const verifySubscription = async userId => {
//   // Retrieve the user’s Stripe customer ID from your database
// }

// // Example usage
// verifySubscription('user123')
//   .then(result => {
//     if (result.active) {
//
//     } else {
//
//     }
//   })
//   .catch(error => {
//     console.error('Error verifying subscription:', error)
//   })

export default stripeRouter
