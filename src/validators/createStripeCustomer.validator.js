import Joi from 'joi'

const createStripeCustomer = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

export default createStripeCustomer
