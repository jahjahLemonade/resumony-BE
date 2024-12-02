import Joi from 'joi'

const addOpenAiKeyValidator = Joi.object({
  apiKey: Joi.string().required(),
})

export default addOpenAiKeyValidator
