import Joi from 'joi'

const feedbackValidator = Joi.object({
  message: Joi.string().required(),
})

export default feedbackValidator
