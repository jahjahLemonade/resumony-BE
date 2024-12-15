import Joi from 'joi'

const verifySubscription = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

export default verifySubscription
