import Joi from 'joi'

const createSubscription = Joi.object({
  customerId: Joi.string().required(),
  priceId: Joi.string().required(),
})

export default createSubscription
