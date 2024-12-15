import Joi from 'joi'

const createResumeValidator = Joi.object({
  careerSummary: Joi.string().required(),
  companyName: Joi.string().required(),
  workExperience: Joi.string().required(),
  role: Joi.string().required(),
  responsibilities: Joi.string().required(),
  skills: Joi.string().required(),
  qualifications: Joi.string().required(),
  resumeContent: Joi.object({
    blocks: Joi.array().items(Joi.object()).min(1).required(),
    entityMap: Joi.object().required(),
  }),
})

export default createResumeValidator
