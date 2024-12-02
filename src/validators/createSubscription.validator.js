import Joi from 'joi'

const createSubscription = Joi.object({
  customerId: Joi.string().required(),
  priceId: Joi.string().required(),
  mode: Joi.string().required(),
})

export default createSubscription
