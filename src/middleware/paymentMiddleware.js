import createHttpError from 'http-errors'
import {PAYMENT_TYPE} from '../globalConstants.js'
import dayjs from 'dayjs'
import {getRecordByIdFromCollection} from '../utils/firebase.js'
import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'

export const paymentMiddleware = async (req, res, next) => {
  try {
    const paymentInfo = await getRecordByIdFromCollection({
      recordId: req.user.user_id,
      collectionName: FIREBASE_COLLECTION.PAYMENTS,
    })
    if (
      paymentInfo?.paymentStatus === 'completed' &&
      paymentInfo?.subscriptionEndDate &&
      !dayjs().isAfter(paymentInfo?.subscriptionEndDate)
    ) {
      if (paymentInfo?.type === PAYMENT_TYPE.ONE_TIME) {
        // TODO: need to fetch from the backend
        req.user.openAiKey = 'xyz'
        return next()
      } else if (paymentInfo?.type === PAYMENT_TYPE.MONTHLY) {
        req.user.openAiKey = process.env.OPENAI_API_KEY
        return next()
      }
    }
    return next(createHttpError(401, {message: 'Access denied'}))
  } catch (error) {
    return next(createHttpError(401, {message: 'Access denied'}))
  }
}
