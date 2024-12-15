import {Router} from 'express'
import {
  createResume,
  generateResume,
  getResume,
  getResumes,
  updateResume,
  deleteResume,
} from '../controller/resume.js'
import {validatorMiddleWare} from '../middleware/validator.js'
import {VALIDATOR} from '../validators/constant.js'
import {addFeedBack} from '../controller/feedback.js'
import {verifySubscription} from '../controller/stripe.js'
import {getCurrentUserInfo} from '../controller/profileController.js'
import {paymentMiddleware} from '../middleware/paymentMiddleware.js'
import {addOpenAiKey} from '../controller/openAi.js'
import {sendEmail} from '../controller/sendEmail.js'

const privateRouter = Router()

privateRouter.route('/me').get(getCurrentUserInfo)

privateRouter
  .route('/add-openAi-key')
  .post([validatorMiddleWare(VALIDATOR.ADD_OPEN_AI_KEY)], addOpenAiKey)

// TODO: need to use this router, for validation
privateRouter.route('/verify-subscription').get(verifySubscription)

privateRouter
  .route('/resumes')
  .get(getResumes)
  .post(
    [validatorMiddleWare(VALIDATOR.CREATE_RESUME)],
    paymentMiddleware,
    createResume,
  )

privateRouter
  .route('/resumes/:resumeId')
  .get(getResume)
  .put([validatorMiddleWare(VALIDATOR.EDIT_RESUME)], updateResume)
  .delete(deleteResume)

privateRouter
  .route('/resumes/generate')
  .post(
    [validatorMiddleWare(VALIDATOR.GENERATE_RESUME)],
    paymentMiddleware,
    generateResume,
  )

privateRouter
  .route('/feedback')
  .post([validatorMiddleWare(VALIDATOR.FEEDBACK)], sendEmail)

export default privateRouter
