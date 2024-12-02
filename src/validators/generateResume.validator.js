import Joi from 'joi'

const generateResumeValidator = Joi.object({
  careerSummary: Joi.string().required(),
  companyName: Joi.string().required(),
  workExperience: Joi.string().required(),
  role: Joi.string().required(),
  responsibilities: Joi.string().required(),
  skills: Joi.string().required(),
  qualifications: Joi.string().required(),
})

export default generateResumeValidator
