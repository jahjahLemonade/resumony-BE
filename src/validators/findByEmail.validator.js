import Joi from 'joi'

const findByEmailValidator = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

export default findByEmailValidator
