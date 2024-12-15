import {VALIDATOR} from './constant.js'
import createResumeValidator from './createResume.validator.js'
import editResumeValidator from './editResume.validator.js'
import generateResumeValidator from './generateResume.validator.js'
import feedbackValidator from './feedback.validator.js'
import findByEmailValidator from './findByEmail.validator.js'
import createStripeCustomer from './createStripeCustomer.validator.js'
import createSubscription from './createSubscription.validator.js'
import verifySubscription from './verifySubscription.validator.js'
import addOpenAiKeyValidator from './addOpenAiKey.validator.js'

export default {
  [VALIDATOR.CREATE_RESUME]: createResumeValidator,
  [VALIDATOR.EDIT_RESUME]: editResumeValidator,
  [VALIDATOR.GENERATE_RESUME]: generateResumeValidator,
  [VALIDATOR.FIND_BY_EMAIL]: findByEmailValidator,
  [VALIDATOR.FEEDBACK]: feedbackValidator,
  [VALIDATOR.CREATE_STRIPE_CUSTOMER]: createStripeCustomer,
  [VALIDATOR.CREATE_SUBSCRIPTION]: createSubscription,
  [VALIDATOR.VERIFY_SUBSCRIPTION]: verifySubscription,
  [VALIDATOR.ADD_OPEN_AI_KEY]: addOpenAiKeyValidator,
}
