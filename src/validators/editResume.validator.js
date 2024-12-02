import Joi from 'joi'

const editResumeValidator = Joi.object({
  resumeContent: Joi.object({
    blocks: Joi.array().items(Joi.object()).min(1).optional(), // If editing, blocks can be optional
    entityMap: Joi.object().optional(), // entityMap can also be optional
  }).optional(), // Make the entire resumeContent optional
})

export default editResumeValidator
